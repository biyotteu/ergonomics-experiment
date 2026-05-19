import type { InterruptTrigger, TlxScores } from "./types";

type TlxDimension = { key: keyof TlxScores; label: string; desc: string };

export const config = {
  // 카운터밸런싱 그룹 수 (2 또는 4)
  COUNTERBALANCE_GROUPS: 2 as 2 | 4,

  // 사전 배경지식 설문 표시 여부
  SHOW_PRIOR_KNOWLEDGE_SURVEY: true,

  // 기본 인터럽션 트리거 (URL 쿼리로 override 가능)
  DEFAULT_INTERRUPT_TRIGGER: "scroll40" as InterruptTrigger,

  // 트리거 조건 만족 후 모달 발동까지 지연 시간 (ms)
  INTERRUPT_DELAY_MS: 5000,

  // 휴식 시간 (초)
  BREAK_DURATION_SEC: 180,

  // 모바일 차단 여부
  REQUIRE_DESKTOP: true,

  // 인터럽션용 덧셈 문제 풀
  ARITHMETIC_PROBLEMS: [
    { a: 47, b: 38 },
    { a: 56, b: 27 },
    { a: 63, b: 49 },
    { a: 38, b: 54 },
    { a: 72, b: 39 },
  ] as { a: number; b: number }[],

  // NASA-TLX 6개 항목
  TLX_DIMENSIONS: [
    { key: "mental", label: "정신적 요구 (Mental Demand)", desc: "얼마나 정신적으로 노력해야 했나요?" },
    { key: "physical", label: "신체적 요구 (Physical Demand)", desc: "얼마나 신체적으로 부담이 있었나요?" },
    { key: "temporal", label: "시간적 요구 (Temporal Demand)", desc: "시간 압박을 얼마나 느꼈나요?" },
    { key: "performance", label: "수행 (Performance)", desc: "본인이 얼마나 잘 수행했다고 느끼나요? (낮을수록 잘함)" },
    { key: "effort", label: "노력 (Effort)", desc: "목표 달성을 위해 얼마나 노력했나요?" },
    { key: "frustration", label: "좌절감 (Frustration)", desc: "얼마나 짜증/스트레스를 느꼈나요?" },
  ] as TlxDimension[],
};
