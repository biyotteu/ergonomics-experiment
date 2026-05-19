"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Stepper } from "@/components/Stepper";
import { useExperimentStore } from "@/lib/store";
import type { UIType } from "@/lib/types";

export default function Survey() {
  const router = useRouter();
  const setPref = useExperimentStore((s) => s.setPref);
  const [pref, setPref_] = useState<UIType | null>(null);
  const [reason, setReason] = useState("");

  const submit = () => {
    if (pref) setPref(pref, reason);
    router.push("/done");
  };

  return (
    <Container size="md">
      <Stepper step={7} total={8} />
      <h1 className="text-2xl font-semibold mb-2">마무리 인터뷰</h1>
      <p className="text-muted mb-6">
        간단한 질문 두 개로 실험이 마무리됩니다.
      </p>

      <Card className="p-6 mb-4">
        <h2 className="font-semibold mb-3">두 UI 중 어느 쪽이 더 마음에 드셨나요?</h2>
        <div className="grid grid-cols-2 gap-3">
          {(["basic", "structured"] as UIType[]).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setPref_(u)}
              className={`py-4 rounded-xl border text-sm font-medium transition-colors ${
                pref === u
                  ? "border-accent-600 bg-accent-50 text-accent-700"
                  : "border-line text-muted hover:border-zinc-300"
              }`}
            >
              {u === "basic" ? "기본 UI" : "구조화형 UI"}
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold mb-3">그 이유는 무엇인가요?</h2>
        <textarea
          rows={5}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full border border-line rounded-xl px-4 py-3 text-sm leading-relaxed focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-100 resize-none"
          placeholder="자유롭게 작성해주세요"
        />
      </Card>

      <div className="mt-8 flex justify-end">
        <Button onClick={submit} disabled={!pref}>다음 →</Button>
      </div>
    </Container>
  );
}
