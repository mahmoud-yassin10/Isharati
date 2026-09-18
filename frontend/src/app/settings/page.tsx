"use client";

import { Info, Keyboard } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Dual } from "@/components/Dual";
import { ContrastControls, LanguageSetting, MotionControls, SignControls, TextControls, ThemeControls } from "@/components/A11yControls";
import { BRAND } from "@/lib/brand";
import { useA11y } from "@/lib/a11y";
import { useUser } from "@/lib/useUser";

export default function SettingsPage() {
  const { user } = useUser();
  const a11y = useA11y();

  return (
    <AppShell user={user}>
      <div className="wrap page">
        <div className="page-head">
          <div className="titles">
            <p className="eyebrow">
              <span className="eyebrow-line" aria-hidden="true" />
              <Dual ar="تجربتك" en="Your experience" />
            </p>
            <h1>
              <Dual ar={`الإعدادات في ${BRAND.ar}`} en={`Settings in ${BRAND.en}`} />
            </h1>
            <Dual
              as="p"
              className="muted prose"
              ar="اختر بيئة التعلّم التي تريحك، وسرعة الإشارة، وحجم الخط. كل إعداد يعمل في جميع الصفحات، ويُحفظ على هذا الجهاز وحده."
              en="Choose the learning environment that suits you, your sign speed, and text size. Every setting applies on all pages and is saved on this device only."
            />
          </div>

          <ul className="a11y-state" aria-live="polite">
            <li className="chip">
              <Dual
                ar={a11y.highContrast ? "الوضع: تباين عالٍ" : `المظهر: ${a11y.theme}`}
                en={a11y.highContrast ? "Mode: high contrast" : `Theme: ${a11y.theme}`}
              />
            </li>
            <li className="chip">
              <Dual
                ar={`الخط: ${a11y.textSize === "sm" ? "صغير" : a11y.textSize === "lg" ? "كبير" : "عادي"}`}
                en={`Text: ${a11y.textSize}`}
              />
            </li>
            <li className="chip">
              <Dual ar={`سرعة الإشارة: ${a11y.signSpeed}×`} en={`Sign speed: ${a11y.signSpeed}×`} />
            </li>
            <li className="chip">
              <Dual
                ar={a11y.reduceMotion ? "الحركة: هادئة" : "الحركة: عادية"}
                en={a11y.reduceMotion ? "Motion: still" : "Motion: normal"}
              />
            </li>
          </ul>
        </div>

        <div className="settings-layout">
          <div className="stack">
            <section className="panel settings-group" aria-label="Learning environment">
              <ThemeControls />
            </section>

            <section className="panel settings-group" aria-label="Text">
              <TextControls />
            </section>

            <section className="panel settings-group" aria-label="Sign language">
              <SignControls />
            </section>

            <section className="panel settings-group" aria-label="Motion and learning">
              <MotionControls />
            </section>

            <section className="panel settings-group" aria-label="Reading clarity">
              <ContrastControls />
            </section>

            <section className="panel settings-group" aria-label="Language">
              <LanguageSetting />
            </section>
          </div>

          <div className="stack">
            <section className="panel stack-sm" aria-labelledby="keyboard-help">
              <h2>
                <Keyboard size={21} strokeWidth={1.75} className="icon" aria-hidden="true" />
                <Dual ar="لوحة المفاتيح" en="Keyboard" />
              </h2>
              <ul className="stack-sm" style={{ paddingInlineStart: "1.25rem" }}>
                <Dual
                  as="li"
                  ar="Tab للتنقل بين الأزرار، وتظهر حدود واضحة حول الزر المختار."
                  en="Tab moves between controls, and the selected card shows a clear ring."
                />
                <Dual
                  as="li"
                  ar="الأسهم تحرّك شريطي القوة والكتلة في المختبر، أو استخدم زرّي + و −."
                  en="Arrow keys move the force and mass sliders in the lab, or use the + and − buttons."
                />
                <Dual as="li" ar="Esc يغلق قائمة الإعدادات." en="Esc closes the settings menu." />
              </ul>
            </section>

            <p className="feedback info">
              <Info size={21} strokeWidth={1.75} className="icon" aria-hidden="true" />
              <Dual
                ar={`لا يستخدم ${BRAND.ar} الصوت في أي شاشة. كل تعليق يظهر بأيقونة وكلمة ولون معاً.`}
                en={`${BRAND.en} never uses sound on any screen. Every response shows an icon, a word, and a color together.`}
              />
            </p>

            <p className="small muted">
              <Dual
                ar="الإعدادات محفوظة على هذا الجهاز فقط، ولا تُرسل إلى الخادم."
                en="Settings live on this device only and are never sent to the server."
              />
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
