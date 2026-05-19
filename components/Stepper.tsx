import React from "react";

export function Stepper({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      <div className="text-xs uppercase tracking-wider text-muted font-medium">
        Step {step} / {total}
      </div>
      <div className="flex-1 h-1 bg-line rounded-full overflow-hidden">
        <div
          className="h-full bg-ink transition-all duration-500"
          style={{ width: `${(step / total) * 100}%` }}
        />
      </div>
    </div>
  );
}
