"use client";
import { useEffect, useState } from "react";
import type { ContentBundle } from "./types";
import fallback from "@/data/content.json";

export function useContent() {
  const [content, setContent] = useState<ContentBundle | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    const url = process.env.NEXT_PUBLIC_SHEET_API_URL;
    if (!url) {
      setContent(fallback as unknown as ContentBundle);
      setLoading(false);
      return;
    }
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setContent(data as ContentBundle);
      })
      .catch(() => {
        if (!cancelled) setContent(fallback as unknown as ContentBundle);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);
  return { content, loading };
}
