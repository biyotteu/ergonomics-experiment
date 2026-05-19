"use client";
import React, { useState } from "react";
import { Button } from "./Button";

interface Props {
  problem: { a: number; b: number };
  onClose: (correct: boolean) => void;
}

export function InterruptionModal({ problem, onClose }: Props) {
  const [val, setVal] = useState("");
  const correctAns = problem.a + problem.b;
  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-card rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fade-in">
        <div className="text-xs font-semibold uppercase tracking-wider text-accent-700 mb-2">
          잠시 멈춰주세요
        </div>
        <h2 className="text-xl font-semibold text-ink mb-1">다음을 계산해주세요</h2>
        <div className="my-6 text-4xl font-bold text-center tabular-nums">
          {problem.a} + {problem.b} = ?
        </div>
        <input
          type="number"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          autoFocus
          className="w-full border border-line rounded-xl px-4 py-3 text-lg text-center tabular-nums focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-100"
          placeholder="답"
        />
        <Button
          className="w-full mt-5"
          variant="primary"
          disabled={val.trim() === ""}
          onClick={() => onClose(Number(val) === correctAns)}
        >
          제출
        </Button>
      </div>
    </div>
  );
}
