"use client";
import React, { useEffect, useRef } from "react";
import type { Chunk } from "@/lib/types";

interface Props {
  question_text: string;
  chunks: Chunk[];
  onScroll?: (pct: number) => void;
  /** 3번째 섹션 본문이 화면에 처음 진입했을 때 호출 (한 번만) */
  onSection3Visible?: () => void;
}

/**
 * 기본 UI: 설계 원칙 미적용 (보고서 비교 대상).
 * BLUF 없음, 비유 없음, 섹션/접기 없음, 강조 없음. 본문 텍스트만 스크롤로 출력.
 */
export function BasicUI({ question_text, chunks, onScroll, onSection3Visible }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const section3Ref = useRef<HTMLParagraphElement>(null);
  const section3FiredRef = useRef(false);

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
    if (!onSection3Visible || !section3Ref.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !section3FiredRef.current) {
            section3FiredRef.current = true;
            onSection3Visible();
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(section3Ref.current);
    return () => observer.disconnect();
  }, [onSection3Visible]);

  return (
    <article ref={ref} className="max-w-3xl">
      <div className="mb-6 pb-4 border-b border-line">
        <div className="text-xs uppercase tracking-wider text-muted mb-1">질문</div>
        <p className="text-[15px] text-ink m-0">{question_text}</p>
      </div>

      {chunks.map((c, idx) => (
        <p
          key={c.chunk_order}
          ref={idx === 2 ? section3Ref : undefined}
          className="text-[16px] leading-[1.6] text-ink mb-4 whitespace-pre-wrap"
        >
          {c.body}
        </p>
      ))}
    </article>
  );
}
