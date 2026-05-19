export type UIType = "basic" | "structured";

export type GroupId = "G1" | "G2" | "G3" | "G4";

export type InterruptTrigger =
  | "scroll30"
  | "scroll40"
  | "scroll50"
  | "time45"
  | "time60"
  | "chunk2";

export interface Passage {
  passage_id: string;
  text: string;
}

export interface Question {
  question_id: string;
  set: "A" | "B";
  topic: string;
  passage_id: string;
  question_text: string;
}

export interface Chunk {
  question_id: string;
  chunk_order: number;
  title: string;
  body: string;
  transition: string;
}

export interface Bluf {
  question_id: string;
  bullet_1: string;
  bullet_2: string;
  bullet_3: string;
}

export interface Analogy {
  question_id: string;
  analogy_text: string;
}

export interface QuizItem {
  question_id: string;
  q_order: number;
  question_text: string;
  answer_key: string;
}

/** 사전 배경지식 설문 항목 (1~5 Likert) */
export interface PriorItem {
  item_key: string;       // 응답 컬럼명에 사용 (prior_<item_key>)
  label: string;          // 화면에 보이는 질문 문구
}

export interface ContentBundle {
  passages: Passage[];
  questions: Question[];
  chunks: Chunk[];
  bluf: Bluf[];
  analogy: Analogy[];
  quiz: QuizItem[];
  prior_knowledge: PriorItem[];
}

export interface TlxScores {
  mental: number;
  physical: number;
  temporal: number;
  performance: number;
  effort: number;
  frustration: number;
}

export interface PerQuestionResult {
  question_id: string;
  ui: UIType;
  read_time_ms: number;
  chunk_open_log: { chunk_order: number; ts: number }[];
  bookmark_log: { chunk_order: number; ts: number }[];
  resumption_lag_ms: number | null;
  quiz_ans_1: string;
  quiz_ans_2: string;
  quiz_time_auto_ms: number;
  quiz_time_manual_s: number | null;
  tlx: TlxScores;
  interrupt_triggered: boolean;
  interrupt_trigger_used: InterruptTrigger | null;
  arithmetic_correct: boolean | null;
}

export interface ParticipantState {
  participant_id: string;
  group: GroupId;
  ui_order: [UIType, UIType];
  question_order: [string, string];
  interrupt_in: UIType;
  /** 사전 설문 응답: { item_key: 1~5 } */
  prior: Record<string, number>;
  results: Record<string, PerQuestionResult>;
  pref_ui: UIType | null;
  pref_reason: string;
  started_at: number;
}
