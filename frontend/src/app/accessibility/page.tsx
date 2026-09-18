"use client";

import { Accessibility, Info, Keyboard } from "lucide-react";
import { A11yControls } from "@/components/A11yControls";
import { AppShell } from "@/components/AppShell";
import { Dual } from "@/components/Dual";
import { useUser } from "@/lib/useUser";

export default function AccessibilityPage() {
  const { user } = useUser();

  return (
    <AppShell user={user}>
      <div className="wrap page">
        <div className="page-head">
          <div className="titles">
            <h1>
              <Accessibility size={32} strokeWidth={1.75} className="icon" aria-hidden="true" style={{ display: "inline", verticalAlign: "-6px", marginInlineEnd: "8px" }} />
              <Dual ar="الإتاحة" en="Accessibility" />
            </h1>
            <Dual
              as="p"
              className="muted prose"
              ar="كل إعداد هنا يعمل في جميع الصفحات، ويُحفظ على هذا الجهاز وحده."
              en="Every setting here works on all pages and is saved on this device only."
            />
          </div>
        </div>

        <div className="settings">
          <section className="panel settings-group">
            <h2>
              <Dual ar="القراءة والإشارة" en="Reading and signs" />
            </h2>
            <A11yControls />
          </section>

          <section className="panel stack-sm">
            <h2>
              <Keyboard size={22} strokeWidth={1.75} className="icon" aria-hidden="true" style={{ display: "inline", verticalAlign: "-4px", marginInlineEnd: "8px" }} />
              <Dual ar="لوحة المفاتيح" en="Keyboard" />
            </h2>
            <ul className="stack-sm" style={{ paddingInlineStart: "1.25rem" }}>
              <Dual
                as="li"
                ar="Tab للتنقل بين الأزرار، وتظهر حدود واضحة حول الزر المختار."
                en="Tab moves between controls, and the selected control shows a clear ring."
              />
              <Dual
                as="li"
                ar="الأسهم تحرّك شريطي القوة والكتلة في المختبر، أو استخدم زرّي + و −."
                en="Arrow keys move the force and mass sliders in the lab, or use the + and − buttons."
              />
              <Dual as="li" ar="Esc يغلق قائمة الإتاحة." en="Esc closes the accessibility menu." />
            </ul>
          </section>

          <p className="feedback info">
            <Info size={22} strokeWidth={1.75} className="icon" aria-hidden="true" />
            <Dual
              ar="لا يستخدم رقيب الصوت في أي شاشة. كل تعليق يظهر بأيقونة وكلمة ولون معاً."
              en="Raqeeb never uses sound on any screen. Every response is shown with an icon, a word, and a color together."
            />
          </p>
        </div>
      </div>
    </AppShell>
  );
}
