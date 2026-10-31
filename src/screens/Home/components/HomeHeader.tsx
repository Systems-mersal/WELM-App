import React from "react";
import { Pressable, View } from "react-native";
import { useTranslation } from "react-i18next";
import { WelmLogo } from "../../../components/brand/WelmLogo";
import { Avatar } from "../../../components/common/Avatar";
import { AppIcon } from "../../../components/icons/AppIcon";
import { AppText } from "../../../components/typography/AppText";
import { useWelmUnreadCount } from "../../../features/notifications";
import { useAuthStore } from "../../../stores/auth-store";
import { colors } from "../../../theme/colors";
import { fontFamily } from "../../../theme/typography";

export interface HomeHeaderProps {
  onNotificationsPress: () => void;
}

export function HomeHeader({ onNotificationsPress }: HomeHeaderProps) {
  const { t } = useTranslation(["home", "common"]);
  const user = useAuthStore((state) => state.user);
  const unreadCount = useWelmUnreadCount();
  const displayName = user?.firstName || user?.name || t("user-name");
  const avatarSource = user?.avatarUrl ? { uri: user.avatarUrl } : undefined;

  return (
    <View className="flex-row items-center justify-between py-4">
      <View className="min-w-0 flex-1 flex-row items-center gap-3">
        <Avatar source={avatarSource} name={displayName} size={44} />
        <View className="min-w-0 shrink items-start gap-0.5">
          <AppText
            className="text-[13px] text-textMuted"
            style={{ fontFamily: fontFamily.regular }}
          >
            {t("welcome")}
          </AppText>
          <AppText
            numberOfLines={1}
            className="text-[18px] text-text"
            style={{ fontFamily: fontFamily.bold }}
          >
            {displayName}
          </AppText>
        </View>
        <WelmLogo width={132} />
      </View>

      <View className="flex-row items-center gap-2 ps-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("common:a11y.notifications")}
          onPress={onNotificationsPress}
          className="relative overflow-visible rounded-[14px] border border-border bg-white p-3 active:opacity-70"
          hitSlop={8}
        >
          <AppIcon name="bell" size={20} color={colors.text} />
          {unreadCount > 0 ? (
            <View
              className="absolute -end-1.5 -top-1.5 h-7 min-w-7 items-center pt-1 justify-center rounded-full border-2 border-white "
              style={{ backgroundColor: colors.danger }}
            >
              <AppText
                className="text-white"
                style={{
                  fontFamily: fontFamily.bold,
                  fontSize: 12,
                  lineHeight: 12,
                  includeFontPadding: false,
                  textAlign: "center",
                }}
              >
                {unreadCount > 99
                  ? "99+"
                  : unreadCount > 9
                    ? "9+"
                    : String(unreadCount)}
              </AppText>
            </View>
          ) : null}
        </Pressable>
      </View>
    </View>
  );
}
