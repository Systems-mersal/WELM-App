import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, View, useWindowDimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { VehicleListRow } from "../../components/cards/VehicleListRow";
import { SearchBar } from "../../components/common/SearchBar";
import { SectionHeader } from "../../components/common/SectionHeader";
import { CityPickerSheet, SelectCityCard } from "../../components/location/CityPickerSheet";
import { AppText } from "../../components/typography/AppText";
import type { MainTabNavigationProp } from "../../navigation/types";
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
  const setSearchPoint = useLocationStore((state) => state.setSearchPoint);
  const autoLocated = useRef(false);
  const [focusNonce, setFocusNonce] = useState(0);
  const [mapGesture, setMapGesture] = useState(false);
  const { height: windowHeight } = useWindowDimensions();
  const mapHeight = Math.round(windowHeight * 0.3);
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

  const resetLocation = () => {
    void enableLocation().then((result) => {
      if (result === "granted") {
        setFocusNonce((value) => value + 1);
      }
    });
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
      scrollEnabled={!mapGesture}
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
        />
        {locationRequesting && !hasSearchPoint ? (
          <View
            style={{ height: mapHeight }}
            className="items-center justify-center gap-3 rounded-2xl border border-border bg-white"
          >
            <ActivityIndicator color={colors.primary} />
            <AppText variant="caption" muted>
              {t("current-location")}
            </AppText>
          </View>
        ) : null}
        {latitude != null && longitude != null ? (
          <NearbyMap
            latitude={latitude}
            longitude={longitude}
            radiusKm={radiusKm}
            height={mapHeight}
            vehicles={vehicles}
            focusNonce={focusNonce}
            onCommit={setSearchPoint}
            onReset={resetLocation}
            onExpand={openLocationMap}
            onGestureStart={() => setMapGesture(true)}
            onGestureEnd={() => setMapGesture(false)}
            onVehiclePress={openVehicleDetails}
          />
        ) : null}
        {showLocationPrompt ? (
          <EnableLocationCard onChooseCity={() => setCitySheetOpen(true)} />
        ) : null}
        {needsCity ? (
          <SelectCityCard onChooseCity={() => setCitySheetOpen(true)} />
        ) : null}
        <SearchBar placeholder={t("search-placeholder")} />
        <SectionHeader title={t("available-cars")} />
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
