"use client";
import React from "react";

type Variant = "primary" | "secondary" | "ghost";

export function Button({
  variant = "primary",
  className = "",
  children,
  ...rest
}: { variant?: Variant } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const base =
    "inline-flex items-center justify-center gap-2 font-medium rounded-xl px-5 py-2.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed";
  const styles = {
    primary:
      "bg-ink text-white hover:bg-zinc-800 active:scale-[0.98] shadow-soft",
    secondary:
      "bg-card text-ink border border-line hover:bg-zinc-50 active:scale-[0.98]",
    ghost: "text-muted hover:text-ink hover:bg-zinc-100",
  }[variant];
  return (
    <button className={`${base} ${styles} ${className}`} {...rest}>
      {children}
    </button>
  );
}
