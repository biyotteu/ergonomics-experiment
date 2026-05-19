"use client";
import { useEffect, useState } from "react";
import type { ContentBundle } from "./types";
import fallback from "@/data/content.json";

const SS_KEY = "ergo-content-cache-v1";
const TTL_MS = 30 * 60 * 1000; // 30분

// 모듈 레벨 캐시 (탭 한 세션에서 페이지 이동 시 즉시 재사용)
let cache: ContentBundle | null = null;
let inflight: Promise<ContentBundle> | null = null;

function loadFromStorage(): ContentBundle | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(SS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    if (typeof parsed.ts !== "number") return null;
    if (Date.now() - parsed.ts > TTL_MS) return null;
    return parsed.content as ContentBundle;
  } catch {
    return null;
  }
}

function saveToStorage(content: ContentBundle) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      SS_KEY,
      JSON.stringify({ content, ts: Date.now() })
    );
  } catch {
    /* quota exceeded 등 무시 */
  }
}

async function fetchOnce(): Promise<ContentBundle> {
  const url = process.env.NEXT_PUBLIC_SHEET_API_URL;
  if (!url) return fallback as unknown as ContentBundle;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data as ContentBundle;
  } catch (e) {
    console.warn("Content fetch failed, using fallback:", e);
    return fallback as unknown as ContentBundle;
  }
}

/**
 * 외부에서 미리 호출해 두면, 페이지 진입 시 캐시 hit으로 즉시 렌더됨.
 * layout의 ContentPreloader가 자동 호출함.
 */
export function preloadContent(): Promise<ContentBundle> {
  if (cache) return Promise.resolve(cache);
  if (inflight) return inflight;

  // 같은 세션 내 새로고침이라면 sessionStorage에서 즉시 복원
  const stored = loadFromStorage();
  if (stored) {
    cache = stored;
    // 백그라운드로 신선한 데이터도 한 번 더 받아서 캐시 갱신
    inflight = fetchOnce().then((data) => {
      cache = data;
      inflight = null;
      saveToStorage(data);
      return data;
    });
    return Promise.resolve(stored);
  }

  inflight = fetchOnce().then((data) => {
    cache = data;
    inflight = null;
    saveToStorage(data);
    return data;
  });
  return inflight;
}

export function useContent() {
  // 모듈 캐시가 있으면 즉시 사용 → 로딩 화면 없이 렌더
  const [content, setContent] = useState<ContentBundle | null>(cache);
  const [loading, setLoading] = useState<boolean>(!cache);

  useEffect(() => {
    if (cache) {
      setContent(cache);
      setLoading(false);
      return;
    }
    let cancelled = false;
    preloadContent().then((data) => {
      if (cancelled) return;
      setContent(data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { content, loading };
}

/** 디버그/관리용: 캐시 강제 무효화 */
export function invalidateContentCache() {
  cache = null;
  inflight = null;
  if (typeof window !== "undefined") {
    try {
      window.sessionStorage.removeItem(SS_KEY);
    } catch {}
  }
}
