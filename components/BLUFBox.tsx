import React from "react";

/** BLUF: 응답 최상단 핵심 요약 (한 단락, 항상 펼쳐진 상태) */
export function BLUFBox({ text }: { text: string }) {
  return (
    <div className="bg-card border-2 border-ink rounded-xl p-5 mb-6 animate-fade-in">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">
        핵심 요약
      </div>
      <p className="text-[15px] leading-7 text-ink font-medium">{text}</p>
    </div>
  );
}
