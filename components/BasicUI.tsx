"use client";
import React, { useEffect, useRef } from "react";
import type { Chunk } from "@/lib/types";
import { RichText, TableBlock } from "./RichText";

interface Props {
  question_text: string;
  chunks: Chunk[];
  onScroll?: (pct: number) => void;
  /** 섹션 3 시작 마커가 화면 상단 30% 지점에 도달했을 때 호출 (한 번만) */
  onSection3Visible?: () => void;
}

/**
 * 기본 UI: 설계 원칙 미적용 (보고서 비교 대상).
 * BLUF 없음, 비유 없음, 섹션 카드 없음. 본문 텍스트만 스크롤로 출력.
 */
export function BasicUI({ question_text, chunks, onScroll, onSection3Visible }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const markerRef = useRef<HTMLSpanElement>(null);
  const firedRef = useRef(false);

  useEffect(() => {
    if (!onScroll) return;
    const handler = () => {
      if (!ref.current) return;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const pct = total > 0 ? Math.min(100, (window.scrollY / total) * 100) : 0;
      onScroll(pct);
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [onScroll]);

  useEffect(() => {
    if (!onSection3Visible || !markerRef.current) return;
    // rootMargin 하단 -70% → 관찰 영역은 viewport 상단 0~30%.
    // 섹션 3 시작 마커가 화면 높이의 약 30% 지점에 도달하면 발동.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !firedRef.current) {
            firedRef.current = true;
            onSection3Visible();
            observer.disconnect();
            break;
          }
        }
      },
      { rootMargin: "0px 0px -70% 0px", threshold: 0 }
    );
    observer.observe(markerRef.current);
    return () => observer.disconnect();
  }, [onSection3Visible]);

  return (
    <article ref={ref} className="max-w-3xl">
      <div className="mb-6 pb-4 border-b border-line">
        <div className="text-xs uppercase tracking-wider text-muted mb-1">질문</div>
        <p className="text-[15px] text-ink m-0">{question_text}</p>
      </div>

      {chunks.map((c, idx) => (
        <div key={c.chunk_order} className="mb-4">
          {/* 섹션 3 시작 마커 (높이 0, 화면에 보이지 않음) */}
          {idx === 2 && (
            <span ref={markerRef} aria-hidden style={{ display: "block", height: 0 }} />
          )}
          <RichText text={c.body} />
          {c.table && <TableBlock table={c.table} />}
        </div>
      ))}
    </article>
  );
}
