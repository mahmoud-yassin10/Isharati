"use client";

import { Contrast, Gauge, Hand, Pause, ScanEye, Type } from "lucide-react";
import { Dual } from "@/components/Dual";
import { SwitchRow } from "@/components/ui";
import { useA11y, type TextSize } from "@/lib/a11y";
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

/** Shared accessibility controls: used in the header menu and on the settings page. */
export function A11yControls({ compact = false }: { compact?: boolean }) {
  const a11y = useA11y();
  const { lang } = useLang();

  return (
    <>
      <div className="setting-row" style={compact ? { paddingInline: 0 } : undefined}>
        <span className="label" style={{ display: "grid" }}>
          <strong style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 600 }}>
            <Type size={20} strokeWidth={1.75} className="icon" aria-hidden="true" />
            <Dual ar="حجم الخط" en="Text size" />
          </strong>
          {!compact ? (
            <Dual as="span" className="muted small" ar="يكبّر كل النصوص في الموقع." en="Makes every text on the site bigger." />
          ) : null}
        </span>
        <div className="segmented" role="group" aria-label={pick(lang, "حجم الخط", "Text size")}>
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
        title={{ ar: "تشغيل الإشارة تلقائياً", en: "Play signs automatically" }}
        description={
          compact
            ? undefined
            : { ar: "يبدأ فيديو الإشارة وحده في كل خطوة.", en: "The sign video starts by itself on every step." }
        }
      />
      <SwitchRow
        checked={a11y.highContrast}
        onChange={a11y.setHighContrast}
        icon={<Contrast size={20} strokeWidth={1.75} className="icon" aria-hidden="true" />}
        title={{ ar: "تباين عالي", en: "High contrast" }}
        description={
          compact ? undefined : { ar: "أسود وأبيض بحدود واضحة.", en: "Black and white with strong borders." }
        }
      />
      <SwitchRow
        checked={a11y.reduceMotion}
        onChange={a11y.setReduceMotion}
        icon={<Pause size={20} strokeWidth={1.75} className="icon" aria-hidden="true" />}
        title={{ ar: "تهدئة الحركة", en: "Still motion" }}
        description={
          compact
            ? undefined
            : { ar: "يوقف حركة الصندوق. الأرقام تبقى تعمل.", en: "Freezes the box. The numbers keep working." }
        }
      />
      <SwitchRow
        checked={a11y.focusMode}
        onChange={a11y.setFocusMode}
        icon={<ScanEye size={20} strokeWidth={1.75} className="icon" aria-hidden="true" />}
        title={{ ar: "وضع التركيز", en: "Focus mode" }}
        description={
          compact ? undefined : { ar: "يخفي القوائم ويترك الخطوة الحالية.", en: "Hides the menus and leaves the current step." }
        }
      />
    </>
  );
}
