"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  GroupId,
  ParticipantState,
  PerQuestionResult,
  UIType,
  TlxScores,
  InterruptTrigger,
} from "./types";

const empty: ParticipantState = {
  participant_id: "",
  group: "G1",
  ui_order: ["basic", "structured"],
  question_order: ["A1", "B1"],
  prior: {},
  results: {},
  pref_ui: null,
  pref_reason: "",
  started_at: 0,
};

interface Store extends ParticipantState {
  init: (p: Partial<ParticipantState>) => void;
  reset: () => void;
  setPrior: (prior: Record<string, number>) => void;
  ensureResult: (qid: string, ui: UIType) => void;
  updateResult: (qid: string, patch: Partial<PerQuestionResult>) => void;
  logChunkOpen: (qid: string, chunk_order: number) => void;
  logBookmark: (qid: string, chunk_order: number) => void;
  setTlx: (qid: string, tlx: TlxScores) => void;
  setInterrupt: (
    qid: string,
    lag: number,
    used: InterruptTrigger,
    delayMs: number,
    correct: boolean
  ) => void;
  setPref: (ui: UIType, reason: string) => void;
}

const blankResult = (qid: string, ui: UIType): PerQuestionResult => ({
  question_id: qid,
  ui,
  read_time_ms: 0,
  chunk_open_log: [],
  bookmark_log: [],
  resumption_lag_ms: null,
  quiz_ans_1: "",
  quiz_ans_2: "",
  quiz_time_auto_ms: 0,
  quiz_time_manual_s: null,
  tlx: { mental: 50, physical: 50, temporal: 50, performance: 50, effort: 50, frustration: 50 },
  interrupt_triggered: false,
  interrupt_trigger_used: null,
  interrupt_delay_used_ms: null,
  arithmetic_correct: null,
});

export const useExperimentStore = create<Store>()(
  persist(
    (set, get) => ({
      ...empty,
      init: (p) => set({ ...empty, ...p, started_at: Date.now() }),
      reset: () => set({ ...empty }),
      setPrior: (prior) => set({ prior }),
      ensureResult: (qid, ui) => {
        const cur = get().results[qid];
        if (!cur) {
          set((s) => ({ results: { ...s.results, [qid]: blankResult(qid, ui) } }));
        }
      },
      updateResult: (qid, patch) =>
        set((s) => ({
          results: { ...s.results, [qid]: { ...s.results[qid], ...patch } },
        })),
      logChunkOpen: (qid, chunk_order) =>
        set((s) => ({
          results: {
            ...s.results,
            [qid]: {
              ...s.results[qid],
              chunk_open_log: [
                ...s.results[qid].chunk_open_log,
                { chunk_order, ts: performance.now() },
              ],
            },
          },
        })),
      logBookmark: (qid, chunk_order) =>
        set((s) => ({
          results: {
            ...s.results,
            [qid]: {
              ...s.results[qid],
              bookmark_log: [
                ...s.results[qid].bookmark_log,
                { chunk_order, ts: performance.now() },
              ],
            },
          },
        })),
      setTlx: (qid, tlx) =>
        set((s) => ({
          results: { ...s.results, [qid]: { ...s.results[qid], tlx } },
        })),
      setInterrupt: (qid, lag, used, delayMs, correct) =>
        set((s) => ({
          results: {
            ...s.results,
            [qid]: {
              ...s.results[qid],
              resumption_lag_ms: lag,
              interrupt_triggered: true,
              interrupt_trigger_used: used,
              interrupt_delay_used_ms: delayMs,
              arithmetic_correct: correct,
            },
          },
        })),
      setPref: (ui, reason) => set({ pref_ui: ui, pref_reason: reason }),
    }),
    {
      name: "ergo-experiment-v1",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
