export type UIType = "basic" | "structured";

export type GroupId = "G1" | "G2" | "G3" | "G4";

export type InterruptTrigger =
  | "auto"
  | "chunk3"
  | "section3_scroll"
  | "scroll30" | "scroll40" | "scroll50"
  | "time45" | "time60"
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

/** 섹션(청크). 각 섹션은 자체 비유를 가진다. */
export interface Chunk {
  question_id: string;
  chunk_order: number;
  title: string;
  analogy: string;   // 섹션별 "공의 굴러내림으로 이해하기" 비유
  body: string;
  transition: string;
}

/** BLUF는 한 단락 텍스트 */
export interface Bluf {
  question_id: string;
  text: string;
}

export interface QuizItem {
  question_id: string;
  q_order: number;
  question_text: string;
  answer_key: string;
}

export interface PriorItem {
  item_key: string;
  label: string;
}

export interface ContentBundle {
  passages: Passage[];
  questions: Question[];
  chunks: Chunk[];
  bluf: Bluf[];
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
  interrupt_delay_used_ms: number | null;
  arithmetic_correct: boolean | null;
}

export interface ParticipantState {
  participant_id: string;
  group: GroupId;
  ui_order: [UIType, UIType];
  question_order: [string, string];
  prior: Record<string, number>;
  results: Record<string, PerQuestionResult>;
  pref_ui: UIType | null;
  pref_reason: string;
  started_at: number;
}
