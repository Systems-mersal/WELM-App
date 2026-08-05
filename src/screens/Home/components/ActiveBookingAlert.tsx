import React from "react";
import { Pressable, View } from "react-native";
import { useTranslation } from "react-i18next";
import { AppIcon } from "../../../components/icons/AppIcon";
import { AppText } from "../../../components/typography/AppText";
import { chevronEnd } from "../../../lib/rtl";
import { colors } from "../../../theme/colors";
import { fontFamily } from "../../../theme/typography";

export interface ActiveBookingAlertProps {
  onPress: () => void;
}

export function ActiveBookingAlert({ onPress }: ActiveBookingAlertProps) {
  const { t } = useTranslation("home");

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${t("active-booking")}. ${t("active-booking-detail")}`}
      onPress={onPress}
      className="mt-2 w-full flex-row items-center justify-between rounded-[16px] border border-success bg-successBg p-3 active:opacity-80"
    >
      <View className="h-[10px] w-[10px] rounded-[10px] bg-success" />

      <View className="flex-1 items-start gap-0.5 px-2">
        <AppText
          className="text-start text-[14px] text-primary"
          style={{ fontFamily: fontFamily.bold }}
        >
          {t("active-booking")}
        </AppText>
        <AppText
          className="text-start text-[11px] text-primary"
          style={{ fontFamily: fontFamily.regular }}
        >
          {t("active-booking-detail")}
        </AppText>
      </View>

      <View className="h-6 w-6 items-center justify-center">
        <AppIcon name={chevronEnd()} size={14} color={colors.primary} />
      </View>
    </Pressable>
  );
}
