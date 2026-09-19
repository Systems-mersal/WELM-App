import React from "react";
import { Pressable, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppIcon } from "../icons/AppIcon";
import { AppText } from "../typography/AppText";
import { useRtl } from "../../hooks/useRtl";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";

export interface StackScreenHeaderProps {
  title?: string;
  onBack?: () => void;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  /** Replaces the centered title when provided (e.g. brand logo). */
  center?: React.ReactNode;
  /** `card` = white bar with bottom border; `plain` = minimal (OTP). */
  variant?: "card" | "plain";
}

export function StackScreenHeader({
  title = "",
  onBack,
  leading,
  trailing,
  center,
  variant = "card",
}: StackScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation("common");
  const { chevronStart } = useRtl();

  const spacer = <View className="h-11 w-11" />;

  const backButton = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t("back")}
      onPress={onBack}
      className="h-11 w-11 items-center justify-center rounded-full bg-background active:opacity-70"
      hitSlop={8}
    >
      <AppIcon name={chevronStart} size={20} color={colors.text} />
    </Pressable>
  );

  if (variant === "plain") {
    return (
      <View
        className="flex-row items-center gap-3 bg-white px-6 pb-2"
        style={{ paddingTop: insets.top + spacing.sm }}
      >
        {leading ?? (onBack ? backButton : null)}
        {center ? (
          <View className="flex-1 items-center">{center}</View>
        ) : (
          <AppText variant="subtitle" className="flex-1 text-text">
            {title}
          </AppText>
        )}
        {trailing}
      </View>
    );
  }

  const showBackAtStart = Boolean(onBack) && leading == null;
  const showBackAtEnd = Boolean(onBack) && leading != null && trailing == null;

  return (
    <View
      className="flex-row items-center justify-between border-b border-border bg-white px-6 pb-4"
      style={{ paddingTop: insets.top + spacing.md }}
    >
      <View className="min-w-[44px] items-start">
        {leading ?? (showBackAtStart ? backButton : spacer)}
      </View>
      <View className="flex-1 items-center justify-center px-2">
        {center ?? (
          <AppText variant="title" className="text-center">
            {title}
          </AppText>
        )}
      </View>
      <View className="min-w-[44px] items-end">
        {trailing ?? (showBackAtEnd ? backButton : spacer)}
      </View>
    </View>
  );
}
