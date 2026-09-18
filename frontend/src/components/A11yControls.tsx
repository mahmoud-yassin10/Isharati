"use client";

import { Activity, Check, Contrast, Gauge, Hand, Languages, MonitorCog, ScanEye, Type } from "lucide-react";
import { Dual } from "@/components/Dual";
import { SwitchRow } from "@/components/ui";
import { useA11y, type TextSize, type ThemeName } from "@/lib/a11y";
import { pick, useLang } from "@/lib/lang";

const TEXT_SIZES: { value: TextSize; ar: string; en: string }[] = [
  { value: "sm", ar: "صغير", en: "Small" },
  { value: "md", ar: "عادي", en: "Normal" },
  { value: "lg", ar: "كبير", en: "Large" },
];

const SPEEDS = [
  { value: 0.6, label: "0.6×" },
  { value: 0.8, label: "0.8×" },
  { value: 1, label: "1×" },
];

/** Exact spec palettes for the preview cards. Names never reach the DOM as hex. */
const THEME_META: Record<ThemeName, { ar: string; en: string; arDesc: string; enDesc: string; colors: [string, string, string] }> = {
  nile: {
    ar: "النيل",
    en: "Nile",
    arDesc: "مصري، موثوق، تعليمي",
    enDesc: "Egyptian, trustworthy",
    colors: ["#1261A0", "#F7F5EF", "#F4C542"],
  },
  ocean: {
    ar: "المحيط",
    en: "Ocean",
    arDesc: "هادئ، عصري",
    enDesc: "Calm, modern",
    colors: ["#176B87", "#F2F8F9", "#48B7B0"],
  },
  forest: {
    ar: "الغابة",
    en: "Forest",
    arDesc: "طبيعي، مريح",
    enDesc: "Natural, grounded",
    colors: ["#28745A", "#F4F7F0", "#A8C95B"],
  },
  sunset: {
    ar: "الغروب",
    en: "Sunset",
    arDesc: "دافئ، مشجع",
    enDesc: "Warm, energetic",
    colors: ["#D66A32", "#FFF8ED", "#F2C14E"],
  },
  lavender: {
    ar: "اللافندر",
    en: "Lavender",
    arDesc: "إبداعي، ودود",
    enDesc: "Creative, friendly",
    colors: ["#7157A8", "#F8F6FC", "#B9A7E8"],
  },
  midnight: {
    ar: "منتصف الليل",
    en: "Midnight",
    arDesc: "مركّز، مريح ليلاً",
    enDesc: "Focused, comfortable at night",
    colors: ["#0E1822", "#162331", "#F5C84B"],
  },
  heritage: {
    ar: "التراث المصري",
    en: "Egyptian Heritage",
    arDesc: "مصري، دافئ، رصين",
    enDesc: "Egyptian, warm, refined",
    colors: ["#A66A3F", "#FAF5E9", "#D7A83D"],
  },
};

const THEME_ORDER: ThemeName[] = ["nile", "ocean", "forest", "sunset", "lavender", "midnight", "heritage"];

/** Section heading shared by the settings page groups. */
export function SettingsGroupTitle({
  icon,
  ar,
  en,
}: {
  icon: React.ReactNode;
  ar: string;
  en: string;
}) {
  return (
    <h2 className="settings-group-title">
      <span className="settings-group-icon" aria-hidden="true">
        {icon}
      </span>
      <Dual ar={ar} en={en} />
    </h2>
  );
}

/** Appearance: learning-environment themes. */
export function ThemeControls({ compact = false }: { compact?: boolean }) {
  const a11y = useA11y();
  const { lang } = useLang();

  return (
    <>
      {!compact ? (
        <SettingsGroupTitle
          icon={<MonitorCog size={20} strokeWidth={1.75} />}
          ar="بيئة التعلّم"
          en="Your learning environment"
        />
      ) : null}

      <div className={compact ? "theme-grid compact" : "theme-grid"} role="radiogroup" aria-label={pick(lang, "بيئة التعلّم", "Learning environment")}>
        {THEME_ORDER.map((name) => {
          const meta = THEME_META[name];
          const chosen = a11y.theme === name;
          return (
            <button
              key={name}
              type="button"
              role="radio"
              aria-checked={chosen}
              className={chosen ? "theme-swatch chosen" : "theme-swatch"}
              onClick={() => a11y.setTheme(name)}
            >
              <span
                className={`theme-chip theme-${name}`}
                aria-hidden="true"
              >
                <i />
                <i />
                <i />
                <span className="theme-check">
                  <Check size={16} strokeWidth={3} />
                </span>
              </span>
              <span className="theme-name">
                <Dual ar={meta.ar} en={meta.en} />
              </span>
              {!compact ? (
                <span className="theme-desc">
                  <Dual ar={meta.arDesc} en={meta.enDesc} />
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </>
  );
}

/** Text: size and the combined High Contrast + Large Text preset. */
export function TextControls({ compact = false }: { compact?: boolean }) {
  const a11y = useA11y();
  const { lang } = useLang();

  const presetOn = a11y.highContrast && a11y.textSize === "lg";

  return (
    <>
      {!compact ? (
        <SettingsGroupTitle icon={<Type size={20} strokeWidth={1.75} />} ar="النص" en="Text" />
      ) : null}

      <div className="setting-row" style={compact ? { paddingInline: 0 } : undefined}>
        <span className="label" style={{ display: "grid" }}>
          <strong style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 600 }}>
            <Type size={20} strokeWidth={1.75} className="icon" aria-hidden="true" />
            <Dual ar="حجم الخط" en="Font size" />
          </strong>
          {!compact ? (
            <Dual as="span" className="muted small" ar="يكبّر كل النصوص في الموقع." en="Makes every text on the site bigger." />
          ) : null}
        </span>
        <div className="segmented" role="group" aria-label={pick(lang, "سرعة الإشارة", "Sign speed")}>
          {TEXT_SIZES.map((size) => (
            <button
              key={size.value}
              type="button"
              aria-pressed={a11y.textSize === size.value}
              onClick={() => a11y.setTextSize(size.value)}
            >
              <Dual ar={size.ar} en={size.en} />
            </button>
          ))}
        </div>
      </div>

      <div className="setting-row" style={compact ? { paddingInline: 0 } : undefined}>
        <span className="label" style={{ display: "grid" }}>
          <strong style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 600 }}>
            <Contrast size={20} strokeWidth={1.75} className="icon" aria-hidden="true" />
            <Dual ar="تباين عالٍ + خط كبير" en="High Contrast + Large Text" />
          </strong>
          {!compact ? (
            <Dual
              as="span"
              className="muted small"
              ar="إعداد جاهز يجمع الوضعين لأقصى وضوح."
              en="One preset that combines both modes for maximum clarity."
            />
          ) : null}
        </span>
        <button
          type="button"
          className={presetOn ? "btn secondary preset-on" : "btn secondary"}
          aria-pressed={presetOn}
          onClick={() => {
            const next = !presetOn;
            a11y.setHighContrast(next);
            if (next) a11y.setTextSize("lg");
            else a11y.setTextSize("md");
          }}
        >
          {presetOn ? <Check size={20} strokeWidth={2.4} className="icon" aria-hidden="true" /> : null}
          <Dual ar={presetOn ? "مُطبَّق" : "تطبيق"} en={presetOn ? "Applied" : "Apply"} />
        </button>
      </div>
    </>
  );
}

/** Sign language: playback speed and automatic playback. */
export function SignControls({ compact = false }: { compact?: boolean }) {
  const a11y = useA11y();
  const { lang } = useLang();

  return (
    <>
      {!compact ? (
        <SettingsGroupTitle icon={<Hand size={20} strokeWidth={1.75} />} ar="لغة الإشارة" en="Sign language" />
      ) : null}

      <div className="setting-row" style={compact ? { paddingInline: 0 } : undefined}>
        <span className="label" style={{ display: "grid" }}>
          <strong style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 600 }}>
            <Gauge size={20} strokeWidth={1.75} className="icon" aria-hidden="true" />
            <Dual ar="سرعة الإشارة" en="Sign speed" />
          </strong>
          {!compact ? (
            <Dual as="span" className="muted small" ar="أبطئ الفيديو إن كانت الإشارة سريعة." en="Slow the video down if the sign is too fast." />
          ) : null}
        </span>
        <div className="segmented" role="group" aria-label={pick(lang, "سرعة الإشارة", "Sign speed")}>
          {SPEEDS.map((speed) => (
            <button
              key={speed.value}
              type="button"
              className="mono"
              aria-pressed={a11y.signSpeed === speed.value}
              onClick={() => a11y.setSignSpeed(speed.value)}
            >
              {speed.label}
            </button>
          ))}
        </div>
      </div>

      <SwitchRow
        checked={a11y.autoSign}
        onChange={a11y.setAutoSign}
        icon={<Hand size={20} strokeWidth={1.75} className="icon" aria-hidden="true" />}
        title={{ ar: "تشغيل الإشارة تلقائياً", en: "Automatic sign playback" }}
        description={
          compact ? undefined : { ar: "يبدأ فيديو الإشارة وحده في كل خطوة.", en: "The sign video starts by itself on every step." }
        }
      />
    </>
  );
}

/** Motion and learning: still motion, focus mode. */
export function MotionControls({ compact = false }: { compact?: boolean }) {
  const a11y = useA11y();

  return (
    <>
      {!compact ? (
        <SettingsGroupTitle icon={<Activity size={20} strokeWidth={1.75} />} ar="الحركة والتعلّم" en="Motion and learning" />
      ) : null}

      <SwitchRow
        checked={a11y.reduceMotion}
        onChange={a11y.setReduceMotion}
        icon={<Activity size={20} strokeWidth={1.75} className="icon" aria-hidden="true" />}
        title={{ ar: "تهدئة الحركة", en: "Reduced motion" }}
        description={
          compact ? undefined : { ar: "يوقف حركة الصندوق. الأرقام تبقى تعمل.", en: "Freezes the box. The numbers keep working." }
        }
      />
      <SwitchRow
        checked={a11y.focusMode}
        onChange={a11y.setFocusMode}
        icon={<ScanEye size={20} strokeWidth={1.75} className="icon" aria-hidden="true" />}
        title={{ ar: "وضع التركيز", en: "Focus mode" }}
        description={
          compact ? undefined : { ar: "يخفي الزوائد ويترك الدرس فقط، مع الحفاظ على مظهرك.", en: "Hides distractions and keeps the lesson, in your chosen theme." }
        }
      />
    </>
  );
}

/** High Contrast: a reading mode, separate from themes. */
export function ContrastControls({ compact = false }: { compact?: boolean }) {
  const a11y = useA11y();

  return (
    <>
      {!compact ? (
        <SettingsGroupTitle icon={<Contrast size={20} strokeWidth={1.75} />} ar="وضوح القراءة" en="Reading clarity" />
      ) : null}

      <SwitchRow
        checked={a11y.highContrast}
        onChange={a11y.setHighContrast}
        icon={<Contrast size={20} strokeWidth={1.75} className="icon" aria-hidden="true" />}
        title={{ ar: "تباين عالٍ", en: "High contrast" }}
        description={
          compact ? undefined : { ar: "أبيض وأسود بحدود واضحة، فوق أي مظهر.", en: "Black and white with strong borders, over any theme." }
        }
      />
    </>
  );
}

/** Flat list for the header quick menu. */
export function A11yControls({ compact = false }: { compact?: boolean }) {
  return (
    <>
      <ThemeControls compact={compact} />
      <TextControls compact={compact} />
      <SignControls compact={compact} />
      <MotionControls compact={compact} />
      <ContrastControls compact={compact} />
    </>
  );
}

/** Language switch used on the settings page. */
export function LanguageSetting() {
  return (
    <>
      <SettingsGroupTitle icon={<Languages size={20} strokeWidth={1.75} />} ar="اللغة" en="Language" />
      <LanguageToggle />
    </>
  );
}

function LanguageToggle() {
  const { lang, setLang } = useLang();

  return (
    <div className="setting-row">
      <span className="label" style={{ display: "grid" }}>
        <strong style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 600 }}>
          <Languages size={20} strokeWidth={1.75} className="icon" aria-hidden="true" />
          <Dual ar="لغة الواجهة" en="Interface language" />
        </strong>
        <Dual as="span" className="muted small" ar="تتغير كل الصفحات فوراً." en="Every page switches instantly." />
      </span>
      <div className="segmented" role="group" aria-label={pick(lang, "اللغة", "Language")}>
        <button type="button" aria-pressed={lang === "ar"} onClick={() => setLang("ar")}>
          العربية
        </button>
        <button type="button" aria-pressed={lang === "en"} onClick={() => setLang("en")}>
          English
        </button>
      </div>
    </div>
  );
}
