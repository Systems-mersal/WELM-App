import React from "react";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "../../components/typography/AppText";
import { FAVORITE_VEHICLES } from "../../constants/vehicles";
import type { MainTabNavigationProp } from "../../navigation/types";
import { Screen } from "../../components/common/Screen";
import {
  FavoriteVehicleRow,
  FavoritesHeaderActions,
} from "./components/FavoriteVehicleRow";

export function FavoritesScreen() {
  const { t } = useTranslation("favorites");
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<MainTabNavigationProp<"Favorites">>();

  return (
    <View className="flex-1 bg-background">
      <View
        className="flex-row items-center justify-between bg-primaryDark px-6 pb-5"
        style={{ paddingTop: insets.top + 8 }}
      >
        <AppText variant="title" className="text-white">
          {t("title")}
        </AppText>
        <FavoritesHeaderActions />
      </View>

      <Screen
        scrollable
        edges={[]}
        className="bg-background"
        contentClassName="px-6 pt-5"
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        <AppText variant="caption" muted className="mb-4">
          {t("count", { count: FAVORITE_VEHICLES.length })}
        </AppText>

        {FAVORITE_VEHICLES.map((vehicle) => (
          <FavoriteVehicleRow
            key={vehicle.id}
            vehicle={vehicle}
            onPress={(vehicleId) =>
              navigation.navigate("VehicleDetails", { vehicleId })
            }
          />
        ))}
      </Screen>
    </View>
  );
}
