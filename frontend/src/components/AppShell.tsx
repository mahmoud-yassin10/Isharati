"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Dual } from "@/components/Dual";
import { useA11y } from "@/lib/a11y";
import { health, logout } from "@/lib/api";
import { useLang } from "@/lib/lang";
import type { User } from "@/lib/types";

export function AppShell({
  user,
  children,
}: {
  user: User | null;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { lang, setLang } = useLang();
  const a11y = useA11y();
  const [signReady, setSignReady] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    health()
      .then((data) => {
        if (cancelled) return;
        const routes = data.routes ?? {};
        setSignReady(Boolean(routes.text_to_sign && routes.video));
      })
      .catch(() => {
        if (!cancelled) setSignReady(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function onLogout() {
    logout();
    router.push("/");
  }

  return (
    <div className="shell">
      <a className="skip" href="#main">
        <Dual ar="تخطّ إلى المحتوى" en="Skip to content" />
      </a>
      <header className="topbar">
        <div className="wrap topbar-inner">
          <a className="brand" href="/">
            رقيب
          </a>
          <div className="topbar-meta">
            <div className="a11y-bar" role="group" aria-label={lang === "ar" ? "الإتاحة" : "Accessibility"}>
              <button
                type="button"
                aria-pressed={a11y.textSize === "lg"}
                onClick={() => a11y.setTextSize(a11y.textSize === "lg" ? "md" : "lg")}
              >
                {a11y.textSize === "lg" ? "A" : "A+"}
              </button>
              <button
                type="button"
                aria-pressed={a11y.highContrast}
                onClick={() => a11y.setHighContrast(!a11y.highContrast)}
              >
                <Dual ar="تباين" en="Contrast" />
              </button>
              <button
                type="button"
                aria-pressed={a11y.reduceMotion}
                onClick={() => a11y.setReduceMotion(!a11y.reduceMotion)}
              >
                <Dual ar="هدوء" en="Still" />
              </button>
              <button
                type="button"
                aria-pressed={a11y.focusMode}
                onClick={() => a11y.setFocusMode(!a11y.focusMode)}
              >
                <Dual ar="تركيز" en="Focus" />
              </button>
              <button
                type="button"
                aria-pressed={a11y.autoSign}
                onClick={() => a11y.setAutoSign(!a11y.autoSign)}
              >
                <Dual ar="إشارة" en="Sign" />
              </button>
            </div>
            <div className="lang-switch" role="group" aria-label={lang === "ar" ? "اللغة" : "Language"}>
              <button
                type="button"
                aria-pressed={lang === "ar"}
                onClick={() => setLang("ar")}
              >
                عربي
              </button>
              <button
                type="button"
                aria-pressed={lang === "en"}
                onClick={() => setLang("en")}
              >
                EN
              </button>
            </div>
            {user ? (
              <>
                <span className="role-pill">
                  <Dual
                    ar={user.role === "teacher" ? "معلم" : "طالب"}
                    en={user.role === "teacher" ? "Teacher" : "Student"}
                  />
                </span>
                <button type="button" className="btn ghost icon" onClick={onLogout}>
                  <LogOut size={20} strokeWidth={1.75} />
                  <Dual ar="خروج" en="Log out" />
                </button>
              </>
            ) : (
              <a className="btn ghost" href="/login">
                <Dual ar="دخول" en="Log in" />
              </a>
            )}
          </div>
        </div>
      </header>
      {signReady === false ? (
        <p className="health-banner" role="status">
          <Dual
            ar="فيديو الإشارة غير جاهز الآن. اقرأ الكلمة على الشاشة."
            en="Sign video is not ready. Read the word on screen."
          />
        </p>
      ) : null}
      <main id="main">
        <div className="wrap">{children}</div>
      </main>
    </div>
  );
}
