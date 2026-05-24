"use client";
import React from "react";

const MATH_FONT = "'Cambria Math', 'Times New Roman', 'Noto Serif KR', serif";

/** 수식 문자열에서 _아래첨자 / ^위첨자 처리 */
function renderMath(expr: string, keyBase: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let i = 0;
  let k = 0;
  let buf = "";
  const flush = () => {
    if (buf) {
      out.push(<React.Fragment key={`${keyBase}-t${k++}`}>{buf}</React.Fragment>);
      buf = "";
    }
  };
  while (i < expr.length) {
    const ch = expr[i];
    if (ch === "_" || ch === "^") {
      flush();
      let content = "";
      if (expr[i + 1] === "{") {
        const end = expr.indexOf("}", i + 2);
        content = end === -1 ? expr.slice(i + 2) : expr.slice(i + 2, end);
        i = end === -1 ? expr.length : end + 1;
      } else {
        content = expr[i + 1] ?? "";
        i += 2;
      }
      if (ch === "_") {
        out.push(<sub key={`${keyBase}-s${k++}`}>{content}</sub>);
      } else {
        out.push(<sup key={`${keyBase}-p${k++}`}>{content}</sup>);
      }
    } else {
      buf += ch;
      i++;
    }
  }
  flush();
  return out;
}

/** 한 줄 안에서 인라인 수식 $...$ 분리 */
function renderInline(line: string, keyBase: string): React.ReactNode[] {
  const segs = line.split(/(\$[^$]*\$)/g);
  return segs.map((seg, idx) => {
    if (seg.length >= 2 && seg.startsWith("$") && seg.endsWith("$")) {
      return (
        <span
          key={`${keyBase}-m${idx}`}
          className="font-bold"
          style={{ fontFamily: MATH_FONT }}
        >
          {renderMath(seg.slice(1, -1), `${keyBase}-m${idx}`)}
        </span>
      );
    }
    return <React.Fragment key={`${keyBase}-x${idx}`}>{seg}</React.Fragment>;
  });
}

/**
 * 본문 렌더러.
 * - 빈 줄(\n\n) → 단락 간격
 * - 줄 전체가 $...$ → 가운데 정렬 디스플레이 수식 (볼드)
 * - 줄 안의 $...$ → 인라인 수식 (볼드 + 아래/위첨자)
 */
export function RichText({ text, className = "" }: { text: string; className?: string }) {
  const lines = (text || "").split("\n");
  return (
    <div className={className}>
      {lines.map((line, li) => {
        const trimmed = line.trim();
        if (trimmed === "") return <div key={li} className="h-3" aria-hidden />;
        const displayMatch = /^\$(.+)\$$/.exec(trimmed);
        if (displayMatch) {
          return (
            <div
              key={li}
              className="my-3 text-center text-[16px] font-bold text-ink"
              style={{ fontFamily: MATH_FONT }}
            >
              {renderMath(displayMatch[1], `d${li}`)}
            </div>
          );
        }
        return (
          <p key={li} className="text-[15px] leading-7 text-ink mb-1">
            {renderInline(line, `l${li}`)}
          </p>
        );
      })}
    </div>
  );
}

/** 마크다운 파이프 표 렌더러. 첫 줄 = 헤더. */
export function TableBlock({ table }: { table: string }) {
  const rows = (table || "")
    .trim()
    .split("\n")
    .map((r) => r.split("|").map((c) => c.trim()))
    .filter((r) => r.some((c) => c !== ""));
  if (rows.length === 0) return null;
  const [header, ...body] = rows;
  return (
    <div className="my-3 overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            {header.map((h, i) => (
              <th
                key={i}
                className="border border-line bg-zinc-50 px-3 py-2 text-left font-semibold text-ink"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((r, ri) => (
            <tr key={ri}>
              {r.map((cell, ci) => (
                <td key={ci} className="border border-line px-3 py-2 align-top text-ink">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
