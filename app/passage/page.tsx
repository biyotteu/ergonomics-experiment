"use client";
import React, { useRef } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Stepper } from "@/components/Stepper";
import { useExperimentStore } from "@/lib/store";
import { useContent } from "@/lib/useContent";
import { findPassage, findQuestion } from "@/lib/content";
import { now } from "@/lib/timing";

export default function PassagePage() {
  const router = useRouter();
  const enterTs = useRef(now());
  const question_order = useExperimentStore((s) => s.question_order);
  const ui_order = useExperimentStore((s) => s.ui_order);
  const setPassageReadTime = useExperimentStore((s) => s.setPassageReadTime);
  const { content, loading } = useContent();

  const next = () => {
    setPassageReadTime(now() - enterTs.current);
    router.push(`/reading?q=${question_order[0]}&ui=${ui_order[0]}&phase=1`);
  };

  if (loading || !content) {
    return (
      <Container size="md">
        <p className="text-muted">잠시만요...</p>
      </Container>
    );
  }

  // 첫 조건 질문의 passage 사용 (실험 전체에서 동일한 P1을 씀)
  const firstQ = findQuestion(content, question_order[0]);
  const passage = firstQ ? findPassage(content, firstQ.passage_id) : content.passages[0];

  if (!passage) {
    return (
      <Container size="md">
        <p className="text-muted">배경지식 지문을 찾을 수 없습니다.</p>
      </Container>
    );
  }

  return (
    <Container size="md">
      <Stepper step={4} total={9} />
      <h1 className="text-2xl font-semibold mb-2">배경지식 지문</h1>
      <p className="text-muted mb-6">
        다음 본문을 천천히 읽어주세요. 이후 본 실험에서 이 지문이 비유의 기반이 됩니다.
      </p>

      <Card className="p-7">
        <p className="text-[16px] leading-8 text-ink whitespace-pre-wrap">{passage.text}</p>
      </Card>

      <div className="mt-8 flex justify-end">
        <Button onClick={next}>다 읽었어요 →</Button>
      </div>
    </Container>
  );
}
