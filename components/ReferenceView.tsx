"use client";
import React from "react";
import type { Chunk, UIType } from "@/lib/types";
import { BLUFBox } from "./BLUFBox";

interface Props {
  ui: UIType;
  question_text: string;
  chunks: Chunk[];
  blufBullets: string[];
  analogyText: string;
}

/**
 * 퀴즈 페이지 좌측에 표시되는 "오픈북" 참조 자료.
 * 읽기 단계에서 봤던 UI 형태를 유지하되, 인터럽션/사이드바/토글 없이 모두 펼친 상태로 표시.
 */
export function ReferenceView({
  ui,
  question_text,
  chunks,
  blufBullets,
  analogyText,
}: Props) {
  if (ui === "basic") {
    const intro = blufBullets.join(" ");
    return (
      <article className="prose prose-zinc max-w-none">
        <div className="mb-4 pb-3 border-b border-line">
          <div className="text-xs uppercase tracking-wider text-muted mb-1">질문</div>
          <p className="text-sm text-ink m-0 font-medium">{question_text}</p>
        </div>
        <p className="text-[13.5px] leading-7 text-ink mb-4">{intro}</p>
        {chunks.map((c) => (
          <p
            key={c.chunk_order}
            className="text-[13.5px] leading-7 text-ink mb-4 whitespace-pre-wrap"
          >
            {c.body}
          </p>
        ))}
        <p className="text-[13.5px] leading-7 text-ink mt-6 mb-4">
          <strong>비유로 이해하기. </strong>
          {analogyText}
        </p>
      </article>
    );
  }

  // structured: 청크 카드 모두 펼침, 사이드바 X
  return (
    <div>
      <div className="mb-4 pb-3 border-b border-line">
        <div className="text-xs uppercase tracking-wider text-muted mb-1">질문</div>
        <p className="text-sm text-ink m-0 font-medium">{question_text}</p>
      </div>

      <BLUFBox bullets={blufBullets} />

      <div className="space-y-3">
        {chunks.map((c) => (
          <div
            key={c.chunk_order}
            className="bg-card border border-line rounded-2xl p-5 shadow-card"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-semibold text-muted tabular-nums">
                {String(c.chunk_order).padStart(2, "0")} / {String(chunks.length).padStart(2, "0")}
              </span>
              <h3 className="font-semibold text-ink text-sm">{c.title}</h3>
            </div>
            <p className="text-[13.5px] leading-7 text-ink whitespace-pre-wrap">{c.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 bg-accent-50 border border-accent-100 rounded-2xl p-5">
        <div className="text-xs font-semibold uppercase tracking-wider text-accent-700 mb-2">
          비유로 이해하기
        </div>
        <p className="text-[13.5px] leading-7 text-ink">{analogyText}</p>
      </div>
    </div>
  );
}
