import React, { useMemo, useState } from "react";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FeaturedVehicleCard } from "../../components/cards/FeaturedVehicleCard";
import { HorizontalCategoryChips } from "../../components/common/CategoryChips";
import { SearchBar } from "../../components/common/SearchBar";
import { SectionHeader } from "../../components/common/SectionHeader";
import { CityPickerSheet, SelectCityCard } from "../../components/location/CityPickerSheet";
import { CoverageEmptyState } from "../../components/location/CoverageEmptyState";
import { SelectSheet } from "../../components/sheets/SelectSheet";
import type { VehicleCategory } from "../../types";
import type { MainTabNavigationProp } from "../../navigation/types";
import { ActiveBookingAlert } from "./components/ActiveBookingAlert";
import { BrandBanner } from "./components/BrandBanner";
import { EnableLocationCard } from "./components/EnableLocationCard";
import { HomeHeader } from "./components/HomeHeader";
import { Screen } from "../../components/common/Screen";
import { useFilteredVehicles } from "../../hooks/useFilteredVehicles";
import { findNearestCityKey } from "../../lib/vehicle-radius";
import { useLocationStore } from "../../stores/location-store";
import type { CityKey } from "../../constants/search-cities";

const CATEGORY_KEYS: VehicleCategory[] = ["luxury", "electric", "sport", "sedan", "suv"];

export function HomeScreen() {
  const { t } = useTranslation("home");
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<MainTabNavigationProp<"Home">>();
  const [selectedCategory, setSelectedCategory] = useState<VehicleCategory>("luxury");
  const [citySheetOpen, setCitySheetOpen] = useState(false);
  const [locationMenuOpen, setLocationMenuOpen] = useState(false);
  const locationStatus = useLocationStore((state) => state.status);
  const locationHydrated = useLocationStore((state) => state.hydrated);
  const latitude = useLocationStore((state) => state.latitude);
  const longitude = useLocationStore((state) => state.longitude);
  const cityKey = useLocationStore((state) => state.cityKey);
  const selectCity = useLocationStore((state) => state.selectCity);
  const enableLocation = useLocationStore((state) => state.enableLocation);
  const filteredVehicles = useFilteredVehicles();

  const hasSearchPoint = latitude != null && longitude != null;
  const showLocationPrompt = locationHydrated && locationStatus === "idle";
  const needsCity =
    locationHydrated &&
    (locationStatus === "skipped" || locationStatus === "denied") &&
    !hasSearchPoint;

  const categories = useMemo(
    () =>
      CATEGORY_KEYS.map((key) => ({
        key,
        label: t(`categories.${key}`),
      })),
    [t],
  );

  const locationMenuOptions = useMemo(
    () => [
      { value: "city", label: t("select-city") },
      { value: "gps", label: t("use-current-location") },
      { value: "radius", label: t("change-radius") },
    ],
    [t],
  );

  const featuredVehicle =
    filteredVehicles.find((vehicle) => vehicle.featured) ??
    filteredVehicles[0];

  const nearestCityKey =
    latitude != null && longitude != null
      ? findNearestCityKey(latitude, longitude)
      : cityKey ?? "riyadh";

  const openVehicleDetails = (vehicleId: string) => {
    navigation.navigate("VehicleDetails", { vehicleId });
  };

  const applyCity = (key: CityKey) => {
    selectCity(key);
    setCitySheetOpen(false);
    navigation.navigate("LocationRadius");
  };

  const handleLocationMenu = async (value: string) => {
    setLocationMenuOpen(false);
    if (value === "city") {
      setCitySheetOpen(true);
      return;
    }
    if (value === "radius") {
      if (hasSearchPoint) {
        navigation.navigate("LocationRadius");
      }
      return;
    }
    const result = await enableLocation();
    if (result === "granted") {
      navigation.navigate("LocationRadius");
      return;
    }
    setCitySheetOpen(true);
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
      <View className="gap-6 pb-2">
        <HomeHeader
          onNotificationsPress={() => navigation.navigate("Notifications")}
          onLocationPress={() => setLocationMenuOpen(true)}
        />
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
        <HorizontalCategoryChips
          categories={categories}
          selectedKey={selectedCategory}
          onSelect={(key) => setSelectedCategory(key as VehicleCategory)}
        />
        <SectionHeader
          title={t("featured")}
          actionLabel={t("view-all")}
          onActionPress={() => navigation.navigate("Explore")}
        />
        {hasSearchPoint && filteredVehicles.length === 0 ? (
          <CoverageEmptyState
            nearestCityKey={nearestCityKey}
            onChangeLocation={() => setCitySheetOpen(true)}
            onSearchNearestCity={() => applyCity(nearestCityKey)}
          />
        ) : featuredVehicle ? (
          <FeaturedVehicleCard
            vehicle={featuredVehicle}
            onPress={openVehicleDetails}
            onBookPress={openVehicleDetails}
          />
        ) : null}
        <ActiveBookingAlert onPress={() => navigation.navigate("Bookings")} />
      </View>
      <CityPickerSheet
        visible={citySheetOpen}
        selected={cityKey}
        onSelect={applyCity}
        onClose={() => setCitySheetOpen(false)}
      />
      <SelectSheet
        visible={locationMenuOpen}
        title={t("change-location")}
        options={locationMenuOptions}
        onSelect={(value) => {
          void handleLocationMenu(value);
        }}
        onClose={() => setLocationMenuOpen(false)}
        closeLabel={t("sheet-close")}
      />
    </Screen>
  );
}
