import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { VehicleCard } from "../../components/cards/VehicleCard";
import { HorizontalCategoryChips } from "../../components/common/CategoryChips";
import { SearchBar } from "../../components/common/SearchBar";
import { CityPickerSheet } from "../../components/location/CityPickerSheet";
import { AppIcon } from "../../components/icons/AppIcon";
import { AppText } from "../../components/typography/AppText";
import { Screen } from "../../components/common/Screen";
import { useVehicleLabel } from "../../components/common/CategoryChips";
import { useFilteredVehicles } from "../../hooks/useFilteredVehicles";
import type { MainTabNavigationProp } from "../../navigation/types";
import { useLocationStore } from "../../stores/location-store";
import { colors } from "../../theme/colors";
import { alertComingSoon } from "../../utils/comingSoon";
import type { Vehicle } from "../../types";

type ExploreFilter = "rating" | "location" | "price" | "type" | "all";
type ExploreView = "list" | "map";

const FILTER_KEYS: ExploreFilter[] = ["rating", "location", "price", "type", "all"];

function toRows(items: Vehicle[]): Vehicle[][] {
  const result: Vehicle[][] = [];
  for (let i = 0; i < items.length; i += 2) {
    result.push(items.slice(i, i + 2));
  }
  return result;
}

function MapVehicleMarker({
  vehicle,
  onPress,
}: {
  vehicle: Vehicle;
  onPress: (id: string) => void;
}) {
  const { name } = useVehicleLabel(vehicle);
  if (vehicle.latitude == null || vehicle.longitude == null) {
    return null;
  }
  return (
    <Marker
      coordinate={{
        latitude: vehicle.latitude,
        longitude: vehicle.longitude,
      }}
      title={name}
      onPress={() => onPress(vehicle.id)}
    />
  );
}

export function ExploreScreen() {
  const { t } = useTranslation(["explore", "home", "common"]);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<MainTabNavigationProp<"Explore">>();
  const [selectedFilter, setSelectedFilter] = useState<ExploreFilter>("all");
  const [viewMode, setViewMode] = useState<ExploreView>("list");
  const [citySheetOpen, setCitySheetOpen] = useState(false);
  const { vehicles, isLoading, isError, isEmpty, refetch } =
    useFilteredVehicles();
  const latitude = useLocationStore((state) => state.latitude);
  const longitude = useLocationStore((state) => state.longitude);
  const selectCity = useLocationStore((state) => state.selectCity);
  const cityKey = useLocationStore((state) => state.cityKey);

  const filters = useMemo(
    () =>
      FILTER_KEYS.map((key) => ({
        key,
        label: t(`explore:filters.${key}`),
      })),
    [t],
  );

  const viewModes = useMemo(
    () => [
      { key: "list", label: t("explore:view-list") },
      { key: "map", label: t("explore:view-map") },
    ],
    [t],
  );

  const sortedVehicles = useMemo(() => {
    const list = [...vehicles];
    if (selectedFilter === "price") {
      list.sort((a, b) => a.pricePerDay - b.pricePerDay);
    } else if (selectedFilter === "rating") {
      list.sort((a, b) => b.rating - a.rating);
    }
    return list;
  }, [selectedFilter, vehicles]);

  const rows = useMemo(() => toRows(sortedVehicles), [sortedVehicles]);
  const mappableVehicles = useMemo(
    () =>
      sortedVehicles.filter(
        (vehicle) => vehicle.latitude != null && vehicle.longitude != null,
      ),
    [sortedVehicles],
  );

  const mapRegion =
    latitude != null && longitude != null
      ? {
          latitude,
          longitude,
          latitudeDelta: 0.35,
          longitudeDelta: 0.35,
        }
      : mappableVehicles[0]
        ? {
            latitude: mappableVehicles[0].latitude!,
            longitude: mappableVehicles[0].longitude!,
            latitudeDelta: 0.35,
            longitudeDelta: 0.35,
          }
        : {
            latitude: 24.7136,
            longitude: 46.6753,
            latitudeDelta: 0.5,
            longitudeDelta: 0.5,
          };

  const openVehicle = (vehicleId: string) => {
    navigation.navigate("VehicleDetails", { vehicleId });
  };

  const listBody = (() => {
    if (isLoading) {
      return (
        <View className="items-center py-16">
          <ActivityIndicator color={colors.primary} />
        </View>
      );
    }
    if (isError) {
      return (
        <View className="items-center gap-3 rounded-2xl border border-border bg-white px-4 py-8">
          <AppText variant="body" muted className="text-center">
            {t("common:error")}
          </AppText>
          <Pressable
            accessibilityRole="button"
            onPress={refetch}
            className="rounded-pill bg-primary px-5 py-2 active:opacity-80"
          >
            <AppText variant="caption" className="text-white">
              {t("common:retry")}
            </AppText>
          </Pressable>
        </View>
      );
    }
    if (isEmpty) {
      return (
        <View className="items-center rounded-2xl border border-border bg-white px-4 py-10">
          <AppText variant="body" muted className="text-center">
            {t("home:fleet-empty")}
          </AppText>
        </View>
      );
    }
    return (
      <View className="gap-4">
        {rows.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} className="flex-row gap-4">
            {row.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                favorited={vehicle.favorite}
                onFavoritePress={() => alertComingSoon()}
                onPress={openVehicle}
              />
            ))}
            {row.length === 1 ? <View className="flex-1" /> : null}
          </View>
        ))}
      </View>
    );
  })();

  return (
    <View className="flex-1 bg-backgroundWarm">
      <View
        className="bg-primaryDark px-6 pb-5 pt-2"
        style={{ paddingTop: insets.top + 8 }}
      >
        <SearchBar
          variant="explore"
          placeholder={t("explore:search-placeholder")}
          onFilterPress={alertComingSoon}
          className="mb-4 border-white/20"
        />
        <HorizontalCategoryChips
          categories={filters}
          selectedKey={selectedFilter}
          onSelect={(key) => setSelectedFilter(key as ExploreFilter)}
          variant="onDark"
        />
      </View>

      <View className="flex-row items-center justify-between px-6 pt-4">
        <AppText variant="subtitle">{t("explore:search-results")}</AppText>
        <View className="flex-row gap-2">
          {viewModes.map((mode) => {
            const selected = mode.key === viewMode;
            return (
              <Pressable
                key={mode.key}
                accessibilityRole="button"
                accessibilityLabel={mode.label}
                onPress={() => setViewMode(mode.key as ExploreView)}
                className={`h-9 flex-row items-center gap-1 rounded-full px-3 ${
                  selected ? "bg-primary" : "border border-border bg-white"
                }`}
              >
                <AppIcon
                  name={mode.key === "list" ? "list" : "map"}
                  size={14}
                  color={selected ? colors.white : colors.text}
                />
                <AppText
                  variant="caption"
                  className={selected ? "text-white" : "text-text"}
                >
                  {mode.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>

      {viewMode === "map" ? (
        <View className="mt-3 flex-1 px-6 pb-6">
          {isLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : isEmpty || mappableVehicles.length === 0 ? (
            <View className="flex-1 items-center justify-center rounded-2xl border border-border bg-white px-4">
              <AppText variant="body" muted className="text-center">
                {isEmpty ? t("home:fleet-empty") : t("home:empty-subtitle")}
              </AppText>
            </View>
          ) : (
            <MapView style={styles.map} region={mapRegion}>
              {mappableVehicles.map((vehicle) => (
                <MapVehicleMarker
                  key={vehicle.id}
                  vehicle={vehicle}
                  onPress={openVehicle}
                />
              ))}
            </MapView>
          )}
        </View>
      ) : (
        <Screen
          scrollable
          edges={[]}
          className="bg-backgroundWarm"
          contentClassName="pt-3"
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        >
          <AppText variant="caption" muted className="mb-4">
            {t("explore:cars-available", {
              count: isLoading ? 0 : sortedVehicles.length,
            })}
          </AppText>
          {listBody}
        </Screen>
      )}
      <CityPickerSheet
        visible={citySheetOpen}
        selected={cityKey}
        onSelect={(key) => {
          selectCity(key);
          setCitySheetOpen(false);
          navigation.navigate("LocationRadius");
        }}
        onClose={() => setCitySheetOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
});
