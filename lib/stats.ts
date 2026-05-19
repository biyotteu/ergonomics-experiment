/**
 * paired t-test, mean, std 등 통계 유틸 (의존성 없이 자체 구현)
 */

export function mean(xs: number[]): number {
  if (xs.length === 0) return NaN;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

export function std(xs: number[], sample = true): number {
  if (xs.length < 2) return NaN;
  const m = mean(xs);
  const variance = xs.reduce((s, x) => s + (x - m) ** 2, 0) / (xs.length - (sample ? 1 : 0));
  return Math.sqrt(variance);
}

export function sem(xs: number[]): number {
  return std(xs) / Math.sqrt(xs.length);
}

/**
 * Paired t-test
 * 두 배열은 같은 길이여야 함 (같은 참가자의 두 조건).
 * 짝지을 수 없는 행(둘 중 한쪽이 NaN)은 제외.
 */
export interface TTestResult {
  n: number;
  mean_a: number;
  mean_b: number;
  mean_diff: number;
  std_diff: number;
  t: number;
  df: number;
  p_two_tailed: number;
  cohens_dz: number;
  ci95_low: number;
  ci95_high: number;
}

export function pairedTTest(a: number[], b: number[]): TTestResult | null {
  if (a.length !== b.length) return null;
  const diffs: number[] = [];
  for (let i = 0; i < a.length; i++) {
    if (Number.isFinite(a[i]) && Number.isFinite(b[i])) diffs.push(a[i] - b[i]);
  }
  const n = diffs.length;
  if (n < 2) return null;

  const m_diff = mean(diffs);
  const sd_diff = std(diffs);
  const se = sd_diff / Math.sqrt(n);
  const t = m_diff / se;
  const df = n - 1;
  const p = 2 * (1 - studentTCdf(Math.abs(t), df));
  const dz = m_diff / sd_diff; // Cohen's d_z for paired
  const tcrit = inverseStudentT(0.975, df); // 양측 95%
  const moe = tcrit * se;

  return {
    n,
    mean_a: mean(a.filter(Number.isFinite)),
    mean_b: mean(b.filter(Number.isFinite)),
    mean_diff: m_diff,
    std_diff: sd_diff,
    t,
    df,
    p_two_tailed: p,
    cohens_dz: dz,
    ci95_low: m_diff - moe,
    ci95_high: m_diff + moe,
  };
}

/**
 * Student's t CDF 근사. df ≥ 1에서 합리적인 정확도.
 * 출처: incomplete beta function 활용.
 */
function studentTCdf(t: number, df: number): number {
  // Use the relationship: T_cdf(t, df) = 1 - 0.5 * I_x(df/2, 1/2) where x = df/(df + t^2)
  const x = df / (df + t * t);
  const ix = incompleteBeta(x, df / 2, 0.5);
  let p = 1 - 0.5 * ix;
  if (t < 0) p = 1 - p;
  return p;
}

function inverseStudentT(p: number, df: number): number {
  // 양측 검정용. p=0.975일 때 95% 임계값 반환. 이분 탐색.
  let lo = 0,
    hi = 100;
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    const cdf = studentTCdf(mid, df);
    if (cdf < p) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

function logGamma(x: number): number {
  // Lanczos approximation
  const g = 7;
  const c = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  if (x < 0.5) {
    return Math.log(Math.PI / Math.sin(Math.PI * x)) - logGamma(1 - x);
  }
  x -= 1;
  let a = c[0];
  const t = x + g + 0.5;
  for (let i = 1; i < g + 2; i++) a += c[i] / (x + i);
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}

function incompleteBeta(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const lbeta =
    logGamma(a + b) - logGamma(a) - logGamma(b) +
    a * Math.log(x) + b * Math.log(1 - x);
  const bt = Math.exp(lbeta);
  if (x < (a + 1) / (a + b + 2)) {
    return (bt * betacf(x, a, b)) / a;
  } else {
    return 1 - (bt * betacf(1 - x, b, a)) / b;
  }
}

function betacf(x: number, a: number, b: number): number {
  const MAX = 200;
  const EPS = 3e-7;
  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;
  let c = 1,
    d = 1 - (qab * x) / qap;
  if (Math.abs(d) < 1e-30) d = 1e-30;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= MAX; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    c = 1 + aa / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d;
    h *= d * c;
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    c = 1 + aa / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return h;
}

/**
 * 두 응답 배열에서 ui별로 값을 추출.
 * - getter(row): row 객체에서 ui와 측정값을 뽑아내는 함수
 * - 반환: { basic: number[], structured: number[] } (참가자 인덱스 일치)
 */
export function pairByUI(
  rows: any[],
  pickValue: (row: any, prefix: "q1" | "q2") => number | null
): { basic: number[]; structured: number[] } {
  const basic: number[] = [];
  const structured: number[] = [];
  for (const row of rows) {
    const v1 = pickValue(row, "q1");
    const v2 = pickValue(row, "q2");
    const ui1 = row.q1_ui;
    const ui2 = row.q2_ui;
    if (v1 === null || v2 === null) continue;
    if (ui1 === "basic" && ui2 === "structured") {
      basic.push(v1);
      structured.push(v2);
    } else if (ui1 === "structured" && ui2 === "basic") {
      structured.push(v1);
      basic.push(v2);
    }
  }
  return { basic, structured };
}

export function fmtP(p: number): string {
  if (!Number.isFinite(p)) return "—";
  if (p < 0.001) return "p < 0.001";
  return `p = ${p.toFixed(3)}`;
}

export function fmtNum(x: number, digits = 1): string {
  if (!Number.isFinite(x)) return "—";
  return x.toFixed(digits);
}
