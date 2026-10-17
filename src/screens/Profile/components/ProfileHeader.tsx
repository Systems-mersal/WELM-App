import React from "react";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { Avatar } from "../../../components/common/Avatar";
import { Badge } from "../../../components/common/Badge";
import { AppText } from "../../../components/typography/AppText";
import { useWelmBookings } from "../../../features/bookings";
import { useAuthStore } from "../../../stores/auth-store";
import { fontFamily } from "../../../theme/typography";

function formatStat(value: number, language: string): string {
  const arabic = language.startsWith("ar");
  return new Intl.NumberFormat(arabic ? "ar-SA-u-nu-arab" : "en").format(value);
}

export function ProfileHeader() {
  const { t } = useTranslation("profile");
  const user = useAuthStore((state) => state.user);
  const displayName = user?.name || t("user-name");
  const displayEmail = user?.email || t("user-email");
  const avatarSource = user?.avatarUrl ? { uri: user.avatarUrl } : undefined;

  return (
    <View className="flex-row items-center gap-2">
      <Avatar source={avatarSource} name={displayName} size={36} />
      <View className="min-w-0 flex-1 flex-row items-center justify-between gap-2">
        <View className="min-w-0 flex-1 items-start">
          <AppText
            className="text-[14px] text-white"
            style={{ fontFamily: fontFamily.semibold }}
            numberOfLines={1}
          >
            {displayName}
          </AppText>
          <AppText variant="caption" className="text-white/70" numberOfLines={1}>
            {displayEmail}
          </AppText>
        </View>
        <Badge
          label={t("golden")}
          variant="neutral"
          className="border border-peachGold bg-peachGold/20 px-2 py-0.5"
        />
      </View>
    </View>
  );
}

export function ProfileStats() {
  const { t, i18n } = useTranslation("profile");
  const { bookings, isLoading, isError } = useWelmBookings();
  const bookingCount = bookings.length;
  const favoriteCount = 0;
  const bookingLabel =
    bookingCount === 0 && (isLoading || isError)
      ? "—"
      : formatStat(bookingCount, i18n.language);

  return (
    <View className="mx-6 mt-5 flex-row rounded-[16px] bg-white px-3 py-2.5 shadow-sm">
      <View className="flex-1 items-center border-e border-border">
        <AppText variant="subtitle" className="text-primary">
          {bookingLabel}
        </AppText>
        <AppText variant="caption" muted className="text-center">
          {t("total-bookings")}
        </AppText>
      </View>
      <View className="flex-1 items-center">
        <AppText variant="subtitle" className="text-primary">
          {formatStat(favoriteCount, i18n.language)}
        </AppText>
        <AppText variant="caption" muted className="text-center">
          {t("favorite-cars")}
        </AppText>
      </View>
    </View>
  );
}
