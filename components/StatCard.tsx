import React from "react";

export function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="bg-card border border-line rounded-2xl p-5 shadow-card">
      <div className="text-xs uppercase tracking-wider text-muted font-medium mb-1">
        {label}
      </div>
      <div className="text-3xl font-semibold tabular-nums text-ink">{value}</div>
      {sub && <div className="text-xs text-muted mt-1">{sub}</div>}
    </div>
  );
}
