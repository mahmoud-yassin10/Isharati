export type Lang = "ar" | "en";

export const LANG_COOKIE = "raqeeb_lang";

export function parseLang(value: string | null | undefined): Lang {
  return value === "en" ? "en" : "ar";
}

/**
 * Runs in <head> before paint. Applies the saved language to <html> so Dual
 * CSS (and dir) match the user's choice on the first frame, even when the
 * cookie is missing and React still has the Arabic default.
 */
export const LANG_BOOTSTRAP = `(function(){try{var k=${JSON.stringify(LANG_COOKIE)};var c=document.cookie.split("; ").find(function(x){return x.indexOf(k+"=")==0});var v=c?c.slice(k.length+1):localStorage.getItem(k);if(v!=="en"&&v!=="ar")v="ar";var el=document.documentElement;el.lang=v;el.dir=v==="ar"?"rtl":"ltr";if(!c)document.cookie=k+"="+v+";path=/;max-age=31536000;SameSite=Lax";}catch(e){}})();`;
