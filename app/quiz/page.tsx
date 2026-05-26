"use client";
import React, { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Stepper } from "@/components/Stepper";
import { ReferenceView } from "@/components/ReferenceView";
import { useExperimentStore } from "@/lib/store";
import { useContent } from "@/lib/useContent";
import { findQuiz, findChunks, findBluf, findQuestion } from "@/lib/content";
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

  // 답안 배열 (문항 개수에 맞춰 동적). 각 문항이 독립적으로 관리됨.
  const [answers, setAnswers] = useState<string[]>([]);

  const quiz = content ? findQuiz(content, qid) : [];

  // 콘텐츠 로드 후 문항 개수만큼 빈 배열 초기화
  useEffect(() => {
    if (quiz.length > 0 && answers.length !== quiz.length) {
      setAnswers(new Array(quiz.length).fill(""));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz.length]);

  const updateAnswer = (i: number, value: string) => {
    setAnswers((prev) => {
      const next = prev.slice();
      next[i] = value;
      return next;
    });
  };

  const submit = () => {
    const elapsed = now() - enterTs.current;
    updateResult(qid, { quiz_answers: answers, quiz_time_auto_ms: elapsed });
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

  if (!question || !bluf) {
    return (
      <Container size="md">
        <p className="text-muted">콘텐츠를 찾을 수 없습니다. (qid: {qid})</p>
      </Container>
    );
  }

  const allAnswered = quiz.length > 0 && answers.length === quiz.length && answers.every((a) => a.trim() !== "");

  return (
    <Container size="xl">
      <Stepper step={phase === 1 ? 5 : 7} total={9} />

      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-1">퀴즈 (오픈북)</h1>
        <p className="text-sm text-muted">
          왼쪽 자료를 자유롭게 참고하면서 오른쪽 문항에 답해주세요. 각 문항은 독립적으로 작성합니다.
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
            blufText={bluf.text}
          />
        </div>

        {/* 우측: 퀴즈 폼 — 문항마다 독립 textarea */}
        <div>
          {quiz.map((q, i) => (
            <Card key={q.q_order} className="p-5 mb-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">
                문항 {i + 1}
              </div>
              <p className="font-medium text-ink mb-4 leading-relaxed">{q.question_text}</p>
              <textarea
                rows={5}
                value={answers[i] ?? ""}
                onChange={(e) => updateAnswer(i, e.target.value)}
                className="w-full border border-line rounded-xl px-4 py-3 text-sm leading-relaxed focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-100 resize-none"
                placeholder="답안을 작성해주세요"
              />
            </Card>
          ))}

          <div className="flex justify-end">
            <Button onClick={submit} disabled={!allAnswered}>
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
