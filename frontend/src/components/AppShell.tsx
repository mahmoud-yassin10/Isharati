"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Accessibility, BookOpen, GraduationCap, Hand, LogOut, Users, VideoOff, X } from "lucide-react";
import { A11yControls } from "@/components/A11yControls";
import { Dual } from "@/components/Dual";
import { health, logout } from "@/lib/api";
import { pick, useLang } from "@/lib/lang";
import type { User } from "@/lib/types";

type NavItem = { href: string; ar: string; en: string; icon: React.ReactNode };

function navFor(role: User["role"] | null): NavItem[] {
  const a11y = {
    href: "/accessibility",
    ar: "الإتاحة",
    en: "Accessibility",
    icon: <Accessibility size={20} strokeWidth={1.75} className="icon" aria-hidden="true" />,
  };
  if (role === "teacher") {
    return [
      {
        href: "/teacher",
        ar: "الدروس",
        en: "Lessons",
        icon: <BookOpen size={20} strokeWidth={1.75} className="icon" aria-hidden="true" />,
      },
      a11y,
    ];
  }
  if (role === "student") {
    return [
      {
        href: "/student",
        ar: "دروسي",
        en: "My lessons",
        icon: <GraduationCap size={20} strokeWidth={1.75} className="icon" aria-hidden="true" />,
      },
      a11y,
    ];
  }
  return [a11y];
}

export function AppShell({
  user,
  children,
  bare = false,
}: {
  user: User | null;
  children: React.ReactNode;
  bare?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { lang, setLang } = useLang();
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
        <Dual ar="تخطَّ إلى المحتوى" en="Skip to content" />
      </a>

      <header className="topbar">
        <div className="wrap topbar-inner">
          <a className="brand" href={user ? `/${user.role}` : "/"}>
            <span className="brand-mark" aria-hidden="true">
              <Hand size={22} strokeWidth={2} />
            </span>
            <span className="brand-text">رقيب</span>
          </a>

          <nav className="topnav" aria-label={pick(lang, "التنقل", "Navigation")}>
            {navFor(user?.role ?? null).map((item) => (
              <a key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : undefined}>
                {item.icon}
                <span>
                  <Dual ar={item.ar} en={item.en} />
                </span>
              </a>
            ))}
          </nav>

          <div className="topbar-tools">
            {signReady === false ? (
              <p className="status-chip" title={pick(lang, "فيديو الإشارة غير متاح الآن", "Sign video is unavailable now")}>
                <VideoOff size={18} strokeWidth={1.75} className="icon" aria-hidden="true" />
                <span>
                  <Dual ar="الإشارة غير متاحة" en="Signs unavailable" />
                </span>
              </p>
            ) : null}

            <button
              type="button"
              className="icon-btn bordered"
              popoverTarget="a11y-menu"
              aria-label={pick(lang, "إعدادات الإتاحة السريعة", "Quick accessibility settings")}
              title={pick(lang, "إعدادات الإتاحة السريعة", "Quick accessibility settings")}
            >
              <Accessibility size={24} strokeWidth={1.75} aria-hidden="true" />
            </button>

            <div className="lang-switch" role="group" aria-label={pick(lang, "اللغة", "Language")}>
              <button type="button" aria-pressed={lang === "ar"} onClick={() => setLang("ar")}>
                عربي
              </button>
              <button type="button" aria-pressed={lang === "en"} onClick={() => setLang("en")}>
                EN
              </button>
            </div>

            {user ? (
              <div className="account">
                <span className="avatar" aria-hidden="true">
                  {user.name.trim().charAt(0)}
                </span>
                <span className="account-name">
                  <span>{user.name}</span>
                  <span>
                    <Dual
                      ar={user.role === "teacher" ? "معلم" : "طالب"}
                      en={user.role === "teacher" ? "Teacher" : "Student"}
                    />
                  </span>
                </span>
                <button type="button" className="btn quiet" onClick={onLogout}>
                  <LogOut size={20} strokeWidth={1.75} className="icon flip-rtl" aria-hidden="true" />
                  <span>
                    <Dual ar="خروج" en="Log out" />
                  </span>
                </button>
              </div>
            ) : (
              <a className="btn" href="/login">
                <Users size={20} strokeWidth={1.75} className="icon" aria-hidden="true" />
                <Dual ar="دخول" en="Log in" />
              </a>
            )}
          </div>
        </div>
      </header>

      <div id="a11y-menu" popover="auto" className="a11y-menu">
        <div className="a11y-menu-head">
          <h2>
            <Dual ar="الإتاحة" en="Accessibility" />
          </h2>
          <button
            type="button"
            className="icon-btn"
            popoverTarget="a11y-menu"
            popoverTargetAction="hide"
            aria-label={pick(lang, "إغلاق", "Close")}
          >
            <X size={22} strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>
        <A11yControls compact />
        <p className="a11y-menu-foot small">
          <a href="/accessibility" className="back-link">
            <Dual ar="كل إعدادات الإتاحة" en="All accessibility settings" />
          </a>
        </p>
      </div>

      <main id="main">{children}</main>

      {!bare ? (
        <footer className="footer">
          <div className="wrap footer-inner">
            <p>
              <Dual
                ar="رقيب · منهج مصري بلغة الإشارة المصرية"
                en="Raqeeb · the Egyptian curriculum in Egyptian Sign Language"
              />
            </p>
            <a className="back-link" href="/accessibility">
              <Accessibility size={20} strokeWidth={1.75} className="icon" aria-hidden="true" />
              <Dual ar="إعدادات الإتاحة" en="Accessibility settings" />
            </a>
          </div>
        </footer>
      ) : null}
    </div>
  );
}
