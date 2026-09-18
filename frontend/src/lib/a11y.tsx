"use client";

import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { A11Y_KEY } from "@/lib/lang-shared";

export type TextSize = "sm" | "md" | "lg";
export type ThemeName =
  | "nile"
  | "ocean"
  | "forest"
  | "sunset"
  | "lavender"
  | "midnight"
  | "heritage";

const THEMES: ThemeName[] = ["nile", "ocean", "forest", "sunset", "lavender", "midnight", "heritage"];

type A11yValue = {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
  highContrast: boolean;
  setHighContrast: (value: boolean) => void;
  reduceMotion: boolean;
  setReduceMotion: (value: boolean) => void;
  focusMode: boolean;
  setFocusMode: (value: boolean) => void;
  autoSign: boolean;
  setAutoSign: (value: boolean) => void;
  signSpeed: number;
  setSignSpeed: (value: number) => void;
};

const A11yContext = createContext<A11yValue>({
  theme: "nile",
  setTheme: () => undefined,
  textSize: "md",
  setTextSize: () => undefined,
  highContrast: false,
  setHighContrast: () => undefined,
  reduceMotion: false,
  setReduceMotion: () => undefined,
  focusMode: false,
  setFocusMode: () => undefined,
  autoSign: true,
  setAutoSign: () => undefined,
  signSpeed: 1,
  setSignSpeed: () => undefined,
});

type Stored = Partial<
  Pick<A11yValue, "theme" | "textSize" | "highContrast" | "reduceMotion" | "focusMode" | "autoSign" | "signSpeed">
>;

/** Old default theme from previous builds maps to the new default. */
const LEGACY_THEME: Record<string, ThemeName> = {
  original: "nile",
  night: "midnight",
  desert: "heritage",
  calm: "ocean",
};

export function isThemeName(value: unknown): value is ThemeName {
  return typeof value === "string" && (THEMES as string[]).includes(value);
}

function applyA11y(prefs: Pick<A11yValue, "theme" | "textSize" | "highContrast" | "reduceMotion" | "focusMode">) {
  const root = document.documentElement;
  root.dataset.textSize = prefs.textSize;
  root.dataset.theme = prefs.theme;
  root.classList.toggle("high-contrast", prefs.highContrast);
  root.classList.toggle("reduce-motion", prefs.reduceMotion);
  root.classList.toggle("focus-mode", prefs.focusMode);
}

function readStoredA11y(): Stored | null {
  try {
    const raw = window.localStorage.getItem(A11Y_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Stored;
  } catch {
    return null;
  }
}

export function A11yProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeName>("nile");
  const [textSize, setTextSize] = useState<TextSize>("md");
  const [highContrast, setHighContrast] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [autoSign, setAutoSign] = useState(true);
  const [signSpeed, setSignSpeed] = useState(1);
  const persist = useRef(false);

  useLayoutEffect(() => {
    const saved = readStoredA11y();
    if (!saved) {
      persist.current = true;
      return;
    }
    const nextTheme = isThemeName(saved.theme)
      ? saved.theme
      : typeof saved.theme === "string" && LEGACY_THEME[saved.theme]
        ? LEGACY_THEME[saved.theme]
        : "nile";
    const nextSize = saved.textSize === "sm" || saved.textSize === "md" || saved.textSize === "lg" ? saved.textSize : "md";
    const nextContrast = Boolean(saved.highContrast);
    const nextMotion = Boolean(saved.reduceMotion);
    const nextFocus = Boolean(saved.focusMode);
    setTheme(nextTheme);
    setTextSize(nextSize);
    setHighContrast(nextContrast);
    setReduceMotion(nextMotion);
    setFocusMode(nextFocus);
    if (typeof saved.autoSign === "boolean") setAutoSign(saved.autoSign);
    if (typeof saved.signSpeed === "number") setSignSpeed(saved.signSpeed);
    applyA11y({
      theme: nextTheme,
      textSize: nextSize,
      highContrast: nextContrast,
      reduceMotion: nextMotion,
      focusMode: nextFocus,
    });
    persist.current = true;
  }, []);

  useEffect(() => {
    if (!persist.current) return;
    applyA11y({ theme, textSize, highContrast, reduceMotion, focusMode });
    window.localStorage.setItem(
      A11Y_KEY,
      JSON.stringify({ theme, textSize, highContrast, reduceMotion, focusMode, autoSign, signSpeed }),
    );
  }, [theme, textSize, highContrast, reduceMotion, focusMode, autoSign, signSpeed]);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      textSize,
      setTextSize,
      highContrast,
      setHighContrast,
      reduceMotion,
      setReduceMotion,
      focusMode,
      setFocusMode,
      autoSign,
      setAutoSign,
      signSpeed,
      setSignSpeed,
    }),
    [theme, textSize, highContrast, reduceMotion, focusMode, autoSign, signSpeed],
  );

  return <A11yContext.Provider value={value}>{children}</A11yContext.Provider>;
}

export function useA11y() {
  return useContext(A11yContext);
}
