/**
 * 인간공학 실험용 Apps Script
 *
 * 사용 방법:
 * 1. https://sheets.new 에서 새 시트 생성
 * 2. 다음 탭들을 만들어 헤더 행 입력:
 *    - passages    : passage_id, text
 *    - questions   : question_id, set, topic, passage_id, question_text
 *    - chunks      : question_id, chunk_order, title, body, transition
 *    - bluf        : question_id, bullet_1, bullet_2, bullet_3
 *    - analogy     : question_id, analogy_text
 *    - quiz        : question_id, q_order, question_text, answer_key
 *    - responses   : (헤더는 자동 입력됨. 첫 응답이 들어올 때 한 번만)
 * 3. 확장 프로그램 > Apps Script 클릭
 * 4. 이 파일 내용을 그대로 붙여넣기 + 저장
 * 5. (선택) 변수 DASHBOARD_PASSWORD 값을 본인이 정한 비밀번호로 바꾸기
 * 6. 배포 > 새 배포 > 유형: 웹 앱
 *    - 다음 사용자 인증: 나
 *    - 액세스 권한: 모든 사용자
 *    → 발급된 웹앱 URL을 복사
 */

// ⚠ 대시보드 접근 비밀번호. 본인이 정한 값으로 바꾸세요.
//    Vercel 환경변수 DASHBOARD_PASSWORD에도 동일한 값을 넣으세요.
const DASHBOARD_PASSWORD = "change-me-please";

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || "content";

  if (action === "responses") {
    return getResponses(e);
  }
  return getContent();
}

function getContent() {
  const ss = SpreadsheetApp.getActive();
  const result = {};
  ["passages", "questions", "chunks", "bluf", "analogy", "quiz"].forEach((name) => {
    const sheet = ss.getSheetByName(name);
    if (!sheet) {
      result[name] = [];
      return;
    }
    const values = sheet.getDataRange().getValues();
    if (values.length === 0) {
      result[name] = [];
      return;
    }
    const headers = values[0];
    const rows = values.slice(1);
    result[name] = rows
      .filter((r) => r.some((c) => c !== "" && c !== null))
      .map((r) => {
        const obj = {};
        headers.forEach((h, i) => (obj[h] = r[i]));
        return obj;
      });
  });
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function getResponses(e) {
  const pwd = e && e.parameter && e.parameter.pwd;
  if (pwd !== DASHBOARD_PASSWORD) {
    return ContentService.createTextOutput(
      JSON.stringify({ error: "unauthorized" })
    ).setMimeType(ContentService.MimeType.JSON);
  }
  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getSheetByName("responses");
  if (!sheet) {
    return ContentService.createTextOutput(
      JSON.stringify({ rows: [], headers: [] })
    ).setMimeType(ContentService.MimeType.JSON);
  }
  const values = sheet.getDataRange().getValues();
  if (values.length === 0) {
    return ContentService.createTextOutput(
      JSON.stringify({ rows: [], headers: [] })
    ).setMimeType(ContentService.MimeType.JSON);
  }
  const headers = values[0];
  const rows = values.slice(1)
    .filter((r) => r.some((c) => c !== "" && c !== null))
    .map((r) => {
      const obj = {};
      headers.forEach((h, i) => (obj[h] = r[i]));
      return obj;
    });
  return ContentService.createTextOutput(
    JSON.stringify({ headers: headers, rows: rows })
  ).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActive();
    let sheet = ss.getSheetByName("responses");
    if (!sheet) sheet = ss.insertSheet("responses");

    const data = JSON.parse(e.postData.contents);
    const keys = Object.keys(data);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(keys);
    } else {
      const existing = sheet
        .getRange(1, 1, 1, Math.max(1, sheet.getLastColumn()))
        .getValues()[0]
        .filter(String);
      const missing = keys.filter((k) => existing.indexOf(k) === -1);
      if (missing.length > 0) {
        sheet
          .getRange(1, existing.length + 1, 1, missing.length)
          .setValues([missing]);
      }
    }

    const headers = sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0];
    const row = headers.map((h) => (data[h] !== undefined ? data[h] : ""));
    sheet.appendRow(row);

    return ContentService.createTextOutput(
      JSON.stringify({ ok: true })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: String(err) })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
