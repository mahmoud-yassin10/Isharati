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

const icon = (Icon: typeof BookOpen) => <Icon size={19} strokeWidth={1.75} className="icon" aria-hidden="true" />;

/**
 * Real routes only. Guests get the two entry points plus the lab on the home
 * page; signed-in users get their own workspace first.
 */
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

const LAB_LINK: NavItem = { href: "/#lab", ar: "المختبر", en: "Lab", icon: null };

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

  return (
    <div className="shell">
      <a className="skip" href="#main">
        <Dual ar="تخطَّ إلى المحتوى" en="Skip to content" />
      </a>

      <header className={navOpen ? "topbar nav-open" : "topbar"}>
        <div className="wrap topbar-inner">
          <a className="brand" href={user ? `/${user.role}` : "/"}>
            <span className="brand-mark" aria-hidden="true">
              <BrandMark size={30} />
            </span>
            <BrandWordmark />
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
                <VideoOff size={17} strokeWidth={1.75} className="icon" aria-hidden="true" />
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
              <Settings size={21} strokeWidth={1.75} className="icon" aria-hidden="true" />
              <span className="a11y-trigger-label">
                <Dual ar="الإعدادات" en="Settings" />
              </span>
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
                  <LogOut size={19} strokeWidth={1.75} className="icon flip-rtl" aria-hidden="true" />
                  <span className="account-logout">
                    <Dual ar="خروج" en="Log out" />
                  </span>
                </button>
              </div>
            ) : (
              <a className="btn" href="/login">
                <Users size={19} strokeWidth={1.75} className="icon" aria-hidden="true" />
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
              {navOpen ? (
                <X size={22} strokeWidth={1.9} aria-hidden="true" />
              ) : (
                <Menu size={22} strokeWidth={1.9} aria-hidden="true" />
              )}
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
            {user ? (
              <button type="button" className="btn secondary block" onClick={onLogout}>
                <LogOut size={19} strokeWidth={1.75} className="icon flip-rtl" aria-hidden="true" />
                <Dual ar="خروج" en="Log out" />
              </button>
            ) : (
              <a className="btn block" href="/login">
                <Users size={19} strokeWidth={1.75} className="icon" aria-hidden="true" />
                <Dual ar="دخول" en="Log in" />
              </a>
            )}
          </nav>
        </div>
      </header>

      <div id="a11y-menu" popover="auto" className="a11y-menu">
        <div className="a11y-menu-head">
          <div>
            <h2>
              <Dual ar="الإعدادات" en="Settings" />
            </h2>
            <Dual as="p" className="small muted" ar="تعمل في كل صفحة، وتُحفظ على جهازك." en="Works on every page, saved on your device." />
          </div>
          <button
            type="button"
            className="btn quiet"
            popoverTarget="a11y-menu"
            popoverTargetAction="hide"
            aria-label={pick(lang, "إغلاق", "Close")}
          >
            <X size={20} strokeWidth={1.9} aria-hidden="true" />
          </button>
        </div>
        <A11yControls compact />
        <p className="a11y-menu-foot">
          <a className="back-link" href="/settings">
            <Dual ar="كل الإعدادات" en="All settings" />
          </a>
        </p>
      </div>

      <main id="main">{children}</main>

      {!bare ? (
        <footer className="footer">
          <div className="wrap footer-inner">
            <div className="footer-brand">
              <span className="footer-mark" aria-hidden="true">
                <BrandMark size={34} />
              </span>
              <p className="footer-name">{BRAND.ar}</p>
              <Dual as="p" className="small muted" ar={BRAND.tagline.ar} en={BRAND.tagline.en} />
              <Dual as="p" className="small muted" ar={BRAND.promise.ar} en={BRAND.promise.en} />
            </div>

            <nav className="footer-col" aria-label={pick(lang, "روابط", "Links")}>
              <Dual as="h2" className="footer-title" ar="تنقّل" en="Navigation" />
              <ul>
                <li>
                  <a href="/">
                    <Dual ar="الرئيسية" en="Home" />
                  </a>
                </li>
                <li>
                  <a href={labHref}>
                    <Dual ar="المختبر" en="The lab" />
                  </a>
                </li>
                <li>
                  <a href={user?.role === "student" ? "/student" : "/login?role=student"}>
                    <Dual ar="للطلاب" en="For students" />
                  </a>
                </li>
                <li>
                  <a href={user?.role === "teacher" ? "/teacher" : "/login?role=teacher"}>
                    <Dual ar="للمعلمين" en="For teachers" />
                  </a>
                </li>
              </ul>
            </nav>

            <div className="footer-col">
              <Dual as="h2" className="footer-title" ar="الإعدادات" en="Settings" />
              <Dual
                as="p"
                className="small muted"
                ar="اختار مظهرك، حجم الخط، سرعة الإشارة، وهدوء الحركة — في كل صفحة."
                en="Choose your theme, text size, sign speed, and still motion — on every page."
              />
              <a className="btn secondary" href="/settings">
                <Settings size={19} strokeWidth={1.75} className="icon" aria-hidden="true" />
                <Dual ar="افتح الإعدادات" en="Open settings" />
              </a>
            </div>
          </div>
          <div className="wrap footer-bottom">
            <p className="small">
              <Dual
                ar="إشارتي · منصة تعليمية للطلاب الصم وضعاف السمع"
                en="Isharati · an education platform for deaf and hard-of-hearing students"
              />
            </p>
            <Dual
              as="p"
              className="small"
              ar="لا يُستخدم الصوت في أي شاشة. كل تعليق يظهر بأيقونة وكلمة ولون."
              en="No sound is used on any screen. Every response shows an icon, a word, and a color."
            />
          </div>
        </footer>
      ) : null}
    </div>
  );
}
