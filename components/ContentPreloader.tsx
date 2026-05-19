"use client";
import { useEffect } from "react";
import { preloadContent } from "@/lib/useContent";

/**
 * 사이트 진입 시 layout에서 한 번 트리거.
 * 이후 모든 페이지의 useContent()는 캐시 히트로 즉시 렌더됨.
 */
export function ContentPreloader() {
  useEffect(() => {
    preloadContent();
  }, []);
  return null;
}
