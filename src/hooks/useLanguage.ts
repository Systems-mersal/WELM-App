import { useCallback } from "react";
import { useTranslation } from "react-i18next";

export type AppLanguage = "ar" | "en";

export function useLanguage() {
  const { i18n } = useTranslation();

  const language = (i18n.resolvedLanguage?.startsWith("ar") ? "ar" : "en") as AppLanguage;
  const isRTL = language === "ar";

  const setLanguage = useCallback(
    async (lang: AppLanguage) => {
      if (lang !== language) {
        await i18n.changeLanguage(lang);
      }
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
