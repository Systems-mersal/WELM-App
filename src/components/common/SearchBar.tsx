import React from "react";
import { Pressable, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";
import { writingTextAlign } from "../../lib/rtl";
import { colors } from "../../theme/colors";
import { fontFamily } from "../../theme/typography";
import { AppIcon } from "../icons/AppIcon";

export interface SearchBarProps {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  onFilterPress?: () => void;
  className?: string;
  variant?: "home" | "explore";
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = "",
  onFilterPress,
  className = "",
  variant = "home",
}: SearchBarProps) {
  const { t } = useTranslation("common");
  const isHome = variant === "home";
  const textAlign = writingTextAlign();

  return (
    <View
      className={`flex-row items-center border border-border bg-white px-4 ${
        isHome ? "h-[54px] rounded-[16px] gap-3" : "h-[48px] rounded-[12px] gap-3"
      } ${className}`}
    >
      {isHome ? (
        <AppIcon name="search" size={20} color={colors.textMuted} />
      ) : (
        <AppIcon name="sliders" size={18} color={colors.textMuted} />
      )}

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        className="flex-1 text-start text-[14px] text-textMuted"
        style={{ fontFamily: fontFamily.regular, fontSize: 14, textAlign }}
      />

      {isHome && onFilterPress ? (
        <Pressable
          onPress={onFilterPress}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t("a11y.filter")}
          className="rounded-[8px] bg-primary p-[6px]"
        >
          <AppIcon name="sliders" size={18} color={colors.white} />
        </Pressable>
      ) : null}

      {!isHome ? <AppIcon name="search" size={18} color={colors.textMuted} /> : null}
    </View>
  );
}
