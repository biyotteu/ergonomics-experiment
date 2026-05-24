import type { ContentBundle, Question, Chunk, Bluf, QuizItem, Passage } from "./types";
import fallback from "@/data/content.json";

export async function getContent(): Promise<ContentBundle> {
  const url = process.env.SHEET_API_URL;
  if (!url) return fallback as unknown as ContentBundle;
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`Sheet API ${res.status}`);
    return (await res.json()) as ContentBundle;
  } catch (e) {
    console.warn("Falling back to local content:", e);
    return fallback as unknown as ContentBundle;
  }
}

export function findQuestion(c: ContentBundle, qid: string): Question | undefined {
  return c.questions.find((q) => q.question_id === qid);
}
export function findPassage(c: ContentBundle, pid: string): Passage | undefined {
  return c.passages.find((p) => p.passage_id === pid);
}
export function findChunks(c: ContentBundle, qid: string): Chunk[] {
  return c.chunks
    .filter((x) => x.question_id === qid)
    .sort((a, b) => a.chunk_order - b.chunk_order);
}
export function findBluf(c: ContentBundle, qid: string): Bluf | undefined {
  return c.bluf.find((b) => b.question_id === qid);
}
export function findQuiz(c: ContentBundle, qid: string): QuizItem[] {
  return c.quiz
    .filter((q) => q.question_id === qid)
    .sort((a, b) => a.q_order - b.q_order);
}
