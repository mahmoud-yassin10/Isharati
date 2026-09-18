"use client";

import { Check } from "lucide-react";
import { Dual } from "@/components/Dual";
import { SwitchRow } from "@/components/ui";
import { useA11y, type TextSize, type ThemeName } from "@/lib/a11y";
import { pick, useLang } from "@/lib/lang";

const TEXT_SIZES: { value: TextSize; ar: string; en: string }[] = [
  { value: "sm", ar: "صغير", en: "Small" },
  { value: "md", ar: "عادي", en: "Normal" },
  { value: "lg", ar: "كبير", en: "Large" },
];

const SPEEDS = [0.6, 0.8, 1];

/** The agreed palettes, shown as primary / background / accent. */
const THEME_META: Record<ThemeName, { ar: string; en: string; colors: [string, string, string] }> = {
  nile: { ar: "النيل", en: "Nile", colors: ["#1261A0", "#F7F5EF", "#F4C542"] },
  ocean: { ar: "المحيط", en: "Ocean", colors: ["#176B87", "#F2F8F9", "#48B7B0"] },
  forest: { ar: "الغابة", en: "Forest", colors: ["#28745A", "#F4F7F0", "#A8C95B"] },
  sunset: { ar: "الغروب", en: "Sunset", colors: ["#D66A32", "#FFF8ED", "#F2C14E"] },
  lavender: { ar: "اللافندر", en: "Lavender", colors: ["#7157A8", "#F8F6FC", "#B9A7E8"] },
  midnight: { ar: "منتصف الليل", en: "Midnight", colors: ["#4A9FE8", "#162331", "#F5C84B"] },
  heritage: { ar: "التراث المصري", en: "Egyptian Heritage", colors: ["#A66A3F", "#FAF5E9", "#D7A83D"] },
};

const THEME_ORDER: ThemeName[] = ["nile", "ocean", "forest", "sunset", "lavender", "midnight", "heritage"];

function SettingRow({
  title,
  description,
  children,
}: {
  title: { ar: string; en: string };
  description?: { ar: string; en: string };
  children: React.ReactNode;
}) {
  return (
    <div className="setting-row">
      <div className="setting-text">
        <Dual as="strong" ar={title.ar} en={title.en} />
        {description ? <Dual as="span" ar={description.ar} en={description.en} /> : null}
      </div>
      <div className="setting-control">{children}</div>
    </div>
  );
}

function Segmented<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; ar: string; en: string; mono?: boolean }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="segmented" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={String(option.value)}
          type="button"
          className={option.mono ? "mono" : undefined}
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          <Dual ar={option.ar} en={option.en} />
        </button>
      ))}
    </div>
  );
}

function ThemePicker({ compact }: { compact: boolean }) {
  const a11y = useA11y();
  const { lang } = useLang();
  return (
    <div className={compact ? "theme-picker compact" : "theme-picker"} role="radiogroup" aria-label={pick(lang, "المظهر", "Theme")}>
      {THEME_ORDER.map((name) => {
        const meta = THEME_META[name];
        const chosen = a11y.theme === name;
        return (
          <button
            key={name}
            type="button"
            role="radio"
            aria-checked={chosen}
            className="theme-option"
            onClick={() => a11y.setTheme(name)}
            title={compact ? pick(lang, meta.ar, meta.en) : undefined}
          >
            <span className="theme-bar" aria-hidden="true">
              {meta.colors.map((color) => (
                <i key={color} style={{ background: color }} />
              ))}
            </span>
            <span className={compact ? "sr-only" : "theme-name"}>
              <Dual ar={meta.ar} en={meta.en} />
            </span>
            {chosen ? <Check size={14} strokeWidth={3} className="theme-tick" aria-hidden="true" /> : null}
          </button>
        );
      })}
    </div>
  );
}

export function AppearanceSettings({ compact = false }: { compact?: boolean }) {
  const a11y = useA11y();
  return (
    <>
      <ThemePicker compact={compact} />
      <SwitchRow
        checked={a11y.highContrast}
        onChange={a11y.setHighContrast}
        title={{ ar: "تباين عالٍ", en: "High contrast" }}
        description={compact ? undefined : { ar: "أسود على أبيض بحدود واضحة، فوق أي مظهر.", en: "Black on white with strong edges, over any theme." }}
      />
    </>
  );
}

export function TextSettings({ compact = false }: { compact?: boolean }) {
  const a11y = useA11y();
  const { lang } = useLang();
  const presetOn = a11y.highContrast && a11y.textSize === "lg";
  return (
    <>
      <SettingRow title={{ ar: "حجم الخط", en: "Font size" }}>
        <Segmented
          label={pick(lang, "حجم الخط", "Font size")}
          value={a11y.textSize}
          options={TEXT_SIZES}
          onChange={a11y.setTextSize}
        />
      </SettingRow>
      {!compact ? (
        <SwitchRow
          checked={presetOn}
          onChange={(next) => {
            a11y.setHighContrast(next);
            a11y.setTextSize(next ? "lg" : "md");
          }}
          title={{ ar: "تباين عالٍ مع خط كبير", en: "High contrast + large text" }}
          description={{ ar: "الإعدادان معاً بضغطة واحدة.", en: "Both settings in one switch." }}
        />
      ) : null}
    </>
  );
}

export function SignSettings({ compact = false }: { compact?: boolean }) {
  const a11y = useA11y();
  const { lang } = useLang();
  return (
    <>
      <SettingRow
        title={{ ar: "سرعة الإشارة", en: "Sign speed" }}
        description={compact ? undefined : { ar: "أبطئ الفيديو إن كانت الإشارة سريعة.", en: "Slow the video down if a sign is too fast." }}
      >
        <Segmented
          label={pick(lang, "سرعة الإشارة", "Sign speed")}
          value={a11y.signSpeed}
          options={SPEEDS.map((value) => ({ value, ar: `${value}×`, en: `${value}×`, mono: true }))}
          onChange={a11y.setSignSpeed}
        />
      </SettingRow>
      <SwitchRow
        checked={a11y.autoSign}
        onChange={a11y.setAutoSign}
        title={{ ar: "تشغيل الإشارة تلقائياً", en: "Play signs automatically" }}
        description={compact ? undefined : { ar: "يبدأ فيديو الإشارة وحده في كل خطوة.", en: "The sign video starts by itself on every step." }}
      />
    </>
  );
}

export function MotionSettings({ compact = false }: { compact?: boolean }) {
  const a11y = useA11y();
  return (
    <SwitchRow
      checked={a11y.reduceMotion}
      onChange={a11y.setReduceMotion}
      title={{ ar: "تقليل الحركة", en: "Reduced motion" }}
      description={compact ? undefined : { ar: "يتوقف الصندوق عن الحركة، وتبقى الأرقام تعمل.", en: "The box stops moving; the numbers keep working." }}
    />
  );
}

export function LearningSettings({ compact = false }: { compact?: boolean }) {
  const a11y = useA11y();
  return (
    <SwitchRow
      checked={a11y.focusMode}
      onChange={a11y.setFocusMode}
      title={{ ar: "وضع التركيز", en: "Focus mode" }}
      description={
        compact ? undefined : { ar: "في الدرس: تبقى الإشارة والشرح والتجربة، ويختفي ما عداها.", en: "In lessons: the sign, explanation, and experiment stay; everything else steps back." }
      }
    />
  );
}

export function LanguageSettings() {
  const { lang, setLang } = useLang();
  return (
    <SettingRow title={{ ar: "لغة الواجهة", en: "Interface language" }}>
      <div className="segmented" role="group" aria-label={pick(lang, "اللغة", "Language")}>
        <button type="button" lang="ar" aria-pressed={lang === "ar"} onClick={() => setLang("ar")}>
          العربية
        </button>
        <button type="button" lang="en" aria-pressed={lang === "en"} onClick={() => setLang("en")}>
          English
        </button>
      </div>
    </SettingRow>
  );
}

/** Compact list for the header's quick settings menu. */
export function A11yControls({ compact = false }: { compact?: boolean }) {
  return (
    <div className="settings-list">
      <AppearanceSettings compact={compact} />
      <TextSettings compact={compact} />
      <SignSettings compact={compact} />
      <MotionSettings compact={compact} />
      <LearningSettings compact={compact} />
    </div>
  );
}
