"use client";
import React from "react";

export function NasaTLXSlider({
  label,
  desc,
  value,
  onChange,
}: {
  label: string;
  desc: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="py-5 border-b border-line last:border-b-0">
      <div className="flex items-baseline justify-between mb-1">
        <label className="font-medium text-ink">{label}</label>
        <span className="text-2xl font-semibold tabular-nums text-accent-700">{value}</span>
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
        style={{ ["--val" as any]: `${value}%` }}
      />
      <div className="flex justify-between text-[11px] text-muted mt-1 tabular-nums">
        <span>0 (매우 낮음)</span>
        <span>100 (매우 높음)</span>
      </div>
    </div>
  );
}
