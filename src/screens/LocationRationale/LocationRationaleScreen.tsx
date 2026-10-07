import React, { useCallback, useMemo, useState } from "react";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { AppButton } from "../../components/buttons/AppButton";
import { InlineErrorBanner } from "../../components/common/InlineErrorBanner";
import { Screen } from "../../components/common/Screen";
import { AppIcon } from "../../components/icons/AppIcon";
import { StackScreenHeader } from "../../components/layout/StackScreenHeader";
import { CityPickerSheet } from "../../components/location/CityPickerSheet";
import { AppText } from "../../components/typography/AppText";
import type { CityKey } from "../../constants/search-cities";
import { resetToLocationRadius } from "../../features/auth/navigation/route-past-auth-gate";
import type { RootStackParamList } from "../../navigation/types";
import { useLocationStore } from "../../stores/location-store";
import { colors } from "../../theme/colors";
import { fontFamily, fontSize } from "../../theme/typography";

type Props = NativeStackScreenProps<RootStackParamList, "LocationRationale">;

function RadarIllustration() {
  return (
    <View className="items-center justify-center py-4" accessibilityIgnoresInvertColors>
      <View className="h-44 w-44 items-center justify-center rounded-full border border-primarySoft bg-primaryMuted">
        <View className="h-32 w-32 items-center justify-center rounded-full border border-primary bg-white">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-white">
            <AppIcon name="map-pin" size={32} color={colors.primary} />
          </View>
        </View>
      </View>
    </View>
  );
}

export function LocationRationaleScreen({ navigation }: Props) {
  const { t } = useTranslation("location");
  const requesting = useLocationStore((state) => state.requesting);
  const enableLocation = useLocationStore((state) => state.enableLocation);
  const selectCity = useLocationStore((state) => state.selectCity);
  const cityKey = useLocationStore((state) => state.cityKey);
  const [cityOpen, setCityOpen] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);

  const benefits = useMemo(
    () =>
      [
        { icon: "map-pin" as const, text: t("benefit-nearby") },
        { icon: "compass" as const, text: t("benefit-radius") },
        { icon: "shield" as const, text: t("benefit-fast") },
      ] as const,
    [t],
  );

  const openRadius = useCallback(() => {
    resetToLocationRadius(navigation);
  }, [navigation]);

  const handleUseCurrent = useCallback(async () => {
    setBanner(null);
    const result = await enableLocation();
    if (result === "granted") {
      openRadius();
      return;
    }
    setCityOpen(true);
    if (result === "denied") {
      setBanner(t("denied-banner"));
      return;
    }
    setBanner(t(result === "unavailable" ? "error-unavailable" : "error-failed"));
  }, [enableLocation, openRadius, t]);

  const handleSelectCity = useCallback(
    (key: CityKey) => {
      selectCity(key);
      setCityOpen(false);
      setBanner(null);
      openRadius();
    },
    [openRadius, selectCity],
  );

  return (
    <View className="flex-1">
      <Screen
        scrollable={false}
        edges={["bottom"]}
        className="bg-white"
        contentClassName="flex-1"
        header={<StackScreenHeader title={t("header")} />}
      >
        <View className="flex-1">
          <RadarIllustration />

          <AppText
            className="mt-2 text-start text-text"
            style={{
              fontFamily: fontFamily.bold,
              fontSize: fontSize.xxl,
              lineHeight: 32,
            }}
          >
            {t("title")}
          </AppText>
          <AppText variant="body" muted className="mt-2 text-start">
            {t("subtitle")}
          </AppText>

          <View className="mt-8 gap-4">
            {benefits.map((row) => (
              <View key={row.text} className="flex-row items-start gap-3">
                <View className="h-11 w-11 items-center justify-center rounded-full bg-primaryMuted">
                  <AppIcon name={row.icon} size={20} color={colors.primary} />
                </View>
                <AppText variant="body" className="flex-1 pt-2.5 text-start text-text">
                  {row.text}
                </AppText>
              </View>
            ))}
          </View>

          {banner ? (
            <InlineErrorBanner
              message={banner}
              onDismiss={() => setBanner(null)}
              dismissAccessibilityLabel={t("denied-dismiss")}
            />
          ) : null}

          <AppText variant="caption" muted className="mt-8 text-start">
            {t("legal")}
          </AppText>
        </View>

        <View className="gap-3 pb-2 pt-4">
          <AppButton
            label={t("use-current")}
            loading={requesting}
            onPress={() => {
              void handleUseCurrent();
            }}
          />
          <AppButton
            label={t("choose-manual")}
            variant="outline"
            disabled={requesting}
            onPress={() => setCityOpen(true)}
          />
        </View>
      </Screen>

      <CityPickerSheet
        visible={cityOpen}
        selected={cityKey}
        onSelect={handleSelectCity}
        onClose={() => setCityOpen(false)}
      />
    </View>
  );
}
