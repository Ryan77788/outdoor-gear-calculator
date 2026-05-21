"use client";

import { useEffect } from "react";

function normalizeLanguage(value: string | null) {
  return value === "zh" || value === "en" ? value : null;
}

export function PlanLanguageSync() {
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const urlLanguage = normalizeLanguage(new URLSearchParams(window.location.search).get("lang"));

    if (urlLanguage) {
      window.localStorage.setItem("language", urlLanguage);
      return;
    }

    const storedLanguage = normalizeLanguage(window.localStorage.getItem("language"));

    if (!storedLanguage) return;

    searchParams.set("lang", storedLanguage);
    const nextSearch = searchParams.toString();
    window.location.replace(`${window.location.pathname}?${nextSearch}${window.location.hash}`);
  }, []);

  return null;
}
