"use client";
import React from "react";

interface SectionItem {
  order: number;
  title: string;
  read: boolean;
}

interface Props {
  blufText: string;
  sections: SectionItem[];
  bookmarks: { order: number; title: string }[];
  currentSection?: number;
  onJump: (order: number) => void;
}

/**
 * 요약 사이드바: 목차(읽음 여부 표시) + BLUF + 북마크.
 * 진행 상태 표시(Progress Indicator)는 목차와 기능이 중복되어 제거됨 (팀 결정 2026-05-20).
 */
export function SidebarSummary({
  blufText,
  sections,
  bookmarks,
  currentSection,
  onJump,
}: Props) {
  return (
    <aside className="sticky top-6 self-start space-y-4 hidden lg:block">
      {/* 목차 */}
      <div className="bg-card border border-line rounded-2xl p-5 shadow-card">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
          목차
        </div>
        <ul className="space-y-1.5">
          {sections.map((s) => (
            <li key={s.order}>
              <button
                type="button"
                onClick={() => onJump(s.order)}
                className={`flex items-center gap-2 text-left text-sm w-full ${
                  s.order === currentSection
                    ? "font-semibold text-ink"
                    : "text-muted hover:text-ink"
                }`}
              >
                <span aria-hidden>{s.read ? "✓" : "○"}</span>
                <span>{s.title}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* BLUF 요약 */}
      <div className="bg-card border border-line rounded-2xl p-5 shadow-card">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">
          핵심 요약
        </div>
        <p className="text-[13px] leading-relaxed text-ink">{blufText}</p>
      </div>

      {/* 북마크 */}
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
                  섹션 {b.order}. {b.title}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
