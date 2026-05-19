"use client";
import React, { useEffect, useMemo, useState } from "react";
import type { Chunk } from "@/lib/types";
import { BLUFBox } from "./BLUFBox";
import { ChunkCard } from "./ChunkCard";
import { SidebarSummary } from "./SidebarSummary";
import { ChunkProgress } from "./ProgressBar";

interface Props {
  question_text: string;
  chunks: Chunk[];
  blufBullets: string[];
  analogyText: string;
  onChunkOpen?: (chunk_order: number) => void;
  onBookmark?: (chunk_order: number) => void;
}

export function StructuredUI({
  question_text,
  chunks,
  blufBullets,
  analogyText,
  onChunkOpen,
  onBookmark,
}: Props) {
  const [openMap, setOpenMap] = useState<Record<number, boolean>>({ 1: true });
  const [bookmarks, setBookmarks] = useState<Record<number, boolean>>({});
  const [showAnalogy, setShowAnalogy] = useState(false);
  const [lastRead, setLastRead] = useState<number | undefined>(undefined);

  const opened = useMemo(() => Object.values(openMap).filter(Boolean).length, [openMap]);

  const toggleChunk = (order: number) => {
    setOpenMap((prev) => {
      const next = { ...prev, [order]: !prev[order] };
      if (!prev[order]) {
        onChunkOpen?.(order);
        setLastRead(order);
      }
      return next;
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
      const el = document.getElementById(`chunk-${order}`);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
      <div>
        <div className="mb-6 pb-4 border-b border-line">
          <div className="text-xs uppercase tracking-wider text-muted mb-1">질문</div>
          <p className="text-[15px] text-ink m-0">{question_text}</p>
        </div>

        <BLUFBox bullets={blufBullets} />

        <div className="mb-5">
          <ChunkProgress opened={opened} total={chunks.length} />
        </div>

        <div className="space-y-3">
          {chunks.map((c, idx) => {
            const open = !!openMap[c.chunk_order];
            const remaining = chunks.length - idx - 1;
            return (
              <ChunkCard
                key={c.chunk_order}
                order={c.chunk_order}
                total={chunks.length}
                title={c.title}
                body={c.body}
                transition={c.transition}
                open={open}
                bookmarked={!!bookmarks[c.chunk_order]}
                onToggle={() => toggleChunk(c.chunk_order)}
                onBookmark={() => toggleBookmark(c.chunk_order)}
                remaining={remaining}
              />
            );
          })}
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={() => setShowAnalogy((v) => !v)}
            className="w-full text-left bg-card border border-line rounded-2xl px-6 py-4 hover:border-zinc-300 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-accent-700">
                  비유로 이해하기
                </span>
              </div>
              <span className="text-sm text-muted">
                {showAnalogy ? "접기" : "펼치기"}
              </span>
            </div>
            {showAnalogy && (
              <p className="mt-3 text-[15px] leading-7 text-ink animate-slide-down">
                {analogyText}
              </p>
            )}
          </button>
        </div>
      </div>

      <SidebarSummary
        bullets={blufBullets}
        bookmarks={chunks
          .filter((c) => bookmarks[c.chunk_order])
          .map((c) => ({ order: c.chunk_order, title: c.title }))}
        lastRead={lastRead}
        onJump={jump}
      />
    </div>
  );
}
