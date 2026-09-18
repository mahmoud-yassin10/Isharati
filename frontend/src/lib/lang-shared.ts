export type Lang = "ar" | "en";

export const LANG_COOKIE = "raqeeb_lang";
export const A11Y_KEY = "raqeeb_a11y";

export function parseLang(value: string | null | undefined): Lang {
  return value === "en" ? "en" : "ar";
}

/**
 * Runs before paint and before React hydration. Sets language, direction, and
 * a11y theme from storage so a later hydrate (which may reset <html> to the
 * server snapshot) does not flash RTL icons / the default theme.
 */
export const DOCUMENT_BOOTSTRAP = `(function(){try{var el=document.documentElement;var k=${JSON.stringify(LANG_COOKIE)};var c=document.cookie.split("; ").find(function(x){return x.indexOf(k+"=")==0});var v=c?c.slice(k.length+1):localStorage.getItem(k);if(v!=="en"&&v!=="ar")v="ar";el.lang=v;el.dir=v==="ar"?"rtl":"ltr";if(!c)document.cookie=k+"="+v+";path=/;max-age=31536000;SameSite=Lax";var raw=localStorage.getItem(${JSON.stringify(A11Y_KEY)});if(!raw)return;var a=JSON.parse(raw);var themes={nile:1,ocean:1,forest:1,sunset:1,lavender:1,midnight:1,heritage:1,original:"nile",night:"midnight",desert:"heritage",calm:"ocean"};var theme=themes[a.theme]===1?a.theme:themes[a.theme];if(typeof theme==="string")el.setAttribute("data-theme",theme);if(a.textSize==="sm"||a.textSize==="md"||a.textSize==="lg")el.setAttribute("data-text-size",a.textSize);el.classList.toggle("high-contrast",!!a.highContrast);el.classList.toggle("reduce-motion",!!a.reduceMotion);el.classList.toggle("focus-mode",!!a.focusMode);}catch(e){}})();`;

/** @deprecated kept so existing imports keep working */
export const LANG_BOOTSTRAP = DOCUMENT_BOOTSTRAP;
