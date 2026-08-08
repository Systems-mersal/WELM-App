import React from "react";
import { Pressable, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../hooks/useLanguage";
import { useRtl } from "../../hooks/useRtl";
import { AppIcon } from "../icons/AppIcon";
import { AppText } from "../typography/AppText";
import { colors } from "../../theme/colors";

export interface LanguageSwitcherProps {
  /**
   * `settings` — Profile settings row (default).
   * `button` — compact control like the DMS header switcher.
   */
  variant?: "settings" | "button";
  className?: string;
}

/**
 * Mirrors dms-new-frontend-nextjs `components/common/language-switcher.tsx`:
 * toggles ar ↔ en; label shows the language you switch into.
 */
export function LanguageSwitcher({
  variant = "settings",
  className = "",
}: LanguageSwitcherProps) {
  const { t } = useTranslation("common");
  const { language, toggleLanguage } = useLanguage();
  const { chevronEnd } = useRtl();

  // Same labels as DMS: show the *other* language.
  const targetLabel = language === "ar" ? "English" : "العربية";

  if (variant === "button") {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${t("language")}: ${targetLabel}`}
        onPress={() => {
          void toggleLanguage();
        }}
        className={`flex-row items-center gap-2 rounded-pill border border-border bg-white px-3 py-2 active:opacity-70 ${className}`}
      >
        <AppText variant="label">{targetLabel}</AppText>
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${t("language")}: ${targetLabel}`}
      onPress={() => {
        void toggleLanguage();
      }}
      className={`flex-row items-center justify-between border-b border-border py-4 active:opacity-70 ${className}`}
    >
      <AppText variant="body">{t("language")}</AppText>
      <View className="flex-row items-center gap-2">
        <AppText variant="caption" muted>
          {targetLabel}
        </AppText>
        <AppIcon name={chevronEnd} size={18} color={colors.textMuted} />
      </View>
    </Pressable>
  );
}
