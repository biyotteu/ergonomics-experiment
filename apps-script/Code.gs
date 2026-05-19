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
 * 5. 배포 > 새 배포 > 유형: 웹 앱
 *    - 다음 사용자 인증: 나
 *    - 액세스 권한: 모든 사용자
 *    → 발급된 웹앱 URL을 복사
 * 6. Vercel 프로젝트 환경변수에 추가:
 *    SHEET_API_URL=<위 URL>
 *    NEXT_PUBLIC_SHEET_API_URL=<위 URL>
 */

function doGet() {
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

function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActive();
    let sheet = ss.getSheetByName("responses");
    if (!sheet) sheet = ss.insertSheet("responses");

    const data = JSON.parse(e.postData.contents);
    const keys = Object.keys(data);

    // 첫 응답이면 헤더 자동 입력
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(keys);
    } else {
      // 기존 헤더와 다른 새 키가 있다면 끝에 추가
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

    // 헤더 순서대로 값 채우기
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
