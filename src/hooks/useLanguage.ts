import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { isAppLocale, type AppLocale } from "../i18n/routing";
import { setStoredLanguage } from "../lib/language-storage";

export type AppLanguage = AppLocale;

function resolveLanguage(lng: string | undefined): AppLanguage {
  if (isAppLocale(lng)) {
    return lng;
  }
  return lng?.startsWith("ar") ? "ar" : "en";
}

/**
 * Language switcher API — RN equivalent of DMS
 * `router.replace(pathname, { locale })` + `useLocale()`.
 */
export function useLanguage() {
  const { i18n } = useTranslation();

  const language = resolveLanguage(i18n.resolvedLanguage ?? i18n.language);
  const isRTL = language === "ar";

  const setLanguage = useCallback(
    async (lang: AppLanguage) => {
      if (lang === language) {
        return;
      }

      await setStoredLanguage(lang);
      await i18n.changeLanguage(lang);
    },
    [i18n, language],
  );

  const toggleLanguage = useCallback(() => {
    return setLanguage(language === "ar" ? "en" : "ar");
  }, [language, setLanguage]);

  return {
    language,
    isRTL,
    setLanguage,
    toggleLanguage,
  };
}
