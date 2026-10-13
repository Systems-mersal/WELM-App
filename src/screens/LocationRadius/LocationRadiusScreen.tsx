import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import MapView, { Circle } from "react-native-maps";
import { useTranslation } from "react-i18next";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { CategoryChips } from "../../components/common/CategoryChips";
import { Screen } from "../../components/common/Screen";
import { AppIcon } from "../../components/icons/AppIcon";
import { StackScreenHeader } from "../../components/layout/StackScreenHeader";
import { AppText } from "../../components/typography/AppText";
import { useRtl } from "../../hooks/useRtl";
import { searchPlaces, type PlaceSearchResult } from "../../lib/device-location";
import {
  LOCATION_RADIUS_OPTIONS,
  parseRadiusKm,
  type LocationRadiusKm,
} from "../../lib/location-storage";
import type { RootStackParamList } from "../../navigation/types";
import { useLocationStore } from "../../stores/location-store";
import { colors } from "../../theme/colors";
import { fontFamily } from "../../theme/typography";

type Props = NativeStackScreenProps<RootStackParamList, "LocationRadius">;

const METERS_PER_KM = 1000;
/** Degrees of latitude ≈ 111 km. Pad so the circle stays in view. */
const KM_PER_LAT_DEGREE = 111;
const REGION_PADDING = 2.4;

type SearchState = "idle" | "loading" | "done" | "error";

export function LocationRadiusScreen({ navigation }: Props) {
  const { t } = useTranslation("home");
  const { textAlign, writingDirection } = useRtl();
  const latitude = useLocationStore((state) => state.latitude);
  const longitude = useLocationStore((state) => state.longitude);
  const storedRadiusKm = useLocationStore((state) => state.radiusKm);
  const setRadiusKm = useLocationStore((state) => state.setRadiusKm);
  const setSearchPoint = useLocationStore((state) => state.setSearchPoint);
  const [draftRadiusKm, setDraftRadiusKm] = useState<LocationRadiusKm>(
    storedRadiusKm,
  );
  const [draftPoint, setDraftPoint] = useState(() =>
    latitude != null && longitude != null ? { latitude, longitude } : null,
  );
  const [query, setQuery] = useState("");
  const [searchState, setSearchState] = useState<SearchState>("idle");
  const [results, setResults] = useState<PlaceSearchResult[]>([]);

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
    if (draftPoint == null) {
      return null;
    }
    const latitudeDelta = (draftRadiusKm * REGION_PADDING) / KM_PER_LAT_DEGREE;
    return {
      latitude: draftPoint.latitude,
      longitude: draftPoint.longitude,
      latitudeDelta,
      longitudeDelta: latitudeDelta,
    };
  }, [draftPoint, draftRadiusKm]);

  const runSearch = async () => {
    const trimmed = query.trim();
    if (!trimmed || searchState === "loading") {
      return;
    }
    setSearchState("loading");
    try {
      const found = await searchPlaces(trimmed);
      setResults(found);
      setSearchState("done");
    } catch {
      setResults([]);
      setSearchState("error");
    }
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setSearchState("idle");
  };

  const selectResult = (result: PlaceSearchResult) => {
    Keyboard.dismiss();
    setDraftPoint({ latitude: result.latitude, longitude: result.longitude });
    setQuery(result.title);
    setResults([]);
    setSearchState("idle");
  };

  const handleConfirm = () => {
    if (
      draftPoint &&
      (draftPoint.latitude !== latitude || draftPoint.longitude !== longitude)
    ) {
      setSearchPoint(draftPoint.latitude, draftPoint.longitude);
    }
    setRadiusKm(draftRadiusKm);
    navigation.goBack();
  };

  if (!hasCoordinates || region == null || draftPoint == null) {
    return null;
  }

  const showResults = searchState !== "idle";

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
          onPress={Keyboard.dismiss}
        >
          <Circle
            center={draftPoint}
            radius={draftRadiusKm * METERS_PER_KM}
            strokeWidth={2}
            strokeColor={colors.primary}
            fillColor={`${colors.primary}33`}
          />
        </MapView>

        <View className="absolute inset-x-4 top-4 gap-2">
          <View className="h-[52px] flex-row items-center gap-3 rounded-2xl border border-border bg-white px-4 shadow-sm">
            <AppIcon name="search" size={18} color={colors.textMuted} />
            <TextInput
              value={query}
              onChangeText={(value) => {
                setQuery(value);
                if (!value.trim()) {
                  clearSearch();
                }
              }}
              onSubmitEditing={() => {
                void runSearch();
              }}
              placeholder={t("location-search-placeholder")}
              placeholderTextColor={colors.textMuted}
              returnKeyType="search"
              autoCorrect={false}
              accessibilityLabel={t("location-search-placeholder")}
              className="flex-1 text-text"
              style={{
                fontFamily: fontFamily.regular,
                fontSize: 14,
                textAlign,
                writingDirection,
              }}
            />
            {searchState === "loading" ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : query ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("location-search-clear")}
                onPress={clearSearch}
                hitSlop={8}
              >
                <AppIcon name="close" size={18} color={colors.textMuted} />
              </Pressable>
            ) : null}
          </View>

          {showResults && searchState !== "loading" ? (
            <View className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
              {searchState === "error" ? (
                <AppText variant="caption" className="px-4 py-3 text-danger">
                  {t("location-search-error")}
                </AppText>
              ) : results.length === 0 ? (
                <AppText variant="caption" muted className="px-4 py-3 text-start">
                  {t("location-search-empty")}
                </AppText>
              ) : (
                results.map((result, index) => (
                  <Pressable
                    key={result.id}
                    accessibilityRole="button"
                    onPress={() => selectResult(result)}
                    className={`flex-row items-center gap-3 px-4 py-3 active:bg-primaryMuted ${
                      index > 0 ? "border-t border-border" : ""
                    }`}
                  >
                    <AppIcon name="map-pin" size={18} color={colors.primary} />
                    <View className="flex-1">
                      <AppText variant="body" className="text-start text-text" numberOfLines={1}>
                        {result.title}
                      </AppText>
                      {result.subtitle ? (
                        <AppText
                          variant="caption"
                          muted
                          className="text-start"
                          numberOfLines={1}
                        >
                          {result.subtitle}
                        </AppText>
                      ) : null}
                    </View>
                  </Pressable>
                ))
              )}
            </View>
          ) : null}
        </View>
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
