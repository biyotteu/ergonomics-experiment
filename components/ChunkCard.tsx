"use client";
import React from "react";

interface Props {
  order: number;
  total: number;
  title: string;
  body: string;
  transition: string;
  open: boolean;
  bookmarked: boolean;
  onToggle: () => void;
  onBookmark: () => void;
  remaining: number;
}

export function ChunkCard({
  order,
  total,
  title,
  body,
  transition,
  open,
  bookmarked,
  onToggle,
  onBookmark,
  remaining,
}: Props) {
  return (
    <div
      id={`chunk-${order}`}
      className={`bg-card border rounded-2xl shadow-card transition-all ${
        open ? "border-line" : "border-line hover:border-zinc-300"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-muted tabular-nums">
            {String(order).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
          <h3 className="font-semibold text-ink">{title}</h3>
        </div>
        <div className="flex items-center gap-3">
          {!open && remaining > 0 && (
            <span className="text-xs text-muted hidden sm:inline">
              남은 내용 {remaining}개
            </span>
          )}
          <span
            className={`inline-flex items-center justify-center w-7 h-7 rounded-full border border-line text-muted transition-transform ${
              open ? "rotate-180" : ""
            }`}
            aria-hidden
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </div>
      </button>

      {open && (
        <div className="px-6 pb-6 animate-slide-down">
          <p className="text-[15px] leading-7 text-ink whitespace-pre-wrap">{body}</p>
          {transition && (
            <p className="mt-4 text-sm text-muted italic">↓ {transition}</p>
          )}
          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onBookmark(); }}
              className={`inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border transition-colors ${
                bookmarked
                  ? "border-accent-600 text-accent-700 bg-accent-50"
                  : "border-line text-muted hover:text-ink hover:border-zinc-300"
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill={bookmarked ? "currentColor" : "none"}>
                <path d="M3 1.5h8v11l-4-2.5-4 2.5v-11z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
              {bookmarked ? "북마크 됨" : "북마크"}
            </button>
          </div>
        </div>
      )}

      {!open && (
        <div className="px-6 pb-4 -mt-1">
          <span className="text-sm text-accent-700 font-medium">다음 설명 보기 →</span>
        </div>
      )}
    </div>
  );
}
