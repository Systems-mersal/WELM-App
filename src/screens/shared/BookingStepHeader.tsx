import React from "react";
import { Pressable, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppIcon } from "../../components/icons/AppIcon";
import { AppText } from "../../components/typography/AppText";
import { useRtl } from "../../hooks/useRtl";
import { colors } from "../../theme/colors";

interface BookingStepHeaderProps {
  step: string;
  title: string;
  onBack: () => void;
}

export function BookingStepHeader({ step, title, onBack }: BookingStepHeaderProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation("common");
  const { chevronStart } = useRtl();

  return (
    <View
      className="bg-primary px-6 pb-4"
      style={{ paddingTop: insets.top + 8 }}
    >
      <View className="flex-row items-center justify-between">
        <View className="rounded-full bg-white/15 px-3 py-1.5">
          <AppText variant="caption" className="text-white">
            {step}
          </AppText>
        </View>

        <AppText variant="subtitle" className="flex-1 text-center text-white">
          {title}
        </AppText>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("back")}
          onPress={onBack}
          className="h-10 w-10 items-center justify-center rounded-full bg-white/15 active:opacity-70"
        >
          <AppIcon name={chevronStart} size={20} color={colors.white} />
        </Pressable>
      </View>
    </View>
  );
}
