"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

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

const KEY = "raqeeb_a11y";

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

export function A11yProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeName>("nile");
  const [textSize, setTextSize] = useState<TextSize>("md");
  const [highContrast, setHighContrast] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [autoSign, setAutoSign] = useState(true);
  const [signSpeed, setSignSpeed] = useState(1);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as Stored;
      if (isThemeName(saved.theme)) setTheme(saved.theme);
      else if (typeof saved.theme === "string" && LEGACY_THEME[saved.theme]) setTheme(LEGACY_THEME[saved.theme]);
      if (saved.textSize === "sm" || saved.textSize === "md" || saved.textSize === "lg") setTextSize(saved.textSize);
      if (typeof saved.highContrast === "boolean") setHighContrast(saved.highContrast);
      if (typeof saved.reduceMotion === "boolean") setReduceMotion(saved.reduceMotion);
      if (typeof saved.focusMode === "boolean") setFocusMode(saved.focusMode);
      if (typeof saved.autoSign === "boolean") setAutoSign(saved.autoSign);
      if (typeof saved.signSpeed === "number") setSignSpeed(saved.signSpeed);
    } catch {
      /* ignore broken prefs */
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.textSize = textSize;
    root.dataset.theme = theme;
    root.classList.toggle("high-contrast", highContrast);
    root.classList.toggle("reduce-motion", reduceMotion);
    root.classList.toggle("focus-mode", focusMode);
    window.localStorage.setItem(
      KEY,
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
