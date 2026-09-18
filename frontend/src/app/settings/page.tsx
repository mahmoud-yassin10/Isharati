"use client";

import {
  AppearanceSettings,
  LanguageSettings,
  LearningSettings,
  MotionSettings,
  SignSettings,
  TextSettings,
} from "@/components/A11yControls";
import { AppShell } from "@/components/AppShell";
import { Dual } from "@/components/Dual";
import { useUser } from "@/lib/useUser";

function Group({ ar, en, children }: { ar: string; en: string; children: React.ReactNode }) {
  return (
    <section className="settings-group">
      <Dual as="h2" ar={ar} en={en} />
      <div className="settings-list">{children}</div>
    </section>
  );
}

export default function SettingsPage() {
  const { user } = useUser();

  return (
    <AppShell user={user}>
      <div className="wrap page settings-page">
        <header className="page-intro">
          <h1>
            <Dual ar="الإعدادات" en="Settings" />
          </h1>
          <Dual
            as="p"
            ar="تُحفظ على هذا الجهاز وتعمل في كل الصفحات."
            en="Saved on this device and applied on every page."
          />
        </header>

        <Group ar="المظهر" en="Appearance">
          <AppearanceSettings />
        </Group>
        <Group ar="النص" en="Text">
          <TextSettings />
        </Group>
        <Group ar="لغة الإشارة" en="Sign language">
          <SignSettings />
        </Group>
        <Group ar="الحركة" en="Motion">
          <MotionSettings />
        </Group>
        <Group ar="التعلّم" en="Learning">
          <LearningSettings />
        </Group>
        <Group ar="اللغة" en="Language">
          <LanguageSettings />
        </Group>

        <Dual
          as="p"
          className="settings-note"
          ar="لوحة المفاتيح: Tab للتنقل، والأسهم تحرّك شريطي المختبر، وEsc يغلق القوائم."
          en="Keyboard: Tab moves between controls, arrow keys move the lab sliders, Esc closes menus."
        />
      </div>
    </AppShell>
  );
}
