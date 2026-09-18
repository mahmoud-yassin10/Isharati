"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, GraduationCap, LogOut, Menu, Settings, Users, VideoOff, X } from "lucide-react";
import { A11yControls } from "@/components/A11yControls";
import { BrandMark, BrandWordmark } from "@/components/Brand";
import { Dual } from "@/components/Dual";
import { BRAND } from "@/lib/brand";
import { health, logout } from "@/lib/api";
import { pick, useLang } from "@/lib/lang";
import type { User } from "@/lib/types";

type NavItem = { href: string; ar: string; en: string; icon: React.ReactNode };

const icon = (Icon: typeof BookOpen) => <Icon size={18} strokeWidth={1.75} className="icon" aria-hidden="true" />;

/** Real routes only. Signed-in users get their own workspace first, then home. */
function primaryNavFor(role: User["role"] | null): NavItem[] {
  if (role === "student") {
    return [
      { href: "/student", ar: "دروسي", en: "My lessons", icon: icon(GraduationCap) },
      { href: "/", ar: "الرئيسية", en: "Home", icon: icon(BookOpen) },
    ];
  }
  if (role === "teacher") {
    return [
      { href: "/teacher", ar: "الدروس", en: "Lessons", icon: icon(BookOpen) },
      { href: "/", ar: "الرئيسية", en: "Home", icon: icon(BookOpen) },
    ];
  }
  return [
    { href: "/", ar: "الرئيسية", en: "Home", icon: icon(BookOpen) },
    { href: "/login?role=student", ar: "للطلاب", en: "Students", icon: icon(GraduationCap) },
    { href: "/login?role=teacher", ar: "للمعلمين", en: "Teachers", icon: icon(Users) },
  ];
}

const LAB_LINK = { ar: "المختبر", en: "Lab" };

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
  const [navOpen, setNavOpen] = useState(false);

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

  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!navOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setNavOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navOpen]);

  function onLogout() {
    logout();
    router.push("/");
  }

  const navItems = primaryNavFor(user?.role ?? null);
  const labHref = pathname === "/" ? "#lab" : "/#lab";

  const langSwitch = (
    <div className="lang-switch" role="group" aria-label={pick(lang, "اللغة", "Language")}>
      <button type="button" lang="ar" aria-pressed={lang === "ar"} onClick={() => setLang("ar")}>
        عربي
      </button>
      <button type="button" lang="en" aria-pressed={lang === "en"} onClick={() => setLang("en")}>
        EN
      </button>
    </div>
  );

  return (
    <div className="shell">
      <a className="skip" href="#main">
        <Dual ar="تخطَّ إلى المحتوى" en="Skip to content" />
      </a>

      <header className={navOpen ? "topbar nav-open" : "topbar"}>
        <div className="wrap topbar-inner">
          <a className="brand" href={user ? `/${user.role}` : "/"}>
            <span className="brand-mark" aria-hidden="true">
              <BrandMark size={28} />
            </span>
            <BrandWordmark compact />
          </a>

          <nav className="topnav" aria-label={pick(lang, "التنقل الرئيسي", "Main navigation")}>
            {navItems.map((item) => (
              <a key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : undefined}>
                {item.icon}
                <span>
                  <Dual ar={item.ar} en={item.en} />
                </span>
              </a>
            ))}
            <a href={labHref} aria-current={false}>
              <span className="nav-tick" aria-hidden="true" />
              <span>
                <Dual ar={LAB_LINK.ar} en={LAB_LINK.en} />
              </span>
            </a>
          </nav>

          <div className="topbar-tools">
            {signReady === false ? (
              <p className="status-chip" title={pick(lang, "فيديو الإشارة غير متاح الآن", "Sign video is unavailable now")}>
                <VideoOff size={16} strokeWidth={1.75} className="icon" aria-hidden="true" />
                <span>
                  <Dual ar="الإشارة غير متاحة" en="Signs unavailable" />
                </span>
              </p>
            ) : null}

            <button
              type="button"
              className="btn ghost a11y-trigger"
              popoverTarget="a11y-menu"
              aria-label={pick(lang, "الإعدادات السريعة", "Quick settings")}
            >
              <Settings size={18} strokeWidth={1.75} className="icon" aria-hidden="true" />
              <span className="a11y-trigger-label">
                <Dual ar="الإعدادات" en="Settings" />
              </span>
            </button>

            {langSwitch}

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
                <button type="button" className="btn quiet icon-only" onClick={onLogout} aria-label={pick(lang, "خروج", "Log out")} title={pick(lang, "خروج", "Log out")}>
                  <LogOut size={18} strokeWidth={1.75} className="icon flip-rtl" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <a className="btn" href="/login">
                <Users size={18} strokeWidth={1.75} className="icon" aria-hidden="true" />
                <Dual ar="دخول" en="Log in" />
              </a>
            )}

            <button
              type="button"
              className="nav-toggle"
              aria-expanded={navOpen}
              aria-controls="mobile-nav"
              onClick={() => setNavOpen((open) => !open)}
            >
              {navOpen ? <X size={22} strokeWidth={1.75} aria-hidden="true" /> : <Menu size={22} strokeWidth={1.75} aria-hidden="true" />}
              <span className="sr-only">
                <Dual ar={navOpen ? "أغلق القائمة" : "افتح القائمة"} en={navOpen ? "Close the menu" : "Open the menu"} />
              </span>
            </button>
          </div>
        </div>

        <div className="mobile-nav" id="mobile-nav" hidden={!navOpen}>
          <nav className="wrap" aria-label={pick(lang, "تنقل الجوال", "Mobile navigation")}>
            <ul>
              {navItems.map((item) => (
                <li key={item.href}>
                  <a href={item.href} aria-current={pathname === item.href ? "page" : undefined}>
                    {item.icon}
                    <Dual ar={item.ar} en={item.en} />
                  </a>
                </li>
              ))}
              <li>
                <a href={labHref}>
                  <span className="nav-tick" aria-hidden="true" />
                  <Dual ar={LAB_LINK.ar} en={LAB_LINK.en} />
                </a>
              </li>
              <li>
                <a href="/settings" aria-current={pathname === "/settings" ? "page" : undefined}>
                  {icon(Settings)}
                  <Dual ar="الإعدادات" en="Settings" />
                </a>
              </li>
            </ul>
            {langSwitch}
            {user ? (
              <button type="button" className="btn secondary block" onClick={onLogout}>
                <LogOut size={18} strokeWidth={1.75} className="icon flip-rtl" aria-hidden="true" />
                <Dual ar="خروج" en="Log out" />
              </button>
            ) : (
              <a className="btn block" href="/login">
                <Users size={18} strokeWidth={1.75} className="icon" aria-hidden="true" />
                <Dual ar="دخول" en="Log in" />
              </a>
            )}
          </nav>
        </div>
      </header>

      <div id="a11y-menu" popover="auto" className="quick-settings">
        <div className="quick-settings-head">
          <h2>
            <Dual ar="الإعدادات" en="Settings" />
          </h2>
          <button
            type="button"
            className="icon-btn"
            popoverTarget="a11y-menu"
            popoverTargetAction="hide"
            aria-label={pick(lang, "إغلاق", "Close")}
          >
            <X size={20} strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>
        <A11yControls compact />
        <a className="text-link" href="/settings">
          <Dual ar="كل الإعدادات" en="All settings" />
        </a>
      </div>

      <main id="main">{children}</main>

      {!bare ? (
        <footer className="footer">
          <div className="wrap footer-inner">
            <p className="footer-brand">
              <span lang="ar">{BRAND.ar}</span>
              <Dual ar={` · ${BRAND.tagline.ar}`} en={` · ${BRAND.tagline.en}`} />
            </p>
            <nav className="footer-links" aria-label={pick(lang, "روابط", "Links")}>
              <a href={pathname === "/" ? "#lab" : "/#lab"}>
                <Dual ar="المختبر" en="The lab" />
              </a>
              <a href="/settings">
                <Dual ar="الإعدادات" en="Settings" />
              </a>
              <a href={user ? `/${user.role}` : "/login"}>
                <Dual
                  ar={user ? (user.role === "teacher" ? "الدروس" : "دروسي") : "دخول"}
                  en={user ? (user.role === "teacher" ? "Lessons" : "My lessons") : "Log in"}
                />
              </a>
            </nav>
          </div>
        </footer>
      ) : null}
    </div>
  );
}
