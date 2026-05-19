import React from "react";
export function ChunkProgress({ opened, total }: { opened: number; total: number }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-muted">읽은 청크</span>
      <span className="font-semibold text-ink tabular-nums">
        {opened} / {total}
      </span>
      <div className="flex-1 h-1.5 bg-line rounded-full overflow-hidden min-w-[120px]">
        <div
          className="h-full bg-accent-600 transition-all duration-300"
          style={{ width: `${(opened / total) * 100}%` }}
        />
      </div>
    </div>
  );
}
