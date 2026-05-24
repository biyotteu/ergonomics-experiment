"use client";
import React, { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Stepper } from "@/components/Stepper";
import { NasaTLXSlider } from "@/components/NasaTLXSlider";
import { useExperimentStore } from "@/lib/store";
import { config } from "@/lib/config";
import type { UIType, TlxScores } from "@/lib/types";

function TlxInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const qid = sp.get("q") || "A1";
  const phase = Number(sp.get("phase") || "1");
  const setTlx = useExperimentStore((s) => s.setTlx);

  const [scores, setScores] = useState<TlxScores>({
    mental: 50, physical: 50, temporal: 50, performance: 50, effort: 50, frustration: 50,
  });

  const submit = () => {
    setTlx(qid, scores);
    if (phase === 1) router.push("/break");
    else router.push("/survey");
  };

  return (
    <Container size="md">
      <Stepper step={phase === 1 ? 4 : 6} total={8} />
      <h1 className="text-2xl font-semibold mb-2">NASA-TLX 설문</h1>
      <p className="text-sm text-muted mb-6 leading-relaxed">{config.TLX_INTRO}</p>

      <Card className="p-6">
        {config.TLX_DIMENSIONS.map((d) => (
          <NasaTLXSlider
            key={d.key}
            label={d.label}
            question={d.question}
            desc={d.desc}
            anchorLow={d.anchorLow}
            anchorHigh={d.anchorHigh}
            value={scores[d.key as keyof TlxScores]}
            onChange={(n) => setScores((s) => ({ ...s, [d.key]: n }))}
          />
        ))}
      </Card>

      <div className="mt-8 flex justify-end">
        <Button onClick={submit}>제출 →</Button>
      </div>
    </Container>
  );
}

export default function Tlx() {
  return <Suspense fallback={null}><TlxInner /></Suspense>;
}
