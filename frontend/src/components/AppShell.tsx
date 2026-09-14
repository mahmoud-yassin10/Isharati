"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Dual } from "@/components/Dual";
import { logout } from "@/lib/api";
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
      <main id="main">
        <div className="wrap">{children}</div>
      </main>
    </div>
  );
}
