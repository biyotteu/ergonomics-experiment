"use client";
import React, { useEffect, useRef } from "react";
import type { Chunk } from "@/lib/types";

interface Props {
  question_text: string;
  chunks: Chunk[];
  blufBullets: string[];
  analogyText: string;
  onScroll?: (pct: number) => void;
  /** 3번째 청크 본문이 화면에 처음 진입했을 때 호출 (한 번만) */
  onSection3Visible?: () => void;
}

export function BasicUI({
  question_text,
  chunks,
  blufBullets,
  analogyText,
  onScroll,
  onSection3Visible,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const section3Ref = useRef<HTMLParagraphElement>(null);
  const section3FiredRef = useRef(false);

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
      { threshold: 0.3 } // 30% 이상 보이면 발동
    );
    observer.observe(section3Ref.current);
    return () => observer.disconnect();
  }, [onSection3Visible]);

  const intro = blufBullets.join(" ");

  return (
    <article ref={ref} className="prose prose-zinc max-w-none">
      <div className="mb-6 pb-4 border-b border-line">
        <div className="text-xs uppercase tracking-wider text-muted mb-1">질문</div>
        <p className="text-[15px] text-ink m-0">{question_text}</p>
      </div>

      <p className="text-[15px] leading-7 text-ink mb-4">{intro}</p>

      {chunks.map((c, idx) => (
        <p
          key={c.chunk_order}
          ref={idx === 2 ? section3Ref : undefined}
          className="text-[15px] leading-7 text-ink mb-4 whitespace-pre-wrap"
        >
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
