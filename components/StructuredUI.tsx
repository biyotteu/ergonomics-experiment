"use client";
import React, { useState } from "react";
import type { Chunk } from "@/lib/types";
import { BLUFBox } from "./BLUFBox";
import { ChunkCard } from "./ChunkCard";
import { SidebarSummary } from "./SidebarSummary";

interface Props {
  question_text: string;
  chunks: Chunk[];
  blufText: string;
  onChunkOpen?: (chunk_order: number) => void;
  onBookmark?: (chunk_order: number) => void;
}

export function StructuredUI({
  question_text,
  chunks,
  blufText,
  onChunkOpen,
  onBookmark,
}: Props) {
  const [openMap, setOpenMap] = useState<Record<number, boolean>>({});
  const [readMap, setReadMap] = useState<Record<number, boolean>>({});
  const [bookmarks, setBookmarks] = useState<Record<number, boolean>>({});
  const [currentSection, setCurrentSection] = useState<number | undefined>(undefined);

  const toggleChunk = (order: number) => {
    setOpenMap((prev) => {
      const willOpen = !prev[order];
      if (willOpen) {
        onChunkOpen?.(order);
        setReadMap((r) => ({ ...r, [order]: true }));
        setCurrentSection(order);
      }
      return { ...prev, [order]: willOpen };
    });
  };

  const toggleBookmark = (order: number) => {
    setBookmarks((prev) => {
      const next = { ...prev, [order]: !prev[order] };
      if (!prev[order]) onBookmark?.(order);
      return next;
    });
  };

  const jump = (order: number) => {
    if (!openMap[order]) toggleChunk(order);
    setTimeout(() => {
      document
        .getElementById(`chunk-${order}`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
      <div>
        <div className="mb-6 pb-4 border-b border-line">
          <div className="text-xs uppercase tracking-wider text-muted mb-1">질문</div>
          <p className="text-[15px] text-ink m-0">{question_text}</p>
        </div>

        <BLUFBox text={blufText} />

        {/* 순서대로 읽기 권장 안내 (순서 강제 대신, 팀 결정 2026-05-20) */}
        <div className="mb-4 text-sm text-muted bg-zinc-50 border border-line rounded-xl px-4 py-2.5">
          각 개념이 앞 내용을 바탕으로 설명되므로, 위에서부터 순서대로 펼쳐 읽으시길 권장합니다.
        </div>

        <div className="space-y-3">
          {chunks.map((c) => (
            <ChunkCard
              key={c.chunk_order}
              order={c.chunk_order}
              total={chunks.length}
              title={c.title}
              analogy={c.analogy}
              body={c.body}
              table={c.table}
              transition={c.transition}
              open={!!openMap[c.chunk_order]}
              bookmarked={!!bookmarks[c.chunk_order]}
              onToggle={() => toggleChunk(c.chunk_order)}
              onBookmark={() => toggleBookmark(c.chunk_order)}
            />
          ))}
        </div>
      </div>

      <SidebarSummary
        blufText={blufText}
        sections={chunks.map((c) => ({
          order: c.chunk_order,
          title: c.title,
          read: !!readMap[c.chunk_order],
        }))}
        bookmarks={chunks
          .filter((c) => bookmarks[c.chunk_order])
          .map((c) => ({ order: c.chunk_order, title: c.title }))}
        currentSection={currentSection}
        onJump={jump}
      />
    </div>
  );
}
