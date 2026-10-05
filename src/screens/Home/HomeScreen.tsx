import React, { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { VehicleListRow } from "../../components/cards/VehicleListRow";
import { HorizontalCategoryChips } from "../../components/common/CategoryChips";
import { SearchBar } from "../../components/common/SearchBar";
import { SectionHeader } from "../../components/common/SectionHeader";
import { CityPickerSheet, SelectCityCard } from "../../components/location/CityPickerSheet";
import { SelectSheet } from "../../components/sheets/SelectSheet";
import { AppText } from "../../components/typography/AppText";
import type { VehicleCategory } from "../../types";
import type { MainTabNavigationProp } from "../../navigation/types";
import { BrandBanner } from "./components/BrandBanner";
import { EnableLocationCard } from "./components/EnableLocationCard";
import { HomeHeader } from "./components/HomeHeader";
import { Screen } from "../../components/common/Screen";
import { useFilteredVehicles } from "../../hooks/useFilteredVehicles";
import { useLocationStore } from "../../stores/location-store";
import type { CityKey } from "../../constants/search-cities";
import { colors } from "../../theme/colors";

const CATEGORY_KEYS: VehicleCategory[] = [
  "luxury",
  "electric",
  "sport",
  "sedan",
  "suv",
];

export function HomeScreen() {
  const { t } = useTranslation(["home", "common"]);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<MainTabNavigationProp<"Home">>();
  const [selectedCategory, setSelectedCategory] = useState<
    VehicleCategory | "all"
  >("all");
  const [citySheetOpen, setCitySheetOpen] = useState(false);
  const [locationMenuOpen, setLocationMenuOpen] = useState(false);
  const locationStatus = useLocationStore((state) => state.status);
  const locationHydrated = useLocationStore((state) => state.hydrated);
  const latitude = useLocationStore((state) => state.latitude);
  const longitude = useLocationStore((state) => state.longitude);
  const cityKey = useLocationStore((state) => state.cityKey);
  const selectCity = useLocationStore((state) => state.selectCity);
  const enableLocation = useLocationStore((state) => state.enableLocation);
  const { vehicles, isLoading, isError, isEmpty, refetch } =
    useFilteredVehicles();

  const hasSearchPoint = latitude != null && longitude != null;
  const showLocationPrompt = locationHydrated && locationStatus === "idle";
  const needsCity =
    locationHydrated &&
    (locationStatus === "skipped" || locationStatus === "denied") &&
    !hasSearchPoint;

  const categories = useMemo(
    () => [
      { key: "all", label: t("categories-all") },
      ...CATEGORY_KEYS.map((key) => ({
        key,
        label: t(`categories.${key}`),
      })),
    ],
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

  const visibleVehicles = useMemo(() => {
    if (selectedCategory === "all") {
      return vehicles;
    }
    return vehicles.filter((vehicle) => vehicle.category === selectedCategory);
  }, [selectedCategory, vehicles]);

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
      <View className="gap-5 pb-2">
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
          onSelect={(key) =>
            setSelectedCategory(key as VehicleCategory | "all")
          }
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
        ) : isEmpty || visibleVehicles.length === 0 ? (
          <View className="items-center rounded-2xl border border-border bg-white px-4 py-8">
            <AppText variant="body" muted className="text-center">
              {t("fleet-empty")}
            </AppText>
          </View>
        ) : (
          <View className="gap-3">
            {visibleVehicles.map((vehicle) => (
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
