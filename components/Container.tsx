import React from "react";
export function Container({
  children,
  className = "",
  size = "md",
}: {
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const w = { sm: "max-w-xl", md: "max-w-2xl", lg: "max-w-4xl", xl: "max-w-6xl" }[size];
  return <main className={`mx-auto ${w} px-6 py-12 ${className}`}>{children}</main>;
}
