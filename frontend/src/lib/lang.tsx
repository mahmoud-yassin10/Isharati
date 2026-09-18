"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { LANG_COOKIE, parseLang, type Lang } from "@/lib/lang-shared";

export type { Lang } from "@/lib/lang-shared";
export { LANG_BOOTSTRAP, LANG_COOKIE, parseLang } from "@/lib/lang-shared";

type LangContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
};

const LangContext = createContext<LangContextValue>({
  lang: "ar",
  setLang: () => undefined,
});

function persistLang(lang: Lang) {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  window.localStorage.setItem(LANG_COOKIE, lang);
  document.cookie = `${LANG_COOKIE}=${lang}; path=/; max-age=31536000; SameSite=Lax`;
}

export function LangProvider({
  children,
  initialLang = "ar",
}: {
  children: React.ReactNode;
  initialLang?: Lang;
}) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  useEffect(() => {
    const stored = window.localStorage.getItem(LANG_COOKIE);
    const next = stored === "en" || stored === "ar" ? stored : parseLang(initialLang);
    if (next !== lang) setLangState(next);
    persistLang(next);
    // Sync React to storage on mount so pick() matches Dual CSS on the first client frame.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    persistLang(next);
  }, []);

  const value = useMemo(() => ({ lang, setLang }), [lang, setLang]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}

export function pick(lang: Lang, ar: string, en: string) {
  return lang === "en" ? en : ar;
}
