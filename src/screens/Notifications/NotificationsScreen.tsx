import React, { useCallback } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Screen } from "../../components/common/Screen";
import { StackScreenHeader } from "../../components/layout/StackScreenHeader";
import { AppText } from "../../components/typography/AppText";
import {
  formatNotificationRelativeTime,
  openWelmPushTarget,
  payloadFromInboxItem,
  useWelmNotifications,
  type WelmNotificationDto,
} from "../../features/notifications";
import type { RootStackParamList } from "../../navigation/types";
import { colors } from "../../theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "Notifications">;

function unreadDotColor(type: string): string {
  switch (type) {
    case "welm_booking_approved":
      return colors.success;
    case "welm_booking_payment_recorded":
      return colors.primary;
    case "welm_license_expiring":
      return colors.warning;
    default:
      return colors.peach;
  }
}

function InboxRow({
  item,
  onOpen,
  timeLabel,
}: {
  item: WelmNotificationDto;
  onOpen: (item: WelmNotificationDto) => void;
  timeLabel: string;
}) {
  const unread = !item.readAt;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onOpen(item)}
      className="mb-3 flex-row rounded-xl bg-white p-3.5 active:opacity-80"
    >
      <View className="me-2 flex-1 items-start">
        <View className="flex-row items-center gap-2">
          <View
            className={`h-2 w-2 rounded-full ${unread ? "" : "bg-border"}`}
            style={
              unread
                ? { backgroundColor: unreadDotColor(item.type) }
                : undefined
            }
          />
          <AppText variant="label" className="text-start">
            {item.title}
          </AppText>
        </View>
        <AppText variant="caption" muted className="mt-1 text-start leading-5">
          {item.body}
        </AppText>
      </View>
      <AppText variant="caption" muted className="w-14 text-end">
        {timeLabel}
      </AppText>
    </Pressable>
  );
}

export function NotificationsScreen({ navigation }: Props) {
  const { t } = useTranslation(["notifications", "common"]);
  const insets = useSafeAreaInsets();
  const { notifications, isLoading, isError, refetch, markRead } =
    useWelmNotifications();

  const markAllRead = useCallback(() => {
    void markRead({ all: true }).catch(() => undefined);
  }, [markRead]);

  useFocusEffect(
    useCallback(() => {
      markAllRead();
    }, [markAllRead]),
  );

  const openItem = useCallback(
    (item: WelmNotificationDto) => {
      void markRead({ ids: [item.id] }).catch(() => undefined);
      openWelmPushTarget(navigation, payloadFromInboxItem(item));
    },
    [markRead, navigation],
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
              onPress={markAllRead}
              className="rounded-full border border-border px-3 py-2 active:opacity-70"
            >
              <AppText variant="caption">{t("mark-all-read")}</AppText>
            </Pressable>
          }
        />
      }
    >
      {isLoading ? (
        <View className="items-center py-16">
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : isError ? (
        <View className="items-center gap-3 rounded-2xl border border-border bg-white px-4 py-8">
          <AppText variant="body" muted className="text-center">
            {t("common:error")}
          </AppText>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              void refetch();
            }}
            className="rounded-pill bg-primary px-5 py-2"
          >
            <AppText variant="caption" className="text-white">
              {t("common:retry")}
            </AppText>
          </Pressable>
        </View>
      ) : notifications.length === 0 ? (
        <View className="items-center rounded-2xl border border-border bg-white px-4 py-10">
          <AppText variant="label" className="text-center">
            {t("empty")}
          </AppText>
          <AppText variant="caption" muted className="mt-2 text-center">
            {t("empty-desc")}
          </AppText>
        </View>
      ) : (
        notifications.map((item) => (
          <InboxRow
            key={item.id}
            item={item}
            onOpen={openItem}
            timeLabel={formatNotificationRelativeTime(item.createdAt, t)}
          />
        ))
      )}
    </Screen>
  );
}
