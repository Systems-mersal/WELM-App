import React, { memo } from "react";
import { Image, Pressable, View } from "react-native";
import { useTranslation } from "react-i18next";

import type { Vehicle } from "../../types";
import { colors } from "../../theme/colors";
import { fontFamily } from "../../theme/typography";
import { AppIcon } from "../icons/AppIcon";
import { AppText } from "../typography/AppText";
import { useVehicleLabel } from "../common/CategoryChips";

export interface VehicleListRowProps {
  vehicle: Vehicle;
  onPress: (vehicleId: string) => void;
}

/**
 * List row that follows LocaleRoot `direction`:
 * image at reading start (right in Arabic), details toward the end.
 */
export const VehicleListRow = memo(function VehicleListRow({
  vehicle,
  onPress,
}: VehicleListRowProps) {
  const { t } = useTranslation(["home", "common"]);
  const { name, location } = useVehicleLabel(vehicle);

  const brandModel = [vehicle.brand, vehicle.model]
    .filter(Boolean)
    .join(" · ");
  const metaParts = [
    t(`home:categories.${vehicle.category}`),
    vehicle.year ? String(vehicle.year) : null,
  ].filter(Boolean);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={name}
      onPress={() => onPress(vehicle.id)}
      className="flex-row items-stretch overflow-hidden rounded-2xl border border-border bg-white active:opacity-90"
    >
      <Image
        source={vehicle.imageSource}
        style={{ width: 124, height: 112, margin: 8, borderRadius: 14 }}
        resizeMode="cover"
      />

      <View className="min-w-0 flex-1 justify-between gap-2 p-3 ps-1">
        <View className="gap-1">
          <AppText
            numberOfLines={1}
            className="text-[15px] text-text"
            style={{ fontFamily: fontFamily.bold }}
          >
            {name}
          </AppText>
          {brandModel ? (
            <AppText variant="caption" muted numberOfLines={1}>
              {brandModel}
            </AppText>
          ) : null}
          {metaParts.length > 0 ? (
            <AppText variant="caption" muted numberOfLines={1}>
              {metaParts.join(" · ")}
            </AppText>
          ) : null}
        </View>

        <View className="gap-1.5">
          {location ? (
            <View className="flex-row items-center gap-1">
              <AppIcon name="map-pin" size={12} color={colors.textMuted} />
              <AppText variant="caption" muted numberOfLines={1} className="flex-1">
                {location}
              </AppText>
            </View>
          ) : null}
          <View className="flex-row flex-wrap items-baseline gap-1">
            <AppText
              className="text-[16px] text-primary"
              style={{ fontFamily: fontFamily.bold }}
            >
              {vehicle.pricePerDay} {t("common:currency")}
            </AppText>
            <AppText variant="caption" muted>
              {t("home:per-day")}
            </AppText>
          </View>
        </View>
      </View>
    </Pressable>
  );
});
