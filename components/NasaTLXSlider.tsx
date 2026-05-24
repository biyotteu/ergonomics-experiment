"use client";
import React from "react";

export function NasaTLXSlider({
  label,
  question,
  desc,
  anchorLow,
  anchorHigh,
  value,
  onChange,
}: {
  label: string;
  question: string;
  desc: string;
  anchorLow: string;
  anchorHigh: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="py-6 border-b border-line last:border-b-0">
      <div className="flex items-start justify-between gap-4 mb-1">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted mb-1">
            {label}
          </div>
          <p className="font-medium text-ink leading-relaxed">{question}</p>
        </div>
        <span className="text-2xl font-semibold tabular-nums text-accent-700 flex-shrink-0">
          {value}
        </span>
      </div>
      <p className="text-sm text-muted mb-3">{desc}</p>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="tlx-slider"
        style={{ ["--val" as never]: `${value}%` }}
      />
      <div className="flex justify-between text-[11px] text-muted mt-1">
        <span>0 · {anchorLow}</span>
        <span>{anchorHigh} · 100</span>
      </div>
    </div>
  );
}
