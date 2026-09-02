import React from "react";
import { Pressable, View } from "react-native";
import { useTranslation } from "react-i18next";

import type { CityKey } from "../../constants/search-cities";
import { AppText } from "../typography/AppText";

type Props = {
  nearestCityKey: CityKey;
  onChangeLocation: () => void;
  onSearchNearestCity: () => void;
};

export function CoverageEmptyState({
  nearestCityKey,
  onChangeLocation,
  onSearchNearestCity,
}: Props) {
  const { t } = useTranslation(["home", "vehicles"]);

  return (
    <View className="rounded-2xl border border-border bg-white p-5">
      <AppText variant="subtitle" className="text-start text-text">
        {t("home:empty-title")}
      </AppText>
      <AppText variant="caption" className="mt-2 text-start text-textMuted">
        {t("home:empty-subtitle")}
      </AppText>
      <AppText variant="body" className="mt-3 text-start text-text">
        {t("home:nearest-city", {
          city: t(`vehicles:locations.${nearestCityKey}`),
        })}
      </AppText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("home:search-nearest-city")}
        onPress={onSearchNearestCity}
        className="mt-4 h-12 items-center justify-center rounded-pill bg-primary active:opacity-90"
      >
        <AppText variant="button" className="text-white">
          {t("home:search-nearest-city")}
        </AppText>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("home:change-location")}
        onPress={onChangeLocation}
        className="mt-2 h-11 items-center justify-center"
      >
        <AppText variant="body" className="text-textMuted">
          {t("home:change-location")}
        </AppText>
      </Pressable>
    </View>
  );
}
