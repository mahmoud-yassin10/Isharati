"use client";

import { BRAND } from "@/lib/brand";
import { useLang } from "@/lib/lang";

const MARK_SRC = "/brand/imkan-mark.png";
const LOCKUP_SRC = "/brand/imkan-lockup.png";

/** Heart-hand mark. Square-ish; keep `object-fit: contain` so it is never stretched. */
export function BrandMark({ size = 32 }: { size?: number }) {
  return (
    <img
      src={MARK_SRC}
      alt=""
      width={size}
      height={size}
      className="brand-mark-img"
      draggable={false}
      decoding="async"
    />
  );
}

/** Official vertical lockup: mark + Arabic word. Use on auth and other spacious surfaces. */
export function BrandLockup({ height = 88 }: { height?: number }) {
  const { lang } = useLang();
  return (
    <img
      src={LOCKUP_SRC}
      alt={lang === "ar" ? BRAND.ar : BRAND.en}
      className="brand-lockup-img"
      height={height}
      draggable={false}
      decoding="async"
    />
  );
}

export function BrandWordmark({ compact = false }: { compact?: boolean }) {
  const { lang } = useLang();
  const primary = lang === "ar" ? BRAND.ar : BRAND.en;
  const secondary = lang === "ar" ? BRAND.en : BRAND.ar;
  return (
    <span className="brand-text">
      <span className="brand-name" lang={lang === "ar" ? "ar" : "en"}>
        {primary}
      </span>
      {!compact ? (
        <span className="brand-latin" lang={lang === "ar" ? "en" : "ar"} aria-hidden="true">
          {secondary}
        </span>
      ) : null}
    </span>
  );
}
