import i18n from "../i18n";
import { getLocaleDirection, isAppLocale, type AppLocale } from "../i18n/routing";

export type AppChevronName = "chevron-left" | "chevron-right";

function resolveLanguage(): AppLocale {
  const lng = i18n.resolvedLanguage ?? i18n.language;
  if (isAppLocale(lng)) {
    return lng;
  }
  return lng?.startsWith("ar") ? "ar" : "en";
}

/** Prefer `useRtl()` in components so UI updates when language changes. */
export function isRTL(): boolean {
  return resolveLanguage() === "ar";
}

/** Chevron pointing toward reading start (typical back affordance). */
export function chevronStart(): AppChevronName {
  return isRTL() ? "chevron-right" : "chevron-left";
}

/** Chevron pointing toward reading end (typical forward affordance). */
export function chevronEnd(): AppChevronName {
  return isRTL() ? "chevron-left" : "chevron-right";
}

/**
 * Physical start alignment when layout direction is driven by language
 * (without I18nManager.forceRTL / app reload).
 */
export function writingTextAlign(): "left" | "right" {
  return isRTL() ? "right" : "left";
}

export function getWritingDirection(): "rtl" | "ltr" {
  return getLocaleDirection(resolveLanguage());
}
