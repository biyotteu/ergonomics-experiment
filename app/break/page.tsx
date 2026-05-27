"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Stepper } from "@/components/Stepper";
import { useExperimentStore } from "@/lib/store";
import { config } from "@/lib/config";
import { now } from "@/lib/timing";

export default function Break() {
  const router = useRouter();
  const [left, setLeft] = useState<number>(config.BREAK_DURATION_SEC);
  const ui_order = useExperimentStore((s) => s.ui_order);
  const question_order = useExperimentStore((s) => s.question_order);
  const setBreakDuration = useExperimentStore((s) => s.setBreakDuration);

  // 페이지 진입 시각 (휴식 시간 측정 기준)
  const enterTs = useRef(now());

  useEffect(() => {
    const t = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const go = () => {
    setBreakDuration(now() - enterTs.current);
    router.push(`/reading?q=${question_order[1]}&ui=${ui_order[1]}&phase=2`);
  };

  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");

  return (
    <Container size="md">
      <Stepper step={6} total={9} />
      <h1 className="text-2xl font-semibold mb-2">짧은 휴식</h1>
      <p className="text-muted mb-6">
        잠시 쉬어가세요. 다음 조건에서는 반대 UI로 진행됩니다.
      </p>

      <Card className="p-12 text-center">
        <div className="text-6xl font-semibold tabular-nums mb-2">
          {mm}:{ss}
        </div>
        <p className="text-sm text-muted">{left > 0 ? "남은 휴식 시간" : "휴식이 끝났습니다"}</p>
      </Card>

      <div className="mt-8 flex justify-end gap-3">
        <Button variant="secondary" onClick={go}>지금 바로 진행</Button>
        <Button onClick={go} disabled={left > 0}>
          다음 조건 시작 →
        </Button>
      </div>
    </Container>
  );
}
