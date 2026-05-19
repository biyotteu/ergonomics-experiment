"use client";
import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { Stepper } from "@/components/Stepper";
import { BasicUI } from "@/components/BasicUI";
import { StructuredUI } from "@/components/StructuredUI";
import { InterruptionModal } from "@/components/InterruptionModal";
import { useExperimentStore } from "@/lib/store";
import { config } from "@/lib/config";
import { now, onFirstScroll } from "@/lib/timing";
import { useContent } from "@/lib/useContent";
import { findChunks, findBluf, findAnalogy, findQuestion } from "@/lib/content";
import type { InterruptTrigger, UIType } from "@/lib/types";

function ReadingInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const qid = sp.get("q") || "A1";
  const ui = (sp.get("ui") || "basic") as UIType;
  const phase = Number(sp.get("phase") || "1");
  const triggerOverride = (sp.get("interrupt") || "") as InterruptTrigger | "";

  const store = useExperimentStore();
  const ensureResult = store.ensureResult;
  const updateResult = store.updateResult;
  const logChunkOpen = store.logChunkOpen;
  const logBookmark = store.logBookmark;
  const setInterrupt = store.setInterrupt;
  const interrupt_in = store.interrupt_in;

  const enterTs = useRef(now());
  const [chunk2OpenedAt, setChunk2OpenedAt] = useState<number | null>(null);
  const [scrollPctReached, setScrollPctReached] = useState<number | null>(null);
  const [modalProblem, setModalProblem] = useState<{ a: number; b: number } | null>(null);
  const [interruptDone, setInterruptDone] = useState(false);

  const { content, loading } = useContent();

  const trigger: InterruptTrigger =
    (triggerOverride || config.DEFAULT_INTERRUPT_TRIGGER) as InterruptTrigger;
  const shouldInterrupt = ui === interrupt_in && !interruptDone;

  useEffect(() => {
    if (content) ensureResult(qid, ui);
  }, [content, qid, ui, ensureResult]);

  // 시간 기반 트리거
  useEffect(() => {
    if (!shouldInterrupt) return;
    if (trigger !== "time45" && trigger !== "time60") return;
    const sec = trigger === "time45" ? 45 : 60;
    const t = setTimeout(() => fireInterrupt(), sec * 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger, shouldInterrupt]);

  // 청크2 기반 트리거 (StructuredUI)
  useEffect(() => {
    if (!shouldInterrupt || trigger !== "chunk2" || chunk2OpenedAt === null) return;
    const t = setTimeout(() => fireInterrupt(), config.INTERRUPT_DELAY_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger, shouldInterrupt, chunk2OpenedAt]);

  // 스크롤 % 기반 트리거 (BasicUI)
  useEffect(() => {
    if (!shouldInterrupt || scrollPctReached === null) return;
    if (!["scroll30", "scroll40", "scroll50"].includes(trigger)) return;
    const t = setTimeout(() => fireInterrupt(), config.INTERRUPT_DELAY_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger, shouldInterrupt, scrollPctReached]);

  const fireInterrupt = () => {
    if (interruptDone || modalProblem) return;
    const probs = config.ARITHMETIC_PROBLEMS;
    const pick = probs[Math.floor(Math.random() * probs.length)];
    setModalProblem(pick);
  };

  const onCloseModal = (correct: boolean) => {
    const closeTs = now();
    setModalProblem(null);
    setInterruptDone(true);
    onFirstScroll((scrollTs) => {
      const lag = scrollTs - closeTs;
      setInterrupt(qid, lag, trigger, correct);
    });
  };

  const onScrollPct = (pct: number) => {
    if (scrollPctReached !== null) return;
    const threshold = trigger === "scroll30" ? 30 : trigger === "scroll40" ? 40 : trigger === "scroll50" ? 50 : null;
    if (threshold !== null && pct >= threshold) setScrollPctReached(pct);
  };

  const onChunkOpen = (order: number) => {
    logChunkOpen(qid, order);
    if (order === 2 && chunk2OpenedAt === null) setChunk2OpenedAt(now());
  };

  const goQuiz = () => {
    const elapsed = now() - enterTs.current;
    updateResult(qid, { read_time_ms: elapsed });
    router.push(`/quiz?q=${qid}&ui=${ui}&phase=${phase}`);
  };

  if (loading || !content) {
    return (
      <Container size="lg">
        <p className="text-muted">콘텐츠를 불러오는 중입니다...</p>
      </Container>
    );
  }

  const question = findQuestion(content, qid);
  const chunks = findChunks(content, qid);
  const bluf = findBluf(content, qid);
  const analogy = findAnalogy(content, qid);

  if (!question || !bluf || !analogy) {
    return (
      <Container size="lg">
        <p className="text-muted">콘텐츠를 찾을 수 없습니다. (qid: {qid})</p>
      </Container>
    );
  }

  const bullets = [bluf.bullet_1, bluf.bullet_2, bluf.bullet_3];

  return (
    <Container size="xl">
      <Stepper step={phase === 1 ? 4 : 6} total={8} />
      <div className="mb-6">
        <div className="text-xs uppercase tracking-wider text-muted">조건 {phase}</div>
        <div className="text-sm font-medium text-ink">
          {ui === "basic" ? "기본 UI" : "구조화형 UI"}
        </div>
      </div>

      {ui === "basic" ? (
        <BasicUI
          question_text={question.question_text}
          chunks={chunks}
          blufBullets={bullets}
          analogyText={analogy.analogy_text}
          onScroll={onScrollPct}
        />
      ) : (
        <StructuredUI
          question_text={question.question_text}
          chunks={chunks}
          blufBullets={bullets}
          analogyText={analogy.analogy_text}
          onChunkOpen={onChunkOpen}
          onBookmark={(o) => logBookmark(qid, o)}
        />
      )}

      <div className="mt-12 flex justify-end">
        <Button onClick={goQuiz}>퀴즈로 이동 →</Button>
      </div>

      {modalProblem && (
        <InterruptionModal problem={modalProblem} onClose={onCloseModal} />
      )}
    </Container>
  );
}

export default function Reading() {
  return (
    <Suspense fallback={null}>
      <ReadingInner />
    </Suspense>
  );
}
