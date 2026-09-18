"use client";

import { BRAND } from "@/lib/brand";
import { useLang } from "@/lib/lang";

/**
 * The Isharati mark: a hand opening, drawn as an arc with three rising strokes,
 * plus a gold dot for the signal leaving it. Plain `currentColor` strokes so it
 * works on paper or on deep cobalt, at 24px, and as a favicon.
 */
export function BrandMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M4.4 20.2c4.9 1.5 10.3 1.5 15.2 0" stroke="currentColor" opacity="0.55" />
      <path d="M6.9 18.6c1.9-3.1 2.6-6.4 2.2-9.7" stroke="currentColor" />
      <path d="M11.3 18.8c1.6-2.7 2.2-5.5 1.9-8.3" stroke="currentColor" />
      <path d="M15.6 18.9c1.2-2 1.7-4.1 1.4-6.2" stroke="currentColor" />
      <circle cx="8.7" cy="5.6" r="2.1" fill="var(--brand-dot, currentColor)" />
      <circle cx="8.7" cy="5.6" r="2.1" stroke="none" />
    </svg>
  );
}

export function BrandWordmark({ compact = false }: { compact?: boolean }) {
  const { lang } = useLang();
  return (
    <span className="brand-text">
      <span className="brand-name" lang="ar">
        {BRAND.ar}
      </span>
      {!compact ? (
        <span className="brand-latin" lang={lang === "en" ? "ar" : "en"} aria-hidden="true">
          {lang === "en" ? BRAND.ar : BRAND.latin}
        </span>
      ) : null}
    </span>
  );
}
