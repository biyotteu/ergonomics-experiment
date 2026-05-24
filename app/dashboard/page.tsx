"use client";
import React, { useEffect, useState } from "react";
import { Container } from "@/components/Container";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { StatCard } from "@/components/StatCard";
import { BarCompare } from "@/components/BarCompare";
import {
  pairByUI,
  pairedTTest,
  mean,
  std,
  fmtNum,
  fmtP,
  type TTestResult,
} from "@/lib/stats";

type Row = Record<string, any>;

const NUMERIC_COLS = [
  "read_time_ms",
  "quiz_time_auto_ms",
  "quiz_time_manual_s",
  "resumption_lag_ms",
  "arithmetic_correct",
  "quiz_score_1",
  "quiz_score_2",
  "tlx_mental",
  "tlx_physical",
  "tlx_temporal",
  "tlx_performance",
  "tlx_effort",
  "tlx_frustration",
];

function toNumber(v: any): number {
  if (v === "" || v === null || v === undefined) return NaN;
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

const TLX_LABELS: Record<string, string> = {
  tlx_mental: "정신적 요구 (Mental)",
  tlx_physical: "신체적 요구 (Physical)",
  tlx_temporal: "시간 압박 (Temporal)",
  tlx_performance: "수행 (Performance)",
  tlx_effort: "노력 (Effort)",
  tlx_frustration: "좌절감 (Frustration)",
};

export default function Dashboard() {
  const [pwd, setPwd] = useState("");
  const [authed, setAuthed] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (password: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = process.env.NEXT_PUBLIC_SHEET_API_URL;
      if (!url) throw new Error("NEXT_PUBLIC_SHEET_API_URL 환경변수가 없습니다");
      const full = `${url}?action=responses&pwd=${encodeURIComponent(password)}`;
      const res = await fetch(full);
      const data = await res.json();
      if (data.error) throw new Error("비밀번호가 틀렸습니다");
      const r = (data.rows as Row[]) || [];
      // 숫자 컬럼 파싱
      const parsed = r.map((row) => {
        const out: Row = { ...row };
        for (const k of Object.keys(row)) {
          if (NUMERIC_COLS.some((c) => k.endsWith(c))) {
            out[k] = toNumber(row[k]);
          }
        }
        return out;
      });
      setRows(parsed);
      setAuthed(true);
    } catch (e: any) {
      setError(e?.message ?? "오류");
    } finally {
      setLoading(false);
    }
  };

  if (!authed) {
    return (
      <Container size="sm">
        <h1 className="text-2xl font-semibold mb-2 mt-12">실험 결과 대시보드</h1>
        <p className="text-muted mb-6">관리자 비밀번호를 입력하세요.</p>
        <Card className="p-6">
          <input
            type="password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchData(pwd)}
            className="w-full border border-line rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-100"
            placeholder="비밀번호"
            autoFocus
          />
          {error && <p className="text-sm text-rose-700 mt-3">{error}</p>}
          <Button className="w-full mt-4" onClick={() => fetchData(pwd)} disabled={loading || !pwd}>
            {loading ? "불러오는 중..." : "들어가기"}
          </Button>
        </Card>
        <p className="text-xs text-muted mt-4">
          비밀번호는 Apps Script 파일의 <code>DASHBOARD_PASSWORD</code>와 일치해야 합니다.
        </p>
      </Container>
    );
  }

  return <DashboardBody rows={rows} onReload={() => fetchData(pwd)} />;
}

function DashboardBody({ rows, onReload }: { rows: Row[]; onReload: () => void }) {
  const N = rows.length;

  // 그룹별 인원
  const groupCount: Record<string, number> = {};
  rows.forEach((r) => {
    const g = r.group ?? "?";
    groupCount[g] = (groupCount[g] || 0) + 1;
  });

  // UI별 페어 데이터
  const pairs = {
    read_time: pairByUI(rows, (r, p) => toNumber(r[`${p}_read_time_ms`])),
    quiz_time_auto: pairByUI(rows, (r, p) => toNumber(r[`${p}_quiz_time_auto_ms`])),
    quiz_time_manual: pairByUI(rows, (r, p) => toNumber(r[`${p}_quiz_time_manual_s`])),
    resumption_lag: pairByUI(rows, (r, p) => {
      const v = toNumber(r[`${p}_resumption_lag_ms`]);
      // 인터럽션이 발동된 조건만 (양쪽 모두 발동한 경우는 없으니 한쪽만 들어옴)
      return Number.isFinite(v) ? v : null;
    }),
    tlx_mental: pairByUI(rows, (r, p) => toNumber(r[`${p}_tlx_mental`])),
    tlx_physical: pairByUI(rows, (r, p) => toNumber(r[`${p}_tlx_physical`])),
    tlx_temporal: pairByUI(rows, (r, p) => toNumber(r[`${p}_tlx_temporal`])),
    tlx_performance: pairByUI(rows, (r, p) => toNumber(r[`${p}_tlx_performance`])),
    tlx_effort: pairByUI(rows, (r, p) => toNumber(r[`${p}_tlx_effort`])),
    tlx_frustration: pairByUI(rows, (r, p) => toNumber(r[`${p}_tlx_frustration`])),
    quiz_score: pairByUI(rows, (r, p) => {
      const s1 = toNumber(r[`${p}_quiz_score_1`]);
      const s2 = toNumber(r[`${p}_quiz_score_2`]);
      if (!Number.isFinite(s1) || !Number.isFinite(s2)) return null;
      return s1 + s2;
    }),
  };

  const tests = {
    read_time: pairedTTest(pairs.read_time.basic, pairs.read_time.structured),
    tlx_mental: pairedTTest(pairs.tlx_mental.basic, pairs.tlx_mental.structured),
    tlx_effort: pairedTTest(pairs.tlx_effort.basic, pairs.tlx_effort.structured),
    tlx_frustration: pairedTTest(
      pairs.tlx_frustration.basic,
      pairs.tlx_frustration.structured
    ),
    resumption_lag: pairedTTest(
      pairs.resumption_lag.basic,
      pairs.resumption_lag.structured
    ),
    quiz_score: pairedTTest(pairs.quiz_score.basic, pairs.quiz_score.structured),
  };

  // 선호도
  const prefBasic = rows.filter((r) => r.pref_ui === "basic").length;
  const prefStruct = rows.filter((r) => r.pref_ui === "structured").length;

  return (
    <Container size="xl">
      <div className="mt-8 mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">실험 결과 대시보드</h1>
          <p className="text-muted mt-1">참가자 {N}명의 데이터를 실시간으로 보여줍니다.</p>
        </div>
        <Button variant="secondary" onClick={onReload}>새로고침</Button>
      </div>

      {/* 1. 전체 통계 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="참가자 수" value={N} sub="(완료된 응답)" />
        <StatCard
          label="그룹 분포"
          value={
            Object.keys(groupCount).length === 0
              ? "—"
              : Object.entries(groupCount).map(([g, c]) => `${g}:${c}`).join(" ")
          }
        />
        <StatCard
          label="기본 UI 선호"
          value={prefBasic}
          sub={`${N > 0 ? Math.round((prefBasic / N) * 100) : 0}%`}
        />
        <StatCard
          label="구조화 UI 선호"
          value={prefStruct}
          sub={`${N > 0 ? Math.round((prefStruct / N) * 100) : 0}%`}
        />
      </div>

      {N === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted">아직 제출된 응답이 없습니다.</p>
        </Card>
      ) : (
        <>
          {/* 2. 시간 비교 */}
          <Card className="p-6 mb-6">
            <h2 className="font-semibold mb-1">시간 측정</h2>
            <p className="text-xs text-muted mb-4">두 UI 조건의 평균 ± 표준편차</p>
            <TimeRow
              label="읽기 시간 (초)"
              basic={pairs.read_time.basic.map((v) => v / 1000)}
              structured={pairs.read_time.structured.map((v) => v / 1000)}
              unit="s"
            />
            <TimeRow
              label="퀴즈 시간 - 자동 측정 (초)"
              basic={pairs.quiz_time_auto.basic.map((v) => v / 1000)}
              structured={pairs.quiz_time_auto.structured.map((v) => v / 1000)}
              unit="s"
            />
            {pairs.quiz_time_manual.basic.length > 0 && (
              <TimeRow
                label="퀴즈 시간 - 수동 측정 (초)"
                basic={pairs.quiz_time_manual.basic}
                structured={pairs.quiz_time_manual.structured}
                unit="s"
              />
            )}
          </Card>

          {/* 3. NASA-TLX */}
          <Card className="p-6 mb-6">
            <h2 className="font-semibold mb-1">NASA-TLX</h2>
            <p className="text-xs text-muted mb-4">
              6항목 모두 0~100 척도. Mental/Effort/Frustration이 핵심 지표.
            </p>
            {(Object.keys(TLX_LABELS) as (keyof typeof TLX_LABELS)[]).map((k) => {
              const p = pairs[k as keyof typeof pairs] as { basic: number[]; structured: number[] };
              return (
                <BarCompare
                  key={k}
                  label={TLX_LABELS[k]}
                  basicValue={mean(p.basic)}
                  structuredValue={mean(p.structured)}
                  basicSd={std(p.basic)}
                  structuredSd={std(p.structured)}
                  maxValue={100}
                  lowerIsBetter={k !== "tlx_performance"}
                />
              );
            })}
          </Card>

          {/* 4. Resumption Lag */}
          <Card className="p-6 mb-6">
            <h2 className="font-semibold mb-1">복귀 지연 시간 (Resumption Lag)</h2>
            <p className="text-xs text-muted mb-4">
              인터럽션 모달이 사라진 시점부터 첫 스크롤까지 걸린 시간 (ms). 인터럽션이 발동된 UI 조건만 카운트.
            </p>
            <BarCompare
              label="평균 복귀 지연 (ms)"
              basicValue={mean(pairs.resumption_lag.basic)}
              structuredValue={mean(pairs.resumption_lag.structured)}
              basicSd={std(pairs.resumption_lag.basic)}
              structuredSd={std(pairs.resumption_lag.structured)}
              unit="ms"
              lowerIsBetter
            />
            <p className="text-xs text-muted mt-3">
              기본 UI에서 발동: n={pairs.resumption_lag.basic.length} · 구조화 UI에서 발동: n=
              {pairs.resumption_lag.structured.length}
            </p>
          </Card>

          {/* 5. 퀴즈 점수 (수동 채점) */}
          {pairs.quiz_score.basic.length > 0 && (
            <Card className="p-6 mb-6">
              <h2 className="font-semibold mb-1">퀴즈 점수 (수동 채점)</h2>
              <p className="text-xs text-muted mb-4">
                quiz_score_1, quiz_score_2 컬럼에 채점 결과를 넣으면 자동 집계됩니다. 두 문항 합산 0~2점.
              </p>
              <BarCompare
                label="평균 점수 (0~2)"
                basicValue={mean(pairs.quiz_score.basic)}
                structuredValue={mean(pairs.quiz_score.structured)}
                basicSd={std(pairs.quiz_score.basic)}
                structuredSd={std(pairs.quiz_score.structured)}
                maxValue={2}
              />
            </Card>
          )}

          {/* 6. paired t-test 표 */}
          <Card className="p-6 mb-6">
            <h2 className="font-semibold mb-1">Paired t-test 결과</h2>
            <p className="text-xs text-muted mb-4">
              n ≥ 2일 때만 계산. p &lt; 0.05면 유의미.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs uppercase text-muted">
                    <th className="py-2 pr-4">지표</th>
                    <th className="py-2 pr-4">n</th>
                    <th className="py-2 pr-4">basic 평균</th>
                    <th className="py-2 pr-4">struct 평균</th>
                    <th className="py-2 pr-4">차이 (95% CI)</th>
                    <th className="py-2 pr-4">t (df)</th>
                    <th className="py-2 pr-4">p</th>
                    <th className="py-2">Cohen's dz</th>
                  </tr>
                </thead>
                <tbody>
                  <TTestRow label="읽기 시간 (ms)" r={tests.read_time} />
                  <TTestRow label="TLX 정신적 요구" r={tests.tlx_mental} />
                  <TTestRow label="TLX 노력" r={tests.tlx_effort} />
                  <TTestRow label="TLX 좌절감" r={tests.tlx_frustration} />
                  <TTestRow label="복귀 지연 (ms)" r={tests.resumption_lag} />
                  <TTestRow label="퀴즈 점수" r={tests.quiz_score} />
                </tbody>
              </table>
            </div>
          </Card>

          {/* 7. 원본 응답 테이블 */}
          <Card className="p-6 mb-12">
            <h2 className="font-semibold mb-3">원본 응답 ({N}건)</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-line text-left text-muted">
                    <th className="py-2 pr-3">ID</th>
                    <th className="py-2 pr-3">그룹</th>
                    <th className="py-2 pr-3">UI 순서</th>
                    <th className="py-2 pr-3">선호</th>
                    <th className="py-2 pr-3">사전(GD)</th>
                    <th className="py-2 pr-3">사전(Ent)</th>
                    <th className="py-2">제출 시각</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} className="border-b border-line/50 last:border-b-0">
                      <td className="py-1.5 pr-3 font-mono">{r.participant_id}</td>
                      <td className="py-1.5 pr-3">{r.group}</td>
                      <td className="py-1.5 pr-3">{r.ui_order}</td>
                      <td className="py-1.5 pr-3">{r.pref_ui ?? "—"}</td>
                      <td className="py-1.5 pr-3 tabular-nums">{r.prior_grad_descent ?? "—"}</td>
                      <td className="py-1.5 pr-3 tabular-nums">{r.prior_entropy ?? "—"}</td>
                      <td className="py-1.5 tabular-nums">
                        {r.submitted_at ? new Date(r.submitted_at).toLocaleString("ko-KR") : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted mt-3">
              전체 컬럼은 Google Sheet의 <code>responses</code> 탭에서 보거나 CSV로 다운로드하세요.
            </p>
          </Card>
        </>
      )}
    </Container>
  );
}

function TimeRow({
  label,
  basic,
  structured,
  unit,
}: {
  label: string;
  basic: number[];
  structured: number[];
  unit: string;
}) {
  return (
    <BarCompare
      label={label}
      basicValue={mean(basic)}
      structuredValue={mean(structured)}
      basicSd={std(basic)}
      structuredSd={std(structured)}
      unit={unit}
      lowerIsBetter
    />
  );
}

function TTestRow({ label, r }: { label: string; r: TTestResult | null }) {
  if (!r) {
    return (
      <tr className="border-b border-line/50 last:border-b-0">
        <td className="py-2 pr-4 text-muted">{label}</td>
        <td className="py-2 pr-4 text-muted" colSpan={7}>
          데이터 부족 (n &lt; 2)
        </td>
      </tr>
    );
  }
  const sig = r.p_two_tailed < 0.05;
  return (
    <tr className="border-b border-line/50 last:border-b-0">
      <td className="py-2 pr-4 font-medium">{label}</td>
      <td className="py-2 pr-4 tabular-nums">{r.n}</td>
      <td className="py-2 pr-4 tabular-nums">{fmtNum(r.mean_a)}</td>
      <td className="py-2 pr-4 tabular-nums">{fmtNum(r.mean_b)}</td>
      <td className="py-2 pr-4 tabular-nums">
        {fmtNum(r.mean_diff)} ({fmtNum(r.ci95_low)} ~ {fmtNum(r.ci95_high)})
      </td>
      <td className="py-2 pr-4 tabular-nums">
        {fmtNum(r.t, 2)} ({r.df})
      </td>
      <td className={`py-2 pr-4 tabular-nums ${sig ? "text-accent-700 font-semibold" : "text-muted"}`}>
        {fmtP(r.p_two_tailed)}
        {sig && " ✱"}
      </td>
      <td className="py-2 tabular-nums">{fmtNum(r.cohens_dz, 2)}</td>
    </tr>
  );
}
