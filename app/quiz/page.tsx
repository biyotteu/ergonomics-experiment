"use client";
import React, { Suspense, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Stepper } from "@/components/Stepper";
import { ReferenceView } from "@/components/ReferenceView";
import { useExperimentStore } from "@/lib/store";
import { useContent } from "@/lib/useContent";
import {
  findQuiz,
  findChunks,
  findBluf,
  findAnalogy,
  findQuestion,
} from "@/lib/content";
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

  if (loading || !content) {
    return (
      <Container size="md">
        <p className="text-muted">잠시만요...</p>
      </Container>
    );
  }

  const question = findQuestion(content, qid);
  const chunks = findChunks(content, qid);
  const bluf = findBluf(content, qid);
  const analogy = findAnalogy(content, qid);
  const quiz = findQuiz(content, qid);

  if (!question || !bluf || !analogy) {
    return (
      <Container size="md">
        <p className="text-muted">콘텐츠를 찾을 수 없습니다. (qid: {qid})</p>
      </Container>
    );
  }

  const bullets = [bluf.bullet_1, bluf.bullet_2, bluf.bullet_3];

  return (
    <Container size="xl">
      <Stepper step={phase === 1 ? 4 : 6} total={8} />

      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-1">퀴즈 (오픈북)</h1>
        <p className="text-sm text-muted">
          왼쪽 자료를 자유롭게 참고하면서 오른쪽 두 문항에 답해주세요.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6">
        {/* 좌측: 읽기 자료 */}
        <div className="bg-bg lg:sticky lg:top-4 lg:self-start lg:max-h-[calc(100vh-80px)] lg:overflow-y-auto rounded-2xl border border-line p-5">
          <div className="text-xs uppercase tracking-wider text-muted font-medium mb-3">
            참고 자료
          </div>
          <ReferenceView
            ui={ui}
            question_text={question.question_text}
            chunks={chunks}
            blufBullets={bullets}
            analogyText={analogy.analogy_text}
          />
        </div>

        {/* 우측: 퀴즈 폼 */}
        <div>
          {quiz.map((q, i) => (
            <Card key={q.q_order} className="p-5 mb-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">
                문항 {i + 1}
              </div>
              <p className="font-medium text-ink mb-4 leading-relaxed">{q.question_text}</p>
              <textarea
                rows={5}
                value={i === 0 ? a1 : a2}
                onChange={(e) => (i === 0 ? setA1(e.target.value) : setA2(e.target.value))}
                className="w-full border border-line rounded-xl px-4 py-3 text-sm leading-relaxed focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-100 resize-none"
                placeholder="답안을 작성해주세요"
              />
            </Card>
          ))}

          <div className="flex justify-end">
            <Button
              onClick={submit}
              disabled={a1.trim() === "" || a2.trim() === ""}
            >
              제출하고 다음으로 →
            </Button>
          </div>
        </div>
      </div>
    </Container>
  );
}

export default function Quiz() {
  return (
    <Suspense fallback={null}>
      <QuizInner />
    </Suspense>
  );
}
