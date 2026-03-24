import { GOOGLE_SCRIPT_URL } from '../config/experimentConfig.js';

const KEY = 'experiment_tracking';

const estimateTokens = (text = '') => {
  if (!text) return 0;
  const cjkRegex = /[\u1100-\u11FF\u3130-\u318F\uAC00-\uD7AF\u3040-\u30FF\u31F0-\u31FF\u3400-\u9FFF]/g;
  const cjkCount = (text.match(cjkRegex) || []).length;
  const nonCjkCount = text.length - cjkCount;
  return cjkCount + Math.ceil(nonCjkCount / 4);
};

export const initTracking = (participantId) => {
  const existing = getTracking();
  if (existing?.participantId === participantId) return;
  localStorage.setItem(KEY, JSON.stringify({
    participantId,
    loginTime: new Date().toISOString(),
    messages: [],
    nodeInteractions: 0,
    indexInteractions: 0,
  }));
};

export const getTracking = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || null; }
  catch { return null; }
};

export const trackMessage = (dialogNumber, userText, assistantText) => {
  const data = getTracking();
  if (!data) return;
  if (data.messages.some((m) => m.dialogNumber === dialogNumber)) return;
  data.messages.push({
    dialogNumber,
    userText,
    userTokens: estimateTokens(userText),
    assistantText: assistantText || '',
    assistantTokens: estimateTokens(assistantText),
  });
  localStorage.setItem(KEY, JSON.stringify(data));
};

export const trackNodeInteraction = () => {
  const data = getTracking();
  if (!data) return;
  data.nodeInteractions += 1;
  localStorage.setItem(KEY, JSON.stringify(data));
};

export const trackIndexInteraction = () => {
  const data = getTracking();
  if (!data) return;
  data.indexInteractions += 1;
  localStorage.setItem(KEY, JSON.stringify(data));
};

export const clearTracking = () => {
  localStorage.removeItem(KEY);
};

const saveLocalJson = (payload) => {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `experiment_${payload.participantId}_${payload.endTime.replace(/[:.]/g, '-')}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const submitExperimentData = async () => {
  const data = getTracking();
  if (!data) return;

  const payload = {
    ...data,
    endTime: new Date().toISOString(),
  };

  // 로컬 JSON 다운로드
  saveLocalJson(payload);

  // Google Sheets 전송
  console.log('[tracking] 전송할 데이터:', payload);
  if (GOOGLE_SCRIPT_URL) {
    try {
      console.log('[tracking] Google Sheets 전송 시작...');
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(payload),
      });
      console.log('[tracking] 전송 완료');
    } catch (err) {
      console.error('[tracking] Google Sheets 전송 실패:', err);
    }
  } else {
    console.warn('[tracking] GOOGLE_SCRIPT_URL이 설정되지 않았습니다.');
  }
};
