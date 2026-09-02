import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import MapView, { Circle } from "react-native-maps";
import { useTranslation } from "react-i18next";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { CategoryChips } from "../../components/common/CategoryChips";
import { Screen } from "../../components/common/Screen";
import { StackScreenHeader } from "../../components/layout/StackScreenHeader";
import { AppText } from "../../components/typography/AppText";
import {
  LOCATION_RADIUS_OPTIONS,
  parseRadiusKm,
  type LocationRadiusKm,
} from "../../lib/location-storage";
import type { RootStackParamList } from "../../navigation/types";
import { useLocationStore } from "../../stores/location-store";
import { colors } from "../../theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "LocationRadius">;

const METERS_PER_KM = 1000;
/** Degrees of latitude ≈ 111 km. Pad so the circle stays in view. */
const KM_PER_LAT_DEGREE = 111;
const REGION_PADDING = 2.4;

export function LocationRadiusScreen({ navigation }: Props) {
  const { t } = useTranslation("home");
  const latitude = useLocationStore((state) => state.latitude);
  const longitude = useLocationStore((state) => state.longitude);
  const storedRadiusKm = useLocationStore((state) => state.radiusKm);
  const setRadiusKm = useLocationStore((state) => state.setRadiusKm);
  const [draftRadiusKm, setDraftRadiusKm] = useState<LocationRadiusKm>(
    storedRadiusKm,
  );

  const hasCoordinates = latitude != null && longitude != null;

  useEffect(() => {
    if (!hasCoordinates) {
      navigation.goBack();
    }
  }, [hasCoordinates, navigation]);

  const radiusOptions = useMemo(
    () =>
      LOCATION_RADIUS_OPTIONS.map((km) => ({
        key: String(km),
        label: t(`radius-km.${km}`),
      })),
    [t],
  );

  const region = useMemo(() => {
    if (latitude == null || longitude == null) {
      return null;
    }
    const latitudeDelta = (draftRadiusKm * REGION_PADDING) / KM_PER_LAT_DEGREE;
    return {
      latitude,
      longitude,
      latitudeDelta,
      longitudeDelta: latitudeDelta,
    };
  }, [draftRadiusKm, latitude, longitude]);

  const handleConfirm = () => {
    setRadiusKm(draftRadiusKm);
    navigation.goBack();
  };

  if (!hasCoordinates || region == null || latitude == null || longitude == null) {
    return null;
  }

  return (
    <Screen
      scrollable={false}
      edges={["bottom"]}
      className="bg-white"
      contentClassName="px-0"
      header={
        <StackScreenHeader
          title={t("radius-title")}
          onBack={() => navigation.goBack()}
        />
      }
    >
      <View className="flex-1">
        <MapView
          style={styles.map}
          region={region}
          scrollEnabled
          zoomEnabled
          pitchEnabled={false}
          rotateEnabled={false}
        >
          <Circle
            center={{ latitude, longitude }}
            radius={draftRadiusKm * METERS_PER_KM}
            strokeWidth={2}
            strokeColor={colors.primary}
            fillColor={`${colors.primary}33`}
          />
        </MapView>
      </View>

      <View className="gap-4 px-6 pb-4 pt-4">
        <AppText variant="subtitle" className="text-start text-text">
          {t("radius-label")}
        </AppText>
        <CategoryChips
          categories={radiusOptions}
          selectedKey={String(draftRadiusKm)}
          onSelect={(key) => setDraftRadiusKm(parseRadiusKm(Number(key)))}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("radius-confirm")}
          onPress={handleConfirm}
          className="h-14 items-center justify-center rounded-pill bg-primary active:opacity-90"
        >
          <AppText variant="button" className="text-white">
            {t("radius-confirm")}
          </AppText>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});
