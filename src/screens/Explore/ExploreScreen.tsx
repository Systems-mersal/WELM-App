import React, { useMemo, useState } from "react";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { VehicleCard } from "../../components/cards/VehicleCard";
import { HorizontalCategoryChips } from "../../components/common/CategoryChips";
import { SearchBar } from "../../components/common/SearchBar";
import { AppText } from "../../components/typography/AppText";
import { EXPLORE_VEHICLES } from "../../constants/vehicles";
import type { MainTabNavigationProp } from "../../navigation/types";
import { Screen } from "../../components/common/Screen";
import { alertComingSoon } from "../../utils/comingSoon";

type ExploreFilter = "rating" | "location" | "price" | "type" | "all";

const FILTER_KEYS: ExploreFilter[] = ["rating", "location", "price", "type", "all"];

export function ExploreScreen() {
  const { t } = useTranslation("explore");
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<MainTabNavigationProp<"Explore">>();
  const [selectedFilter, setSelectedFilter] = useState<ExploreFilter>("all");

  const filters = useMemo(
    () =>
      FILTER_KEYS.map((key) => ({
        key,
        label: t(`filters.${key}`),
      })),
    [t],
  );

  const rows = useMemo(() => {
    const items = [...EXPLORE_VEHICLES];
    const result: (typeof items)[number][][] = [];
    for (let i = 0; i < items.length; i += 2) {
      result.push(items.slice(i, i + 2));
    }
    return result;
  }, []);

  return (
    <View className="flex-1 bg-backgroundWarm">
      <View
        className="bg-primaryDark px-6 pb-5 pt-2"
        style={{ paddingTop: insets.top + 8 }}
      >
        <SearchBar
          variant="explore"
          placeholder={t("search-placeholder")}
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

      <Screen
        scrollable
        edges={[]}
        className="bg-backgroundWarm"
        contentClassName="pt-5"
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        <View className="mb-4 flex-row items-center justify-between">
          <AppText variant="subtitle">{t("search-results")}</AppText>
          <AppText variant="caption" muted>
            {t("cars-available", { count: EXPLORE_VEHICLES.length })}
          </AppText>
        </View>

        <View className="gap-4">
          {rows.map((row, rowIndex) => (
            <View key={`row-${rowIndex}`} className="flex-row gap-4">
              {row.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  favorited={vehicle.favorite}
                  onFavoritePress={() => alertComingSoon()}
                  onPress={(vehicleId) =>
                    navigation.navigate("VehicleDetails", { vehicleId })
                  }
                />
              ))}
              {row.length === 1 ? <View className="flex-1" /> : null}
            </View>
          ))}
        </View>
      </Screen>
    </View>
  );
}
