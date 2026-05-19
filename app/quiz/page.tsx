"use client";
import React, { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Stepper } from "@/components/Stepper";
import { useExperimentStore } from "@/lib/store";
import { useContent } from "@/lib/useContent";
import { findQuiz } from "@/lib/content";
import { now } from "@/lib/timing";
import type { UIType } from "@/lib/types";

function QuizInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const qid = sp.get("q") || "A1";
  const ui = (sp.get("ui") || "basic") as UIType;
  const phase = Number(sp.get("phase") || "1");

  const updateResult = useExperimentStore((s) => s.updateResult);
  const { content, loading } = useContent();
  const enterTs = useRef(now());
  const [a1, setA1] = useState("");
  const [a2, setA2] = useState("");

  const submit = () => {
    const elapsed = now() - enterTs.current;
    updateResult(qid, { quiz_ans_1: a1, quiz_ans_2: a2, quiz_time_auto_ms: elapsed });
    router.push(`/tlx?q=${qid}&ui=${ui}&phase=${phase}`);
  };

  if (loading || !content) return <Container size="md"><p className="text-muted">로딩 중...</p></Container>;
  const quiz = findQuiz(content, qid);

  return (
    <Container size="md">
      <Stepper step={phase === 1 ? 4 : 6} total={8} />
      <h1 className="text-2xl font-semibold mb-2">퀴즈</h1>
      <p className="text-muted mb-6">
        앞서 읽으신 내용을 바탕으로 두 문항에 답해주세요. 정답은 채점하지 않으며, 빈칸 없이 본인이
        이해한 대로 작성해주시면 됩니다.
      </p>

      {quiz.map((q, i) => (
        <Card key={q.q_order} className="p-6 mb-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">
            문항 {i + 1}
          </div>
          <p className="font-medium text-ink mb-4">{q.question_text}</p>
          <textarea
            rows={4}
            value={i === 0 ? a1 : a2}
            onChange={(e) => (i === 0 ? setA1(e.target.value) : setA2(e.target.value))}
            className="w-full border border-line rounded-xl px-4 py-3 text-sm leading-relaxed focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-100 resize-none"
            placeholder="답안을 작성해주세요"
          />
        </Card>
      ))}

      <div className="mt-6 flex justify-end">
        <Button onClick={submit} disabled={a1.trim() === "" || a2.trim() === ""}>
          제출하고 다음으로 →
        </Button>
      </div>
    </Container>
  );
}

export default function Quiz() {
  return <Suspense fallback={null}><QuizInner /></Suspense>;
}
