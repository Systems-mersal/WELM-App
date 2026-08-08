import { getLocaleDirection } from "../i18n/routing";
import { useLanguage } from "./useLanguage";

/** Reactive RTL helpers derived from the active locale (updates on language change). */
export function useRtl() {
  const { language, isRTL } = useLanguage();
  const direction = getLocaleDirection(language);

  return {
    language,
    isRTL,
    direction,
    writingDirection: direction,
    /** Physical alignment for start edge without I18nManager reload. */
    textAlign: (isRTL ? "right" : "left") as "left" | "right",
    chevronStart: (isRTL ? "chevron-right" : "chevron-left") as
      | "chevron-left"
      | "chevron-right",
    chevronEnd: (isRTL ? "chevron-left" : "chevron-right") as
      | "chevron-left"
      | "chevron-right",
  };
}
