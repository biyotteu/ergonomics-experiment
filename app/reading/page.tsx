"use client";
import React, { Suspense, useEffect, useRef, useState } from "react";
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

function resolveTrigger(raw: InterruptTrigger, ui: UIType): InterruptTrigger {
  if (raw !== "auto") return raw;
  return ui === "structured" ? "chunk3" : "section3_scroll";
}

function randomDelayMs(): number {
  const min = config.INTERRUPT_DELAY_MIN_MS;
  const max = config.INTERRUPT_DELAY_MAX_MS;
  return min + Math.random() * (max - min);
}

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
  const triggerRef = useRef<InterruptTrigger>("auto");
  const delayUsedRef = useRef<number>(0);

  const [triggerSignalAt, setTriggerSignalAt] = useState<number | null>(null);
  const [modalProblem, setModalProblem] = useState<{ a: number; b: number } | null>(null);
  const [interruptDone, setInterruptDone] = useState(false);

  const { content, loading } = useContent();

  const trigger = resolveTrigger(
    (triggerOverride || config.DEFAULT_INTERRUPT_TRIGGER) as InterruptTrigger,
    ui
  );
  triggerRef.current = trigger;

  const shouldInterrupt = ui === interrupt_in && !interruptDone;

  useEffect(() => {
    if (content) ensureResult(qid, ui);
  }, [content, qid, ui, ensureResult]);

  // 시간 기반 트리거 (호환)
  useEffect(() => {
    if (!shouldInterrupt || triggerSignalAt !== null) return;
    if (trigger !== "time45" && trigger !== "time60") return;
    const sec = trigger === "time45" ? 45 : 60;
    const t = setTimeout(() => setTriggerSignalAt(now()), sec * 1000);
    return () => clearTimeout(t);
  }, [trigger, shouldInterrupt, triggerSignalAt]);

  // 트리거 시그널 후 5~8초 무작위 지연으로 모달 발동
  useEffect(() => {
    if (triggerSignalAt === null || !shouldInterrupt) return;
    const delay = randomDelayMs();
    delayUsedRef.current = delay;
    const t = setTimeout(() => fireInterrupt(), delay);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerSignalAt, shouldInterrupt]);

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
      setInterrupt(qid, lag, triggerRef.current, delayUsedRef.current, correct);
    });
  };

  // BasicUI 스크롤 % 트리거 (호환 - scroll30/40/50)
  const onScrollPct = (pct: number) => {
    if (!shouldInterrupt || triggerSignalAt !== null) return;
    const threshold =
      trigger === "scroll30" ? 30 :
      trigger === "scroll40" ? 40 :
      trigger === "scroll50" ? 50 : null;
    if (threshold !== null && pct >= threshold) setTriggerSignalAt(now());
  };

  // BasicUI: 3번째 섹션 위치 가시 → section3_scroll 트리거
  const onSection3Visible = () => {
    if (!shouldInterrupt || triggerSignalAt !== null) return;
    if (trigger === "section3_scroll") setTriggerSignalAt(now());
  };

  // StructuredUI: 청크 펼침 → chunk2 / chunk3 트리거
  const onChunkOpen = (order: number) => {
    logChunkOpen(qid, order);
    if (!shouldInterrupt || triggerSignalAt !== null) return;
    if (trigger === "chunk3" && order === 3) setTriggerSignalAt(now());
    else if (trigger === "chunk2" && order === 2) setTriggerSignalAt(now());
  };

  const goQuiz = () => {
    const elapsed = now() - enterTs.current;
    updateResult(qid, { read_time_ms: elapsed });
    router.push(`/quiz?q=${qid}&ui=${ui}&phase=${phase}`);
  };

  if (loading || !content) {
    return (
      <Container size="lg">
        <p className="text-muted">잠시만요...</p>
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
          onSection3Visible={onSection3Visible}
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
