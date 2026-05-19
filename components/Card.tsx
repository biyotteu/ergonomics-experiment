import React from "react";

export function Card({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`bg-card border border-line rounded-2xl shadow-card ${className}`}>
      {children}
    </div>
  );
}
