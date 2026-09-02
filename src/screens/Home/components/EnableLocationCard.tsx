import React, { useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

import { AppIcon } from "../../../components/icons/AppIcon";
import { AppText } from "../../../components/typography/AppText";
import type { MainTabNavigationProp } from "../../../navigation/types";
import { useLocationStore } from "../../../stores/location-store";
import { colors } from "../../../theme/colors";

export function EnableLocationCard({
  onChooseCity,
}: {
  onChooseCity: () => void;
}) {
  const { t } = useTranslation("home");
  const navigation = useNavigation<MainTabNavigationProp<"Home">>();
  const requesting = useLocationStore((state) => state.requesting);
  const enableLocation = useLocationStore((state) => state.enableLocation);
  const skipLocation = useLocationStore((state) => state.skipLocation);
  const [errorKey, setErrorKey] = useState<
    "error-denied" | "error-unavailable" | "error-failed" | null
  >(null);

  const handleEnable = async () => {
    const result = await enableLocation();
    if (result === "granted") {
      setErrorKey(null);
      navigation.navigate("LocationRadius");
      return;
    }
    if (result === "denied" || result === "unavailable") {
      setErrorKey(result === "denied" ? "error-denied" : "error-unavailable");
      onChooseCity();
      return;
    }
    setErrorKey("error-failed");
  };

  return (
    <View className="rounded-2xl border border-border bg-white p-4">
      <View className="flex-row items-start gap-3">
        <View className="h-11 w-11 items-center justify-center rounded-full bg-primaryMuted">
          <AppIcon name="map-pin" size={20} color={colors.primary} />
        </View>
        <View className="flex-1 items-start gap-1">
          <AppText variant="subtitle" className="text-start text-text">
            {t("location-title")}
          </AppText>
          <AppText variant="caption" className="text-start text-textMuted">
            {t("location-subtitle")}
          </AppText>
        </View>
      </View>

      {errorKey ? (
        <AppText variant="caption" className="mt-3 text-start text-danger">
          {t(errorKey)}
        </AppText>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("location-enable")}
        disabled={requesting}
        onPress={() => {
          void handleEnable();
        }}
        className={`mt-4 h-12 items-center justify-center rounded-pill bg-primary ${
          requesting ? "opacity-70" : "active:opacity-90"
        }`}
      >
        {requesting ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <AppText variant="button" className="text-white">
            {t("location-enable")}
          </AppText>
        )}
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("location-later")}
        disabled={requesting}
        onPress={skipLocation}
        className="mt-2 h-11 items-center justify-center"
      >
        <AppText variant="body" className="text-textMuted">
          {t("location-later")}
        </AppText>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("select-city")}
        disabled={requesting}
        onPress={onChooseCity}
        className="h-11 items-center justify-center"
      >
        <AppText variant="body" className="text-primary">
          {t("select-city")}
        </AppText>
      </Pressable>
    </View>
  );
}
