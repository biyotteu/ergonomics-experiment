"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Stepper } from "@/components/Stepper";
import { useExperimentStore } from "@/lib/store";
import { generateParticipantId, assignGroup } from "@/lib/groupAssignment";
import { config } from "@/lib/config";

export default function Home() {
  const router = useRouter();
  const init = useExperimentStore((s) => s.init);
  const [id, setId] = useState("");
  const [consent, setConsent] = useState(false);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    setId(generateParticipantId());
    if (config.REQUIRE_DESKTOP && typeof window !== "undefined") {
      setMobile(window.innerWidth < 768);
    }
  }, []);

  const start = () => {
    const spec = assignGroup(id);
    init({
      participant_id: id,
      group: spec.group,
      ui_order: spec.ui_order,
      question_order: spec.question_order,
    });
    if (config.SHOW_PRIOR_KNOWLEDGE_SURVEY) router.push("/prior-knowledge");
    else router.push("/practice");
  };

  if (mobile) {
    return (
      <Container size="sm">
        <Card className="p-8 text-center">
          <h1 className="text-xl font-semibold mb-2">PC에서 접속해주세요</h1>
          <p className="text-sm text-muted">
            본 실험은 데스크탑/노트북 환경에서 진행됩니다. PC로 다시 접속해주세요.
          </p>
        </Card>
      </Container>
    );
  }

  return (
    <Container size="md">
      <Stepper step={1} total={8} />
      <div className="mb-2">
        <h1 className="text-3xl font-semibold tracking-tight mb-2">
          인지부하 비교 실험에 참여해주셔서 감사합니다
        </h1>
        <p className="text-muted leading-relaxed">
          본 실험은 LLM 응답 인터페이스(UI)에 따른 인지부하 차이를 측정합니다. 약
          20~25분 정도 소요됩니다.
        </p>
      </div>

      <Card className="p-6 mt-8">
        <h2 className="font-semibold mb-3">실험 흐름</h2>
        <ol className="text-sm text-muted space-y-1.5 list-decimal pl-5">
          <li>사전 설문 (배경지식)</li>
          <li>UI 사용법 연습</li>
          <li>조건 1: 한 종류의 UI로 문제 풀이 + NASA-TLX 설문</li>
          <li>짧은 휴식</li>
          <li>조건 2: 반대 UI로 문제 풀이 + NASA-TLX 설문</li>
          <li>마무리 인터뷰</li>
        </ol>
      </Card>

      <Card className="p-6 mt-4">
        <h2 className="font-semibold mb-3">동의 안내</h2>
        <p className="text-sm text-muted mb-4 leading-relaxed">
          수집되는 데이터(시간, 응답, 설문값)는 익명으로 처리되며, 본 연구 외 목적에는 사용되지
          않습니다. 실험 중 중단을 원하시면 언제든 창을 닫으시면 됩니다.
        </p>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          위 내용에 동의합니다
        </label>
      </Card>

      <Card className="p-6 mt-4">
        <h2 className="font-semibold mb-3">참가자 ID</h2>
        <p className="text-xs text-muted mb-2">
          자동 부여된 ID입니다. 본인이 원하면 수정해도 됩니다.
        </p>
        <input
          type="text"
          value={id}
          onChange={(e) => setId(e.target.value)}
          className="w-full border border-line rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-100"
        />
      </Card>

      <div className="mt-8 flex justify-end">
        <Button onClick={start} disabled={!consent || id.trim() === ""}>
          실험 시작 →
        </Button>
      </div>
    </Container>
  );
}
