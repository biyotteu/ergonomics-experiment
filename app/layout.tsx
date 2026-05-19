import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ContentPreloader } from "@/components/ContentPreloader";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  title: "인지부하 비교 실험 — 인간공학 프로젝트",
  description: "LLM 응답 UI에 따른 인지부하 차이를 측정하는 실험입니다.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={inter.variable}>
      <body className="min-h-screen antialiased">
        <ContentPreloader />
        {children}
      </body>
    </html>
  );
}
