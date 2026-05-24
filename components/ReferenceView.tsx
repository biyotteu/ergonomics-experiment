"use client";
import React, { useState } from "react";
import type { Chunk, UIType } from "@/lib/types";
import { BLUFBox } from "./BLUFBox";
import { ChunkCard } from "./ChunkCard";

interface Props {
  ui: UIType;
  question_text: string;
  chunks: Chunk[];
  blufText: string;
}

/**
 * 퀴즈 페이지 좌측의 오픈북 참조 자료.
 * - basic: 본문만 평문으로 표시
 * - structured: BLUF + 섹션 카드(접기/펼치기 가능, 기본은 모두 펼침). 북마크 버튼은 숨김.
 */
export function ReferenceView({ ui, question_text, chunks, blufText }: Props) {
  // 구조화 자료: 기본적으로 모두 펼친 상태로 시작하되 접기/펼치기 가능
  const [openMap, setOpenMap] = useState<Record<number, boolean>>(() =>
    Object.fromEntries(chunks.map((c) => [c.chunk_order, true]))
  );

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

  // structured
  const allOpen = chunks.every((c) => openMap[c.chunk_order]);
  const toggleAll = () => {
    const next = !allOpen;
    setOpenMap(Object.fromEntries(chunks.map((c) => [c.chunk_order, next])));
  };

  return (
    <div>
      <div className="mb-4 pb-3 border-b border-line flex items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted mb-1">질문</div>
          <p className="text-sm text-ink m-0 font-medium">{question_text}</p>
        </div>
        <button
          type="button"
          onClick={toggleAll}
          className="flex-shrink-0 text-xs text-accent-700 border border-line rounded-lg px-2.5 py-1.5 hover:bg-zinc-50"
        >
          {allOpen ? "모두 접기" : "모두 펼치기"}
        </button>
      </div>

      <BLUFBox text={blufText} />

      <div className="space-y-3">
        {chunks.map((c) => (
          <ChunkCard
            key={c.chunk_order}
            order={c.chunk_order}
            total={chunks.length}
            title={c.title}
            analogy={c.analogy}
            body={c.body}
            transition={c.transition}
            open={!!openMap[c.chunk_order]}
            bookmarked={false}
            onToggle={() =>
              setOpenMap((p) => ({ ...p, [c.chunk_order]: !p[c.chunk_order] }))
            }
            onBookmark={() => {}}
            hideBookmark
          />
        ))}
      </div>
    </div>
  );
}
