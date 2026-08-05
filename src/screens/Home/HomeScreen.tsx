import React, { useMemo, useState } from "react";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FeaturedVehicleCard } from "../../components/cards/FeaturedVehicleCard";
import { HorizontalCategoryChips } from "../../components/common/CategoryChips";
import { SearchBar } from "../../components/common/SearchBar";
import { SectionHeader } from "../../components/common/SectionHeader";
import { FEATURED_VEHICLE } from "../../constants/vehicles";
import type { VehicleCategory } from "../../types";
import type { MainTabNavigationProp } from "../../navigation/types";
import { ActiveBookingAlert } from "./components/ActiveBookingAlert";
import { BrandBanner } from "./components/BrandBanner";
import { HomeHeader } from "./components/HomeHeader";
import { Screen } from "../../components/common/Screen";

const CATEGORY_KEYS: VehicleCategory[] = ["luxury", "electric", "sport", "sedan", "suv"];

export function HomeScreen() {
  const { t } = useTranslation("home");
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<MainTabNavigationProp<"Home">>();
  const [selectedCategory, setSelectedCategory] = useState<VehicleCategory>("luxury");

  const categories = useMemo(
    () =>
      CATEGORY_KEYS.map((key) => ({
        key,
        label: t(`categories.${key}`),
      })),
    [t],
  );

  const openVehicleDetails = (vehicleId: string) => {
    navigation.navigate("VehicleDetails", { vehicleId });
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
        <HomeHeader onNotificationsPress={() => navigation.navigate("Notifications")} />
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
        <FeaturedVehicleCard
          vehicle={FEATURED_VEHICLE}
          onPress={openVehicleDetails}
          onBookPress={openVehicleDetails}
        />
        <ActiveBookingAlert onPress={() => navigation.navigate("Bookings")} />
      </View>
    </Screen>
  );
}
