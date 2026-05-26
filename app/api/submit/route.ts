import { NextResponse } from "next/server";

export const runtime = "nodejs";

function flatten(payload: any) {
  const out: Record<string, any> = {
    participant_id: payload.participant_id,
    group: payload.group,
    ui_order: payload.ui_order?.join("|"),
    question_order: payload.question_order?.join("|"),
    pref_ui: payload.pref_ui ?? "",
    pref_reason: payload.pref_reason ?? "",
    started_at: payload.started_at,
    submitted_at: payload.submitted_at,
    passage_read_time_ms: payload.passage_read_time_ms ?? "",
  };

  // 사전 설문
  const prior = payload.prior || {};
  Object.entries(prior).forEach(([k, v]) => {
    out[`prior_${k}`] = v ?? "";
  });

  const qids: string[] = payload.question_order || [];
  qids.forEach((qid, idx) => {
    const r = payload.results?.[qid];
    if (!r) return;
    const p = `q${idx + 1}`;
    out[`${p}_id`] = qid;
    out[`${p}_ui`] = r.ui;
    out[`${p}_read_time_ms`] = r.read_time_ms;
    out[`${p}_chunk_open_log`] = JSON.stringify(r.chunk_open_log);
    out[`${p}_bookmark_log`] = JSON.stringify(r.bookmark_log);
    out[`${p}_resumption_lag_ms`] = r.resumption_lag_ms ?? "";
    out[`${p}_interrupt_triggered`] = r.interrupt_triggered ? 1 : 0;
    out[`${p}_interrupt_trigger_used`] = r.interrupt_trigger_used ?? "";
    out[`${p}_interrupt_delay_used_ms`] = r.interrupt_delay_used_ms ?? "";
    out[`${p}_arithmetic_correct`] =
      r.arithmetic_correct === null ? "" : r.arithmetic_correct ? 1 : 0;

    // 퀴즈 답안: 문항 개수만큼 quiz_ans1, quiz_ans2, ... 컬럼으로 펼침
    const answers: string[] = Array.isArray(r.quiz_answers) ? r.quiz_answers : [];
    answers.forEach((ans, i) => {
      out[`${p}_quiz_ans${i + 1}`] = ans;
    });

    out[`${p}_quiz_time_auto_ms`] = r.quiz_time_auto_ms;
    out[`${p}_quiz_time_manual_s`] = r.quiz_time_manual_s ?? "";
    out[`${p}_tlx_mental`] = r.tlx?.mental;
    out[`${p}_tlx_physical`] = r.tlx?.physical;
    out[`${p}_tlx_temporal`] = r.tlx?.temporal;
    out[`${p}_tlx_performance`] = r.tlx?.performance;
    out[`${p}_tlx_effort`] = r.tlx?.effort;
    out[`${p}_tlx_frustration`] = r.tlx?.frustration;
  });
  return out;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const flat = flatten(body);
    const url = process.env.SHEET_API_URL;
    if (!url) {
      console.warn("SHEET_API_URL not set. Logging response:", flat);
      return NextResponse.json({ ok: true, mock: true, data: flat });
    }
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(flat),
    });
    if (!r.ok) throw new Error(`Apps Script ${r.status}`);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "unknown" }, { status: 500 });
  }
}
