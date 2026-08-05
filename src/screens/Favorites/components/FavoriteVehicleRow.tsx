import React, { memo } from "react";
import { Image, Pressable, View } from "react-native";
import { useTranslation } from "react-i18next";
import { AppIcon } from "../../../components/icons/AppIcon";
import { AppText } from "../../../components/typography/AppText";
import { useVehicleLabel, VehiclePriceRow } from "../../../components/common/CategoryChips";
import { colors } from "../../../theme/colors";
import type { Vehicle } from "../../../types";
import { alertComingSoon } from "../../../utils/comingSoon";

export interface FavoriteVehicleRowProps {
  vehicle: Vehicle;
  onPress: (vehicleId: string) => void;
}

export const FavoriteVehicleRow = memo(function FavoriteVehicleRow({
  vehicle,
  onPress,
}: FavoriteVehicleRowProps) {
  const { name, location } = useVehicleLabel(vehicle);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={name}
      onPress={() => onPress(vehicle.id)}
      className="mb-4 flex-row items-center rounded-xl border border-border bg-white p-4"
    >
      <View className="flex-1 pe-4">
        <AppText variant="subtitle" numberOfLines={2}>
          {name}
        </AppText>
        <View className="mt-2">
          <VehiclePriceRow
            price={vehicle.pricePerDay}
            rating={vehicle.rating}
            location={location}
          />
        </View>
      </View>
      <Image
        source={vehicle.imageSource}
        style={{ width: 112, height: 112, borderRadius: 16 }}
        resizeMode="cover"
      />
    </Pressable>
  );
});

export function FavoritesHeaderActions() {
  const { t } = useTranslation("common");

  return (
    <View className="flex-row items-center gap-2">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("a11y.coming-soon")}
        onPress={alertComingSoon}
        className="h-10 w-10 items-center justify-center rounded-full bg-white/15 active:opacity-70"
      >
        <AppIcon name="sliders" size={20} color={colors.white} />
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("a11y.favorite")}
        onPress={alertComingSoon}
        className="h-10 w-10 items-center justify-center rounded-full bg-white/15 active:opacity-70"
      >
        <AppIcon name="heart" size={20} color={colors.peach} />
      </Pressable>
    </View>
  );
}
