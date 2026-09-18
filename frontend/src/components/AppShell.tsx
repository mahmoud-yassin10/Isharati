"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Settings, X } from "lucide-react";
import { A11yControls } from "@/components/A11yControls";
import { BrandMark } from "@/components/Brand";
import { Dual } from "@/components/Dual";
import { BRAND } from "@/lib/brand";
import { health, logout } from "@/lib/api";
import { pick, useLang } from "@/lib/lang";
import type { User } from "@/lib/types";

type NavItem = { href: string; ar: string; en: string };

/** Only what each person actually needs from the top bar. The logo is "home". */
function navFor(role: User["role"] | null, onHome: boolean): NavItem[] {
  if (role === "student") return [{ href: "/student", ar: "دروسي", en: "My lessons" }];
  if (role === "teacher") return [{ href: "/teacher", ar: "الدروس", en: "Lessons" }];
  return [{ href: onHome ? "#lab" : "/#lab", ar: "المختبر", en: "The lab" }];
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

  const navItems = navFor(user?.role ?? null, pathname === "/");

  const langSwitch = (
    <div className="lang-switch" role="group" aria-label={pick(lang, "اللغة", "Language")}>
      <button type="button" lang="ar" aria-pressed={lang === "ar"} onClick={() => setLang("ar")}>
        عربي
      </button>
      <span aria-hidden="true">/</span>
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
            <BrandMark size={26} />
            <span className="brand-name" lang="ar">
              {BRAND.ar}
            </span>
          </a>

          <nav className="topnav" aria-label={pick(lang, "التنقل الرئيسي", "Main navigation")}>
            {navItems.map((item) => (
              <a key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : undefined}>
                <Dual ar={item.ar} en={item.en} />
              </a>
            ))}
          </nav>

          <div className="topbar-tools">
            {signReady === false ? (
              <p className="status-note" title={pick(lang, "فيديو الإشارة غير متاح الآن", "Sign video is unavailable now")}>
                <Dual ar="الإشارة غير متاحة الآن" en="Signs unavailable" />
              </p>
            ) : null}

            <button
              type="button"
              className="settings-trigger"
              popoverTarget="a11y-menu"
              aria-label={pick(lang, "الإعدادات", "Settings")}
            >
              <Settings size={18} strokeWidth={1.75} aria-hidden="true" />
              <span className="settings-trigger-label">
                <Dual ar="الإعدادات" en="Settings" />
              </span>
            </button>

            {langSwitch}

            {user ? (
              <div className="account">
                <span className="account-name">{user.name}</span>
                <button type="button" className="link-btn" onClick={onLogout}>
                  <Dual ar="خروج" en="Log out" />
                </button>
              </div>
            ) : (
              <a className="btn small" href="/login">
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
          <nav className="wrap" aria-label={pick(lang, "القائمة", "Menu")}>
            <ul>
              {navItems.map((item) => (
                <li key={item.href}>
                  <a href={item.href}>
                    <Dual ar={item.ar} en={item.en} />
                  </a>
                </li>
              ))}
              <li>
                <a href="/settings" aria-current={pathname === "/settings" ? "page" : undefined}>
                  <Dual ar="الإعدادات" en="Settings" />
                </a>
              </li>
              <li>
                {user ? (
                  <button type="button" onClick={onLogout}>
                    <Dual ar={`خروج (${user.name})`} en={`Log out (${user.name})`} />
                  </button>
                ) : (
                  <a href="/login">
                    <Dual ar="دخول" en="Log in" />
                  </a>
                )}
              </li>
            </ul>
            {langSwitch}
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
