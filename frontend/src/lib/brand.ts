/**
 * Visible brand strings. One place to change so the wordmark, page metadata,
 * footer, and login screen never drift apart.
 *
 * NOTE: storage keys (`raqeeb_*`), demo accounts, and API contracts keep their
 * original identifiers on purpose. Renaming those would log existing users out
 * and change the backend contract, which this redesign must not do.
 */
export const BRAND = {
  ar: "إمكان",
  en: "Imkan",
  latin: "Imkan",
  tagline: {
    ar: "منهج مصري بلغة الإشارة المصرية",
    en: "The Egyptian curriculum in Egyptian Sign Language",
  },
  promise: {
    ar: "لا صوت. فقط صورة وحركة ويد.",
    en: "No sound. Just image, motion, and hands.",
  },
} as const;
