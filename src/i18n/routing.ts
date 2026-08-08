/**
 * Locale routing config — mirrors dms-new-frontend-nextjs `src/i18n/routing.ts`.
 * React Native has no URL locales; language is stored and applied via LocaleRoot `direction`.
 */

export const locales = ["en", "ar"] as const;

export type AppLocale = (typeof locales)[number];

/** Used when no locale matches / no stored preference. */
export const defaultLocale: AppLocale = "ar";

export function isAppLocale(value: string | null | undefined): value is AppLocale {
  return value === "en" || value === "ar";
}

/** Same rule as DMS layouts: `dir={locale === "ar" ? "rtl" : "ltr"}`. */
export function getLocaleDirection(locale: AppLocale): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr";
}
