"use client";
import React, { useEffect, useRef } from "react";
import type { Chunk } from "@/lib/types";

interface Props {
  question_text: string;
  chunks: Chunk[];
  blufBullets: string[];
  analogyText: string;
  onScroll?: (pct: number) => void;
}

/**
 * BasicUI: ChatGPT처럼 구조 없이 응답을 한 화면에 쏟아냄.
 * - BLUF 없음 (그냥 도입부 단락으로 흐름)
 * - 청크 헤더 없음 (단락 구분만)
 * - 비유는 본문 끝에 일반 단락으로
 */
export function BasicUI({
  question_text,
  chunks,
  blufBullets,
  analogyText,
  onScroll,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!onScroll) return;
    const handler = () => {
      const el = ref.current;
      if (!el) return;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const pct = total > 0 ? Math.min(100, (window.scrollY / total) * 100) : 0;
      onScroll(pct);
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [onScroll]);

  // 단락 형태로 흐름 (BLUF → 청크 본문 → 비유)
  const intro = blufBullets.join(" ");

  return (
    <article ref={ref} className="prose prose-zinc max-w-none">
      <div className="mb-6 pb-4 border-b border-line">
        <div className="text-xs uppercase tracking-wider text-muted mb-1">질문</div>
        <p className="text-[15px] text-ink m-0">{question_text}</p>
      </div>

      <p className="text-[15px] leading-7 text-ink mb-4">{intro}</p>

      {chunks.map((c) => (
        <p key={c.chunk_order} className="text-[15px] leading-7 text-ink mb-4 whitespace-pre-wrap">
          {c.body}
        </p>
      ))}

      <p className="text-[15px] leading-7 text-ink mt-6 mb-4">
        <strong>비유로 이해하기. </strong>
        {analogyText}
      </p>
    </article>
  );
}
