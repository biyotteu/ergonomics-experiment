import React from "react";

export function BLUFBox({ bullets }: { bullets: string[] }) {
  return (
    <div className="bg-accent-50 border border-accent-100 rounded-2xl p-6 mb-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-accent-700">
          핵심 요약
        </span>
        <span className="text-xs text-accent-700/70">BLUF</span>
      </div>
      <ul className="space-y-2">
        {bullets.map((b, i) => (
          <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-ink">
            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-accent-600 flex-shrink-0" />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
