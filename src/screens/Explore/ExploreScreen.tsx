import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { VehicleCard } from "../../components/cards/VehicleCard";
import { HorizontalCategoryChips } from "../../components/common/CategoryChips";
import { SearchBar } from "../../components/common/SearchBar";
import { CityPickerSheet, SelectCityCard } from "../../components/location/CityPickerSheet";
import { CoverageEmptyState } from "../../components/location/CoverageEmptyState";
import { AppIcon } from "../../components/icons/AppIcon";
import { AppText } from "../../components/typography/AppText";
import { Screen } from "../../components/common/Screen";
import { useFilteredVehicles } from "../../hooks/useFilteredVehicles";
import { findNearestCityKey } from "../../lib/vehicle-radius";
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

export function ExploreScreen() {
  const { t } = useTranslation(["explore", "home", "vehicles"]);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<MainTabNavigationProp<"Explore">>();
  const [selectedFilter, setSelectedFilter] = useState<ExploreFilter>("all");
  const [viewMode, setViewMode] = useState<ExploreView>("list");
  const [citySheetOpen, setCitySheetOpen] = useState(false);
  const filteredVehicles = useFilteredVehicles();
  const latitude = useLocationStore((state) => state.latitude);
  const longitude = useLocationStore((state) => state.longitude);
  const selectCity = useLocationStore((state) => state.selectCity);
  const cityKey = useLocationStore((state) => state.cityKey);
  const hasSearchPoint = latitude != null && longitude != null;

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

  const rows = useMemo(() => toRows(filteredVehicles), [filteredVehicles]);
  const nearestCityKey =
    latitude != null && longitude != null
      ? findNearestCityKey(latitude, longitude)
      : cityKey ?? "riyadh";

  const mapRegion =
    latitude != null && longitude != null
      ? {
          latitude,
          longitude,
          latitudeDelta: 0.35,
          longitudeDelta: 0.35,
        }
      : null;

  const openVehicle = (vehicleId: string) => {
    navigation.navigate("VehicleDetails", { vehicleId });
  };

  const handleSearchNearest = () => {
    selectCity(nearestCityKey);
    navigation.navigate("LocationRadius");
  };

  const handleChangeLocation = () => {
    setCitySheetOpen(true);
  };

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

      {viewMode === "map" && mapRegion ? (
        <View className="mt-3 flex-1 px-6 pb-6">
          {filteredVehicles.length === 0 ? (
            <CoverageEmptyState
              nearestCityKey={nearestCityKey}
              onChangeLocation={handleChangeLocation}
              onSearchNearestCity={handleSearchNearest}
            />
          ) : (
            <MapView style={styles.map} region={mapRegion}>
              {filteredVehicles.map((vehicle) =>
                vehicle.latitude != null && vehicle.longitude != null ? (
                  <Marker
                    key={vehicle.id}
                    coordinate={{
                      latitude: vehicle.latitude,
                      longitude: vehicle.longitude,
                    }}
                    title={t(`vehicles:${vehicle.nameKey}`)}
                    onPress={() => openVehicle(vehicle.id)}
                  />
                ) : null,
              )}
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
            {t("explore:cars-available", { count: filteredVehicles.length })}
          </AppText>
          {!hasSearchPoint ? (
            <SelectCityCard onChooseCity={handleChangeLocation} />
          ) : filteredVehicles.length === 0 ? (
            <CoverageEmptyState
              nearestCityKey={nearestCityKey}
              onChangeLocation={handleChangeLocation}
              onSearchNearestCity={handleSearchNearest}
            />
          ) : (
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
          )}
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
