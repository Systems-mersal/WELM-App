import React, { useMemo } from "react";
import { Pressable, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Screen } from "../../components/common/Screen";
import { StackScreenHeader } from "../../components/layout/StackScreenHeader";
import { AppText } from "../../components/typography/AppText";
import type { RootStackParamList } from "../../navigation/types";
import { colors } from "../../theme/colors";
import { alertComingSoon } from "../../utils/comingSoon";

type Props = NativeStackScreenProps<RootStackParamList, "Notifications">;

const NOTIFICATION_KEYS = [
  "booking-confirmed",
  "payment-received",
  "license-update",
  "weekend-offer",
] as const;

const DOT_COLORS: Record<(typeof NOTIFICATION_KEYS)[number], string> = {
  "booking-confirmed": colors.success,
  "payment-received": colors.primary,
  "license-update": colors.warning,
  "weekend-offer": colors.peach,
};

export function NotificationsScreen({ navigation }: Props) {
  const { t } = useTranslation("notifications");
  const insets = useSafeAreaInsets();

  const items = useMemo(
    () =>
      NOTIFICATION_KEYS.map((key) => ({
        key,
        title: t(`items.${key}.title`),
        body: t(`items.${key}.body`),
        time: t(`items.${key}.time`),
        dotColor: DOT_COLORS[key],
      })),
    [t],
  );

  return (
    <Screen
      edges={[]}
      className="bg-background"
      contentClassName="px-5 pt-2"
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      header={
        <StackScreenHeader
          title={t("title")}
          onBack={() => navigation.goBack()}
          leading={
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("mark-all-read")}
              onPress={alertComingSoon}
              className="rounded-full border border-border px-3 py-2 active:opacity-70"
            >
              <AppText variant="caption">{t("mark-all-read")}</AppText>
            </Pressable>
          }
        />
      }
    >
      {items.map((item) => (
        <View key={item.key} className="mb-3 flex-row rounded-xl bg-white p-3.5">
          <AppText variant="caption" muted className="w-14">
            {item.time}
          </AppText>
          <View className="ms-2 flex-1 items-end">
            <View className="flex-row items-center gap-2">
              <View
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: item.dotColor }}
              />
              <AppText variant="label" className="text-start">
                {item.title}
              </AppText>
            </View>
            <AppText variant="caption" muted className="mt-1 text-start leading-5">
              {item.body}
            </AppText>
          </View>
        </View>
      ))}
    </Screen>
  );
}
