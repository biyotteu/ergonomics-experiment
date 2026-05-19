"use client";
import React, { useEffect, useState } from "react";
import { Container } from "@/components/Container";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Stepper } from "@/components/Stepper";
import { useExperimentStore } from "@/lib/store";

export default function Done() {
  const state = useExperimentStore();
  const [status, setStatus] = useState<"idle" | "ok" | "fail">("idle");
  const [posting, setPosting] = useState(false);

  const submit = async () => {
    setPosting(true);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participant_id: state.participant_id,
          group: state.group,
          ui_order: state.ui_order,
          question_order: state.question_order,
          interrupt_in: state.interrupt_in,
          prior: state.prior,
          results: state.results,
          pref_ui: state.pref_ui,
          pref_reason: state.pref_reason,
          started_at: state.started_at,
          submitted_at: Date.now(),
        }),
      });
      if (!res.ok) throw new Error("Submit failed");
      setStatus("ok");
    } catch {
      setStatus("fail");
    } finally {
      setPosting(false);
    }
  };

  useEffect(() => { submit(); /* 한 번만 자동 제출 */ // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const downloadBackup = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${state.participant_id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Container size="md">
      <Stepper step={8} total={8} />
      <Card className="p-10 text-center">
        <div className="text-5xl mb-3" aria-hidden>✓</div>
        <h1 className="text-2xl font-semibold mb-2">실험이 끝났습니다</h1>
        <p className="text-muted mb-6">참여해주셔서 감사합니다.</p>

        {status === "idle" && <p className="text-sm text-muted">데이터를 전송하는 중입니다...</p>}
        {status === "ok" && (
          <p className="text-sm text-accent-700 font-medium">데이터가 정상적으로 제출되었습니다.</p>
        )}
        {status === "fail" && (
          <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-4 text-left">
            <p className="font-medium mb-2">데이터 전송에 실패했습니다.</p>
            <p className="mb-3">아래 버튼으로 파일을 저장한 뒤 실험자에게 전달해주세요.</p>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={submit} disabled={posting}>다시 시도</Button>
              <Button variant="secondary" onClick={downloadBackup}>JSON 백업 받기</Button>
            </div>
          </div>
        )}

        <p className="mt-6 text-xs text-muted font-mono">참가자 ID: {state.participant_id}</p>
      </Card>
    </Container>
  );
}
