"use client";
import React from "react";

interface Props {
  order: number;
  total: number;
  title: string;
  analogy: string;
  body: string;
  transition: string;
  open: boolean;
  bookmarked: boolean;
  onToggle: () => void;
  onBookmark: () => void;
}

/** 섹션 카드. 펼치면 [비유 → 본문 → 전환문구] 순서로 표시. */
export function ChunkCard({
  order,
  total,
  title,
  analogy,
  body,
  transition,
  open,
  bookmarked,
  onToggle,
  onBookmark,
}: Props) {
  return (
    <div
      id={`chunk-${order}`}
      className="bg-card border border-line rounded-2xl shadow-card transition-all"
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-muted tabular-nums">
            섹션 {order} / {total}
          </span>
          <h3 className="font-semibold text-ink">{title}</h3>
        </div>
        <span
          className={`inline-flex items-center justify-center w-7 h-7 rounded-full border border-line text-muted transition-transform ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      {open ? (
        <div className="px-6 pb-6 animate-slide-down">
          {/* 섹션별 비유 (비유 먼저, 개념 설명 나중) */}
          {analogy && (
            <div className="border border-dashed border-zinc-400 rounded-xl p-4 mb-4 bg-zinc-50">
              <div className="text-xs font-semibold text-muted mb-1">
                공의 굴러내림으로 이해하기
              </div>
              <p className="text-sm leading-6 text-ink">{analogy}</p>
            </div>
          )}

          <p className="text-[15px] leading-7 text-ink whitespace-pre-wrap">{body}</p>

          {transition && (
            <p className="mt-4 text-sm text-muted italic">→ {transition}</p>
          )}

          <div className="mt-4">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onBookmark();
              }}
              className={`inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border transition-colors ${
                bookmarked
                  ? "border-accent-600 text-accent-700 bg-accent-50"
                  : "border-line text-muted hover:text-ink hover:border-zinc-300"
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill={bookmarked ? "currentColor" : "none"}>
                <path d="M3 1.5h8v11l-4-2.5-4 2.5v-11z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
              {bookmarked ? "여기까지 읽었어요 ✓" : "여기까지 읽었어요"}
            </button>
          </div>
        </div>
      ) : (
        <div className="px-6 pb-4 -mt-1">
          <span className="text-sm text-accent-700 font-medium">펼쳐 보기 →</span>
        </div>
      )}
    </div>
  );
}
