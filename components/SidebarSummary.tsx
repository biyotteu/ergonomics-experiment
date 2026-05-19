"use client";
import React from "react";

interface Props {
  bullets: string[];
  bookmarks: { order: number; title: string }[];
  lastRead?: number;
  onJump: (order: number) => void;
}

export function SidebarSummary({ bullets, bookmarks, lastRead, onJump }: Props) {
  return (
    <aside className="sticky top-6 self-start space-y-4 hidden lg:block">
      <div className="bg-card border border-line rounded-2xl p-5 shadow-card">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
          요약
        </div>
        <ul className="space-y-2 text-[13px] leading-relaxed text-ink">
          {bullets.map((b, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-accent-600 flex-shrink-0" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-card border border-line rounded-2xl p-5 shadow-card">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
          북마크
        </div>
        {bookmarks.length === 0 ? (
          <p className="text-xs text-muted">아직 없습니다</p>
        ) : (
          <ul className="space-y-2">
            {bookmarks.map((b) => (
              <li key={b.order}>
                <button
                  type="button"
                  onClick={() => onJump(b.order)}
                  className="text-left text-sm text-ink hover:text-accent-700"
                >
                  {String(b.order).padStart(2, "0")}. {b.title}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {lastRead && (
        <div className="bg-card border border-line rounded-2xl p-5 shadow-card">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">
            마지막 위치
          </div>
          <button
            type="button"
            onClick={() => onJump(lastRead)}
            className="text-sm text-ink hover:text-accent-700"
          >
            청크 {lastRead}로 이동 →
          </button>
        </div>
      )}
    </aside>
  );
}
