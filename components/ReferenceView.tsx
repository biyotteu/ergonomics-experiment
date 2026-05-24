"use client";
import React from "react";
import type { Chunk, UIType } from "@/lib/types";
import { BLUFBox } from "./BLUFBox";

interface Props {
  ui: UIType;
  question_text: string;
  chunks: Chunk[];
  blufText: string;
}

/**
 * 퀴즈 페이지 좌측의 오픈북 참조 자료.
 * 읽기 단계에서 본 UI 형태를 유지하되 모두 펼친 상태로 표시.
 */
export function ReferenceView({ ui, question_text, chunks, blufText }: Props) {
  if (ui === "basic") {
    return (
      <article className="max-w-none">
        <div className="mb-4 pb-3 border-b border-line">
          <div className="text-xs uppercase tracking-wider text-muted mb-1">질문</div>
          <p className="text-sm text-ink m-0 font-medium">{question_text}</p>
        </div>
        {chunks.map((c) => (
          <p
            key={c.chunk_order}
            className="text-[13.5px] leading-[1.6] text-ink mb-4 whitespace-pre-wrap"
          >
            {c.body}
          </p>
        ))}
      </article>
    );
  }

  // structured: BLUF + 5섹션 (섹션별 비유 포함) 모두 펼침
  return (
    <div>
      <div className="mb-4 pb-3 border-b border-line">
        <div className="text-xs uppercase tracking-wider text-muted mb-1">질문</div>
        <p className="text-sm text-ink m-0 font-medium">{question_text}</p>
      </div>

      <BLUFBox text={blufText} />

      <div className="space-y-3">
        {chunks.map((c) => (
          <div
            key={c.chunk_order}
            className="bg-card border border-line rounded-2xl p-5 shadow-card"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-semibold text-muted tabular-nums">
                섹션 {c.chunk_order} / {chunks.length}
              </span>
              <h3 className="font-semibold text-ink text-sm">{c.title}</h3>
            </div>
            {c.analogy && (
              <div className="border border-dashed border-zinc-400 rounded-lg p-3 mb-3 bg-zinc-50">
                <div className="text-xs font-semibold text-muted mb-1">
                  공의 굴러내림으로 이해하기
                </div>
                <p className="text-[12.5px] leading-6 text-ink">{c.analogy}</p>
              </div>
            )}
            <p className="text-[13.5px] leading-7 text-ink whitespace-pre-wrap">{c.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
