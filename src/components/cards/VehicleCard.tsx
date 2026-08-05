import React, { memo } from "react";
import { Image, Pressable, View } from "react-native";
import { useTranslation } from "react-i18next";
import type { Vehicle } from "../../types";
import { colors } from "../../theme/colors";
import { AppIcon } from "../icons/AppIcon";
import { AppText } from "../typography/AppText";
import { useVehicleLabel, VehiclePriceRow } from "../common/CategoryChips";

export interface VehicleCardProps {
  vehicle: Vehicle;
  onPress: (vehicleId: string) => void;
  favorited?: boolean;
  onFavoritePress?: (vehicleId: string) => void;
  className?: string;
}

export const VehicleCard = memo(function VehicleCard({
  vehicle,
  onPress,
  favorited = false,
  onFavoritePress,
  className = "",
}: VehicleCardProps) {
  const { t } = useTranslation(["explore", "common"]);
  const { name, location } = useVehicleLabel(vehicle);

  return (
    <View
      className={`flex-1 overflow-hidden rounded-2xl border border-border bg-white p-3 ${className}`}
    >
      <View className="relative mb-3 overflow-hidden rounded-xl">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={name}
          onPress={() => onPress(vehicle.id)}
        >
          <Image
            source={vehicle.imageSource}
            style={{ width: "100%", height: 110 }}
            resizeMode="cover"
          />
        </Pressable>
        {onFavoritePress ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("common:a11y.favorite")}
            onPress={() => onFavoritePress(vehicle.id)}
            className="absolute end-2 top-2 h-8 w-8 items-center justify-center rounded-full bg-white/90"
            hitSlop={8}
          >
            <AppIcon
              name="heart"
              size={16}
              color={favorited ? colors.danger : colors.textMuted}
            />
          </Pressable>
        ) : null}
        {vehicle.instantBook ? (
          <View className="absolute start-2 top-2 rounded-full bg-peach px-2 py-1">
            <AppText variant="caption" className="text-primaryDeep">
              {t("instant-book")}
            </AppText>
          </View>
        ) : null}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={name}
        onPress={() => onPress(vehicle.id)}
      >
        <AppText variant="label" numberOfLines={1} className="mb-2">
          {name}
        </AppText>
        <VehiclePriceRow
          price={vehicle.pricePerDay}
          rating={vehicle.rating}
          location={location}
        />
      </Pressable>
    </View>
  );
});
