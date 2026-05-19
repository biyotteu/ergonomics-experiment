"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Stepper } from "@/components/Stepper";
import { useExperimentStore } from "@/lib/store";
import { useContent } from "@/lib/useContent";

function Likert({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="py-4 border-b border-line last:border-b-0">
      <div className="font-medium mb-3">{label}</div>
      <div className="flex justify-between gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-colors ${
              value === n
                ? "border-accent-600 bg-accent-50 text-accent-700"
                : "border-line text-muted hover:border-zinc-300"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-[11px] text-muted mt-1.5">
        <span>전혀 모름</span>
        <span>매우 익숙함</span>
      </div>
    </div>
  );
}

export default function PriorKnowledge() {
  const router = useRouter();
  const setPrior = useExperimentStore((s) => s.setPrior);
  const { content, loading } = useContent();
  const [values, setValues] = useState<Record<string, number>>({});

  const items = content?.prior_knowledge ?? [];

  const allAnswered = items.length > 0 && items.every((it) => values[it.item_key] !== undefined);

  const submit = () => {
    setPrior(values);
    router.push("/practice");
  };

  if (loading || !content) {
    return (
      <Container size="md">
        <p className="text-muted">잠시만요...</p>
      </Container>
    );
  }

  if (items.length === 0) {
    // 시트에 항목이 비어 있으면 페이지 자체 스킵
    return (
      <Container size="md">
        <Stepper step={2} total={8} />
        <h1 className="text-2xl font-semibold mb-2">사전 설문</h1>
        <p className="text-muted mb-6">
          설문 항목이 없습니다. 다음 단계로 진행해주세요.
        </p>
        <Button onClick={() => router.push("/practice")}>다음 →</Button>
      </Container>
    );
  }

  return (
    <Container size="md">
      <Stepper step={2} total={8} />
      <h1 className="text-2xl font-semibold mb-2">사전 배경지식 설문</h1>
      <p className="text-muted mb-6">
        실험 결과 해석을 위한 보조 정보로만 사용됩니다. 솔직하게 답해주세요.
      </p>

      <Card className="p-6">
        {items.map((it) => (
          <Likert
            key={it.item_key}
            label={it.label}
            value={values[it.item_key] ?? 0}
            onChange={(n) => setValues((v) => ({ ...v, [it.item_key]: n }))}
          />
        ))}
      </Card>

      <div className="mt-8 flex justify-end">
        <Button onClick={submit} disabled={!allAnswered}>
          다음 →
        </Button>
      </div>
    </Container>
  );
}
