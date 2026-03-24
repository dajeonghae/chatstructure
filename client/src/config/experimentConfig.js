// Google Apps Script Web App URL
// 설정 방법:
// 1. Google Apps Script (script.google.com)에서 새 프로젝트 생성
// 2. 아래 코드 붙여넣기 후 배포 → 웹 앱으로 배포 (누구나 접근 가능)
// 3. 배포 URL을 GOOGLE_SCRIPT_URL에 입력
//
// ── Apps Script 코드 ──────────────────────────────────────
// function doPost(e) {
//   var ss = SpreadsheetApp.openById('YOUR_SPREADSHEET_ID');
//   var raw = e.postData.contents;
//   var data = JSON.parse(raw);
//
//   var summarySheet = ss.getSheetByName('Summary') || ss.insertSheet('Summary');
//   if (summarySheet.getLastRow() === 0) {
//     summarySheet.appendRow(['참여자', '로그인시각', '종료시각', '노드상호작용', '인덱스상호작용', '대화수']);
//   }
//   summarySheet.appendRow([
//     data.participantId, data.loginTime, data.endTime,
//     data.nodeInteractions, data.indexInteractions, data.messages.length
//   ]);
//
//   var msgSheet = ss.getSheetByName('Messages') || ss.insertSheet('Messages');
//   if (msgSheet.getLastRow() === 0) {
//     msgSheet.appendRow(['참여자', '대화번호', '사용자텍스트', '사용자토큰', 'AI텍스트', 'AI토큰']);
//   }
//   data.messages.forEach(function(msg) {
//     msgSheet.appendRow([
//       data.participantId, msg.dialogNumber,
//       msg.userText, msg.userTokens,
//       msg.assistantText, msg.assistantTokens
//     ]);
//   });
//
//   return ContentService.createTextOutput(JSON.stringify({ status: 'ok' }))
//     .setMimeType(ContentService.MimeType.JSON);
// }
// ──────────────────────────────────────────────────────────

// 배포 후 https://script.google.com/macros/s/XXXXX/exec 형태의 URL로 교체하세요
export const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyM3h2xAs-dg_Tk-ygolCVKpkYnPPyF4Zb_n5Cu9G4VFzu8S4rjDkIB5lqvaCUAR_aD/exec';
