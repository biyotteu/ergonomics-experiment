"use client";

export function now() {
  if (typeof performance !== "undefined") return performance.now();
  return Date.now();
}

export function fmtMs(ms: number) {
  return `${(ms / 1000).toFixed(2)}s`;
}

/** 한 번만 발화되는 scroll/wheel/touchmove 리스너. cleanup 함수 반환. */
export function onFirstScroll(cb: (ts: number) => void) {
  let fired = false;
  const handler = () => {
    if (fired) return;
    fired = true;
    cb(now());
    cleanup();
  };
  const events = ["scroll", "wheel", "touchmove"];
  events.forEach((e) => window.addEventListener(e, handler, { passive: true }));
  const cleanup = () => {
    events.forEach((e) => window.removeEventListener(e, handler));
  };
  return cleanup;
}
