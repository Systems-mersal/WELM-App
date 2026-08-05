import React, { memo } from "react";
import { Image, Pressable, View } from "react-native";
import { useTranslation } from "react-i18next";
import type { Vehicle } from "../../types";
import { colors } from "../../theme/colors";
import { fontFamily } from "../../theme/typography";
import { AppIcon } from "../icons/AppIcon";
import { AppText } from "../typography/AppText";
import { useVehicleLabel } from "../common/CategoryChips";

export interface FeaturedVehicleCardProps {
  vehicle: Vehicle;
  onPress: (vehicleId: string) => void;
  onBookPress: (vehicleId: string) => void;
  className?: string;
}

export const FeaturedVehicleCard = memo(function FeaturedVehicleCard({
  vehicle,
  onPress,
  onBookPress,
  className = "",
}: FeaturedVehicleCardProps) {
  const { t } = useTranslation(["home", "common"]);
  const { name } = useVehicleLabel(vehicle);

  return (
    <View
      className={`overflow-hidden rounded-[20px] border border-border bg-white ${className}`}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={name}
        onPress={() => onPress(vehicle.id)}
      >
        <Image
          source={vehicle.imageSource}
          style={{ width: "100%", height: 180 }}
          resizeMode="cover"
        />
      </Pressable>

      <View className="w-full gap-3 p-4">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={name}
          onPress={() => onPress(vehicle.id)}
          className="w-full flex-row items-center justify-between"
        >
          <View className="flex-row items-center gap-1">
            <AppText
              className="text-[13px] text-text"
              style={{ fontFamily: fontFamily.semibold }}
            >
              {vehicle.rating.toFixed(1)}
            </AppText>
            <AppIcon name="star" size={14} color={colors.star} />
          </View>
          <AppText
            className="text-[16px] text-text"
            style={{ fontFamily: fontFamily.bold }}
            numberOfLines={1}
          >
            {name}
          </AppText>
        </Pressable>

        <View className="w-full flex-row items-center justify-between">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("home:book-now")}
            onPress={() => onBookPress(vehicle.id)}
            className="rounded-[10px] bg-primary px-4 py-2 active:opacity-80"
          >
            <AppText
              className="text-[12px] text-white"
              style={{ fontFamily: fontFamily.bold }}
            >
              {t("home:book-now")}
            </AppText>
          </Pressable>

          <View className="flex-row items-baseline gap-1">
            <AppText
              className="text-[11px] text-textMuted"
              style={{ fontFamily: fontFamily.regular }}
            >
              {t("home:per-day")}
            </AppText>
            <AppText
              className="text-[16px] text-primary"
              style={{ fontFamily: fontFamily.bold }}
            >
              {`${vehicle.pricePerDay} ${t("common:currency")}`}
            </AppText>
          </View>
        </View>
      </View>
    </View>
  );
});
