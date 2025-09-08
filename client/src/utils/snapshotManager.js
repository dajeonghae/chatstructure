// src/utils/snapshotManager.js
// 스냅샷(그래프+대화) 전체 저장/복원 유틸 + 서버 API 연동

import axios from "axios";
import { resetState, setCurrentScrolledDialog } from "../redux/slices/nodeSlice";

/** 스냅샷 스키마 버전 */
export const SNAPSHOT_VERSION = "1.1.0";

/** 스냅샷 생성: Redux node slice + messages 를 통째로 수집 */
export function buildFullSnapshot(reduxState, messages) {
  const node = reduxState.node;
  return {
    version: SNAPSHOT_VERSION,
    createdAt: Date.now(),
    app: {
      node: {
        nodes: node.nodes,
        activeNodeIds: node.activeNodeIds,
        activeDialogNumbers: node.activeDialogNumbers,
        dialogCount: node.dialogCount,
        currentScrolledDialog: node.currentScrolledDialog ?? null,
        nodeColors: node.nodeColors ?? {},
      },
    },
    messages, // [{role, content, nodeId, number}, ...]
  };
}

/** 스냅샷 최소 요건 검증 + 간단한 타입 체크 */
export function validateFullSnapshot(obj) {
  if (!obj || typeof obj !== "object") return "Invalid snapshot object";
  if (!obj.version || !obj.app || !obj.app.node || !Array.isArray(obj.messages)) {
    return "Missing required fields (version/app.node/messages)";
  }
  const n = obj.app.node;
  const must = ["nodes", "activeNodeIds", "activeDialogNumbers", "dialogCount"];
  for (const k of must) {
    if (!(k in n)) return `Missing node.${k}`;
  }
  if (typeof n.nodes !== "object") return "node.nodes must be an object";
  return null;
}

/** 부모-자식 역참조/누락 필드 보정, 고아 자식 제거 등 가벼운 일관성 정리 */
export function hydrateGraphShape(snapshot) {
  const s = structuredClone(snapshot);
  const nodes = s.app.node.nodes;

  // 1) 기본 필드 보정
  for (const [id, node] of Object.entries(nodes)) {
    node.id = node.id ?? id;
    node.children = Array.isArray(node.children) ? node.children : [];
    node.parent = node.parent ?? null;
    node.relation = node.relation ?? null;
    node.dialog = node.dialog ?? {};
    node.keywords = Array.isArray(node.keywords) ? node.keywords : [];
    node.simStats = node.simStats ?? null;
    node.centroid = node.centroid ?? null;
    node.count = Number.isFinite(node.count) ? node.count : 0;
  }

  // 2) 존재하지 않는 부모/자식 참조 정리
  for (const [, node] of Object.entries(nodes)) {
    node.children = node.children.filter((cid) => !!nodes[cid]);
    if (node.parent && !nodes[node.parent]) node.parent = null;
  }

  // 3) 부모-자식 역참조 정합성 맞추기
  for (const [id, node] of Object.entries(nodes)) {
    if (node.parent && nodes[node.parent]) {
      const p = nodes[node.parent];
      if (!p.children.includes(id)) p.children.push(id);
      p.children = Array.from(new Set(p.children));
    }
  }

  // 4) activeNodeIds/activeDialogNumbers 정합성
  const activeDialogs = s.app.node.activeDialogNumbers.filter((n) => Number.isInteger(n) && n > 0);
  s.app.node.activeDialogNumbers = Array.from(new Set(activeDialogs)).sort((a, b) => a - b);

  const activeNodeIds = s.app.node.activeNodeIds.filter((nid) => !!nodes[nid]);
  s.app.node.activeNodeIds = Array.from(new Set(activeNodeIds));

  // 5) currentScrolledDialog 보정
  const lastActive = s.app.node.activeDialogNumbers[s.app.node.activeDialogNumbers.length - 1] ?? null;
  if (!s.app.node.currentScrolledDialog || !s.app.node.activeDialogNumbers.includes(s.app.node.currentScrolledDialog)) {
    s.app.node.currentScrolledDialog = lastActive;
  }

  // 6) dialogCount 보정(다음 번호)
  const maxDialogNo = (() => {
    let mx = 0;
    for (const node of Object.values(nodes)) {
      for (const k of Object.keys(node.dialog ?? {})) {
        const n = Number(k);
        if (Number.isInteger(n)) mx = Math.max(mx, n);
      }
    }
    return mx + 1;
  })();

  if (!Number.isInteger(s.app.node.dialogCount) || s.app.node.dialogCount <= maxDialogNo) {
    s.app.node.dialogCount = maxDialogNo;
  }

  return s;
}

/* ============================= */
/* ① 브라우저 다운로드/업로드 방식 */
/* ============================= */

/** (클라) 파일 다운로드 (이름 자동 타임스탬프) */
export function downloadSnapshotFile(snapshot, filename) {
  const ts = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const stamp = `${ts.getFullYear()}${pad(ts.getMonth()+1)}${pad(ts.getDate())}-${pad(ts.getHours())}${pad(ts.getMinutes())}${pad(ts.getSeconds())}`;
  const finalName = filename || `chatgraph-snapshot-${stamp}.json`;

  const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = finalName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** (클라) 파일 읽기 */
export function readSnapshotFile(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => {
      try {
        resolve(JSON.parse(fr.result));
      } catch (e) {
        reject(new Error("JSON parse failed"));
      }
    };
    fr.onerror = () => reject(new Error("File read failed"));
    fr.readAsText(file);
  });
}

/** (클라) 스냅샷 로드(리덕스에 반영 + 메시지 반환) */
export function loadSnapshotThunk(fileOrObject) {
  return async (dispatch) => {
    try {
      const raw = fileOrObject instanceof File ? await readSnapshotFile(fileOrObject) : fileOrObject;

      const err = validateFullSnapshot(raw);
      if (err) throw new Error("❌ 스냅샷 파일 형식 오류: " + err);

      const hydrated = hydrateGraphShape(raw);
      const nodePayload = hydrated.app.node;

      dispatch(resetState(nodePayload));

      const messages = Array.isArray(hydrated.messages) ? hydrated.messages : [];
      if (nodePayload.currentScrolledDialog) {
        dispatch(setCurrentScrolledDialog(nodePayload.currentScrolledDialog));
      }
      return { messages };
    } catch (e) {
      console.error(e);
      throw e;
    }
  };
}

/* =================================== */
/* ② 서버 API(프로젝트 폴더) 연동 방식 */
/* =================================== */

/** 서버(예: http://localhost:8080)에 저장 → 프로젝트 폴더에 JSON 생성 */
export async function saveSnapshotToProject(snapshot, name) {
  const { data } = await axios.post("http://localhost:8080/api/snapshots/save", {
    name, // 생략 시 서버에서 타임스탬프 파일명 생성
    snapshot,
  });
  return data; // { ok: true, filename }
}

/** 서버에서 스냅샷 목록 가져오기 */
export async function listProjectSnapshots() {
  const { data } = await axios.get("http://localhost:8080/api/snapshots/list");
  return data.files; // [{ name, size, mtime }, ...] (최신순)
}

/** 서버에서 특정 파일명으로 스냅샷 로드하여 리덕스 반영 */
export function loadSnapshotFromProjectThunk(filename) {
  return async (dispatch) => {
    const { data } = await axios.get("http://localhost:8080/api/snapshots/get", {
      params: { filename },
    });
    const raw = data.snapshot;

    const err = validateFullSnapshot(raw);
    if (err) throw new Error(err);

    const hydrated = hydrateGraphShape(raw);
    const nodePayload = hydrated.app.node;

    dispatch(resetState(nodePayload));

    const messages = Array.isArray(hydrated.messages) ? hydrated.messages : [];
    if (nodePayload.currentScrolledDialog) {
      dispatch(setCurrentScrolledDialog(nodePayload.currentScrolledDialog));
    }
    return { messages };
  };
}
