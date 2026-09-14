"use client";

import { useLang } from "@/lib/lang";

type DualProps = {
  ar: string;
  en: string;
  as?: "span" | "p" | "h1" | "h2" | "figcaption";
  className?: string;
};

export function Dual({ ar, en, as = "span", className }: DualProps) {
  const { lang } = useLang();
  const Tag = as;
  return (
    <Tag className={className} lang={lang}>
      {lang === "en" ? en : ar}
    </Tag>
  );
}
