"use client";
import React from "react";

interface Props {
  label: string;
  basicValue: number;
  structuredValue: number;
  basicSd?: number;
  structuredSd?: number;
  unit?: string;
  /** 절대 최대값 (Y축 스케일 결정). 미지정 시 자동 */
  maxValue?: number;
  /** 낮을수록 좋음을 표시 (Performance만 그러함) */
  lowerIsBetter?: boolean;
}

export function BarCompare({
  label,
  basicValue,
  structuredValue,
  basicSd,
  structuredSd,
  unit = "",
  maxValue,
  lowerIsBetter = false,
}: Props) {
  const max = maxValue ?? Math.max(basicValue, structuredValue, 1) * 1.25;
  const basicPct = (basicValue / max) * 100;
  const structPct = (structuredValue / max) * 100;
  const winner: "basic" | "structured" | "tie" =
    Math.abs(basicValue - structuredValue) < 0.01 * Math.max(basicValue, structuredValue)
      ? "tie"
      : lowerIsBetter
      ? basicValue < structuredValue
        ? "basic"
        : "structured"
      : basicValue > structuredValue
      ? "basic"
      : "structured";

  return (
    <div className="py-4 border-b border-line last:border-b-0">
      <div className="flex items-baseline justify-between mb-3">
        <div className="font-medium text-ink">{label}</div>
        <div className="text-xs text-muted">{lowerIsBetter ? "낮을수록 좋음" : ""}</div>
      </div>

      <div className="space-y-2">
        {/* Basic */}
        <div>
          <div className="flex items-baseline justify-between text-sm mb-1">
            <span className={`font-medium ${winner === "basic" ? "text-ink" : "text-muted"}`}>기본 UI</span>
            <span className="tabular-nums font-semibold">
              {basicValue.toFixed(1)}{unit}
              {basicSd !== undefined && (
                <span className="text-xs text-muted ml-1">±{basicSd.toFixed(1)}</span>
              )}
            </span>
          </div>
          <div className="h-2 bg-line rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${winner === "basic" ? "bg-accent-600" : "bg-zinc-400"}`}
              style={{ width: `${Math.min(100, basicPct)}%` }}
            />
          </div>
        </div>

        {/* Structured */}
        <div>
          <div className="flex items-baseline justify-between text-sm mb-1">
            <span className={`font-medium ${winner === "structured" ? "text-ink" : "text-muted"}`}>
              구조화 UI
            </span>
            <span className="tabular-nums font-semibold">
              {structuredValue.toFixed(1)}{unit}
              {structuredSd !== undefined && (
                <span className="text-xs text-muted ml-1">±{structuredSd.toFixed(1)}</span>
              )}
            </span>
          </div>
          <div className="h-2 bg-line rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${winner === "structured" ? "bg-accent-600" : "bg-zinc-400"}`}
              style={{ width: `${Math.min(100, structPct)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
