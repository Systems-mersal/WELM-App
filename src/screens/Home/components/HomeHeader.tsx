import React from "react";
import { Pressable, View } from "react-native";
import { useTranslation } from "react-i18next";
import avatarSource from "../../../assets/figma/home/avatar.png";
import { Avatar } from "../../../components/common/Avatar";
import { AppIcon } from "../../../components/icons/AppIcon";
import { AppText } from "../../../components/typography/AppText";
import { useAuthStore } from "../../../stores/auth-store";
import { colors } from "../../../theme/colors";
import { fontFamily } from "../../../theme/typography";

export interface HomeHeaderProps {
  onNotificationsPress: () => void;
}

export function HomeHeader({ onNotificationsPress }: HomeHeaderProps) {
  const { t } = useTranslation(["home", "common"]);
  const user = useAuthStore((state) => state.user);
  const displayName = user?.firstName || user?.name || t("user-name");

  return (
    <View className="flex-row items-center justify-between py-4">
      <View className="flex-row items-center gap-3">
        <Avatar source={avatarSource} size={44} />
        <View className="items-start gap-0.5">
          <AppText
            className="text-[13px] text-textMuted"
            style={{ fontFamily: fontFamily.regular }}
          >
            {t("welcome")}
          </AppText>
          <AppText
            className="text-[18px] text-text"
            style={{ fontFamily: fontFamily.bold }}
          >
            {displayName}
          </AppText>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("common:a11y.notifications")}
        onPress={onNotificationsPress}
        className="rounded-[14px] border border-border bg-white p-3 active:opacity-70"
        hitSlop={8}
      >
        <AppIcon name="bell" size={20} color={colors.text} />
      </Pressable>
    </View>
  );
}
