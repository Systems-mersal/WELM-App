import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { VehicleListRow } from "../../components/cards/VehicleListRow";
import { SearchBar } from "../../components/common/SearchBar";
import { SectionHeader } from "../../components/common/SectionHeader";
import { CityPickerSheet, SelectCityCard } from "../../components/location/CityPickerSheet";
import { AppText } from "../../components/typography/AppText";
import type { MainTabNavigationProp } from "../../navigation/types";
import { BrandBanner } from "./components/BrandBanner";
import { EnableLocationCard } from "./components/EnableLocationCard";
import { HomeHeader } from "./components/HomeHeader";
import { NearbyMap } from "./components/NearbyMap";
import { Screen } from "../../components/common/Screen";
import { useFilteredVehicles } from "../../hooks/useFilteredVehicles";
import { useLocationStore } from "../../stores/location-store";
import type { CityKey } from "../../constants/search-cities";
import { colors } from "../../theme/colors";

export function HomeScreen() {
  const { t } = useTranslation(["home", "common"]);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<MainTabNavigationProp<"Home">>();
  const [citySheetOpen, setCitySheetOpen] = useState(false);
  const locationStatus = useLocationStore((state) => state.status);
  const locationHydrated = useLocationStore((state) => state.hydrated);
  const locationRequesting = useLocationStore((state) => state.requesting);
  const latitude = useLocationStore((state) => state.latitude);
  const longitude = useLocationStore((state) => state.longitude);
  const radiusKm = useLocationStore((state) => state.radiusKm);
  const cityKey = useLocationStore((state) => state.cityKey);
  const selectCity = useLocationStore((state) => state.selectCity);
  const enableLocation = useLocationStore((state) => state.enableLocation);
  const autoLocated = useRef(false);
  const { vehicles, isLoading, isError, isEmpty, refetch } =
    useFilteredVehicles();

  const hasSearchPoint = latitude != null && longitude != null;
  const showLocationPrompt =
    locationHydrated && locationStatus === "idle" && !locationRequesting;

  useEffect(() => {
    if (
      !locationHydrated ||
      autoLocated.current ||
      (locationStatus !== "idle" && locationStatus !== "granted")
    ) {
      return;
    }
    autoLocated.current = true;
    void enableLocation();
  }, [enableLocation, locationHydrated, locationStatus]);
  const needsCity =
    locationHydrated &&
    (locationStatus === "skipped" || locationStatus === "denied") &&
    !hasSearchPoint;

  const openLocationMap = () => {
    navigation.navigate("LocationRadius");
  };

  const openVehicleDetails = (vehicleId: string) => {
    navigation.navigate("VehicleDetails", { vehicleId });
  };

  const applyCity = (key: CityKey) => {
    selectCity(key);
    setCitySheetOpen(false);
    navigation.navigate("LocationRadius");
  };

  return (
    <Screen
      className="bg-background"
      edges={["top", "left", "right"]}
      contentClassName="px-6 pt-2"
      contentContainerStyle={{
        flexGrow: 1,
        paddingBottom: insets.bottom + 100,
      }}
    >
      <View className="gap-5 pb-2">
        <HomeHeader
          onNotificationsPress={() => navigation.navigate("Notifications")}
          onLocationPress={openLocationMap}
        />
        {locationRequesting && !hasSearchPoint ? (
          <View className="h-56 items-center justify-center gap-3 rounded-2xl border border-border bg-white">
            <ActivityIndicator color={colors.primary} />
            <AppText variant="caption" muted>
              {t("current-location")}
            </AppText>
          </View>
        ) : null}
        {latitude != null && longitude != null ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("change-location")}
            onPress={openLocationMap}
          >
            <View pointerEvents="none">
              <NearbyMap
                latitude={latitude}
                longitude={longitude}
                radiusKm={radiusKm}
                vehicles={vehicles}
                onVehiclePress={openVehicleDetails}
              />
            </View>
          </Pressable>
        ) : null}
        {showLocationPrompt ? (
          <EnableLocationCard onChooseCity={() => setCitySheetOpen(true)} />
        ) : null}
        {needsCity ? (
          <SelectCityCard onChooseCity={() => setCitySheetOpen(true)} />
        ) : null}
        <BrandBanner />
        <SearchBar
          placeholder={t("search-placeholder")}
          onFilterPress={() => navigation.navigate("Explore")}
        />
        <SectionHeader
          title={t("available-cars")}
          actionLabel={t("view-all")}
          onActionPress={() => navigation.navigate("Explore")}
        />
        {isLoading ? (
          <View className="items-center py-10">
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : isError ? (
          <View className="items-center gap-3 rounded-2xl border border-border bg-white px-4 py-6">
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
        ) : isEmpty ? (
          <View className="items-center rounded-2xl border border-border bg-white px-4 py-8">
            <AppText variant="body" muted className="text-center">
              {t("fleet-empty")}
            </AppText>
          </View>
        ) : (
          <View className="gap-3">
            {vehicles.map((vehicle) => (
              <VehicleListRow
                key={vehicle.id}
                vehicle={vehicle}
                onPress={openVehicleDetails}
              />
            ))}
          </View>
        )}
      </View>
      <CityPickerSheet
        visible={citySheetOpen}
        selected={cityKey}
        onSelect={applyCity}
        onClose={() => setCitySheetOpen(false)}
      />
    </Screen>
  );
}
