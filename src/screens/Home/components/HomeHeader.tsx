import React from "react";
import { Pressable, View } from "react-native";
import { useTranslation } from "react-i18next";
import avatarSource from "../../../assets/figma/home/avatar.png";
import { Avatar } from "../../../components/common/Avatar";
import { AppIcon } from "../../../components/icons/AppIcon";
import { AppText } from "../../../components/typography/AppText";
import { useAuthStore } from "../../../stores/auth-store";
import { useLocationStore } from "../../../stores/location-store";
import { colors } from "../../../theme/colors";
import { fontFamily } from "../../../theme/typography";

export interface HomeHeaderProps {
  onNotificationsPress: () => void;
  onLocationPress: () => void;
}

export function HomeHeader({
  onNotificationsPress,
  onLocationPress,
}: HomeHeaderProps) {
  const { t } = useTranslation(["home", "common", "vehicles"]);
  const user = useAuthStore((state) => state.user);
  const displayName = user?.firstName || user?.name || t("user-name");
  const status = useLocationStore((state) => state.status);
  const cityKey = useLocationStore((state) => state.cityKey);
  const radiusKm = useLocationStore((state) => state.radiusKm);
  const latitude = useLocationStore((state) => state.latitude);
  const longitude = useLocationStore((state) => state.longitude);
  const hasSearchPoint = latitude != null && longitude != null;

  const locationLabel = cityKey
    ? t(`vehicles:locations.${cityKey}`)
    : status === "granted"
      ? t("home:current-location")
      : t("home:change-location");
  const radiusLabel = t(`home:radius-km.${radiusKm}`);

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

      <View className="flex-row items-center gap-2">
        {hasSearchPoint ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("home:change-location")}
            onPress={onLocationPress}
            className="max-w-[148px] flex-row items-center gap-1 rounded-[14px] border border-border bg-white px-3 py-2.5 active:opacity-70"
          >
            <AppIcon name="map-pin" size={16} color={colors.primary} />
            <View className="min-w-0 items-start">
              <AppText
                variant="caption"
                numberOfLines={1}
                className="text-text"
              >
                {locationLabel}
              </AppText>
              <AppText variant="caption" className="text-textMuted">
                {radiusLabel}
              </AppText>
            </View>
          </Pressable>
        ) : null}
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
    </View>
  );
}
