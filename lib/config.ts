import type { InterruptTrigger, TlxScores } from "./types";

type TlxDimension = {
  key: keyof TlxScores;
  label: string;       // 항목명
  question: string;    // 질문 문장
  desc: string;        // 부가 설명
  anchorLow: string;   // 0점 앵커
  anchorHigh: string;  // 100점 앵커
};

export const config = {
  // 카운터밸런싱 그룹 수 (2 또는 4)
  COUNTERBALANCE_GROUPS: 2 as 2 | 4,

  // 사전 배경지식 설문 표시 여부
  SHOW_PRIOR_KNOWLEDGE_SURVEY: true,

  // 기본 인터럽션 트리거
  DEFAULT_INTERRUPT_TRIGGER: "auto" as InterruptTrigger,

  // 트리거 조건 만족 후 모달 발동까지 지연 시간 (ms). 5000~8000 무작위.
  INTERRUPT_DELAY_MIN_MS: 5000,
  INTERRUPT_DELAY_MAX_MS: 8000,

  // 휴식 시간 (초)
  BREAK_DURATION_SEC: 180,

  REQUIRE_DESKTOP: true,

  ARITHMETIC_PROBLEMS: [
    { a: 47, b: 38 },
    { a: 56, b: 27 },
    { a: 63, b: 49 },
    { a: 38, b: 54 },
    { a: 72, b: 39 },
  ] as { a: number; b: number }[],

  // NASA-TLX 공통 안내 문장
  TLX_INTRO:
    "아래 문항들은 방금 수행하신 '응답 읽기 + 퀴즈 과제' 전반에 대해 평가하는 것입니다. " +
    "각 항목에 대해 0~100 사이에서 느낌에 가장 가까운 값을 선택해주세요. " +
    "0은 '거의 없음/매우 낮음', 100은 '매우 큼/매우 높음'을 의미합니다.",

  // NASA-TLX 6개 항목 (공식 정의 기반)
  TLX_DIMENSIONS: [
    {
      key: "mental",
      label: "정신적 요구 (Mental Demand)",
      question: "이 과제를 수행하는 동안, 얼마나 많은 생각·판단·기억·계산 등이 필요했다고 느끼셨나요?",
      desc: "과제를 이해하고 푸는 데 요구된 정신적·인지적 노력의 정도를 평가해주세요.",
      anchorLow: "거의 없음 / 매우 낮음",
      anchorHigh: "매우 큼 / 매우 높음",
    },
    {
      key: "physical",
      label: "신체적 요구 (Physical Demand)",
      question: "이 과제를 수행하는 동안, 손·팔·몸을 쓰는 등의 신체적 부담은 얼마나 있었다고 느끼셨나요?",
      desc: "마우스/키보드 사용, 자세 유지 등 신체적인 활동과 피로의 정도를 평가해주세요.",
      anchorLow: "거의 없음 / 매우 낮음",
      anchorHigh: "매우 큼 / 매우 높음",
    },
    {
      key: "temporal",
      label: "시간적 요구 (Temporal Demand)",
      question: "이 과제를 수행하는 동안, 시간 압박이나 촉박함을 얼마나 느끼셨나요?",
      desc: "빨리 읽고 답해야 한다는 느낌, 시간이 부족하다는 느낌이 어느 정도였는지 평가해주세요.",
      anchorLow: "거의 없음 / 매우 낮음",
      anchorHigh: "매우 큼 / 매우 높음",
    },
    {
      key: "performance",
      label: "수행 (Performance)",
      question: "방금 과제를 얼마나 잘 수행했다고 느끼셨나요? (점수가 낮을수록 '잘했다'에 가깝습니다.)",
      desc: "자신의 이해도와 퀴즈 정답률을 고려했을 때, 전체적으로 얼마나 만족스러운 수행이었는지 평가해주세요.",
      anchorLow: "매우 잘 수행했다",
      anchorHigh: "매우 못 수행했다",
    },
    {
      key: "effort",
      label: "노력 (Effort)",
      question: "방금 과제를 잘 해내기 위해 얼마나 많은 노력을 기울였다고 느끼셨나요?",
      desc: "목표(내용 이해, 퀴즈 정답)를 달성하려고 쏟은 정신적·신체적 에너지의 양을 평가해주세요.",
      anchorLow: "거의 없음 / 매우 낮음",
      anchorHigh: "매우 큼 / 매우 높음",
    },
    {
      key: "frustration",
      label: "좌절감 (Frustration)",
      question: "이 과제를 하는 동안, 짜증·스트레스·좌절감을 얼마나 느끼셨나요?",
      desc: "긴장, 초조함, 짜증, 실망, 불안 등의 부정적 감정을 어느 정도 느꼈는지 평가해주세요.",
      anchorLow: "거의 없음 / 매우 낮음",
      anchorHigh: "매우 큼 / 매우 높음",
    },
  ] as TlxDimension[],
};
