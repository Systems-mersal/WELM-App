import React from "react";
import { Image, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Badge } from "../../../components/common/Badge";
import { AppText } from "../../../components/typography/AppText";
import { getVehicleById } from "../../../constants/vehicles";
import type { Booking } from "../../../types";
import { useVehicleLabel } from "../../../components/common/CategoryChips";

export interface ActiveBookingCardProps {
  booking: Booking;
}

export function ActiveBookingCard({ booking }: ActiveBookingCardProps) {
  const { t } = useTranslation("bookings");
  const vehicle = getVehicleById(booking.vehicleId);
  if (!vehicle) return null;
  const { name } = useVehicleLabel(vehicle);

  return (
    <View className="mt-5 overflow-hidden rounded-[20px] bg-white">
      <View className="relative">
        <Image
          source={booking.imageSource ?? vehicle?.imageSource}
          className="h-[160px] w-full"
          resizeMode="cover"
        />
        <View className="absolute start-4 top-4">
          <Badge label={t("active-now")} variant="success" />
        </View>
      </View>

      <View className="gap-3 p-4">
        <AppText variant="subtitle">{name}</AppText>
        <AppText variant="caption" muted>
          {t("date-range", {
            start: t("dates.active-start"),
            end: t("dates.active-end"),
          })}
        </AppText>
        <View className="h-2 overflow-hidden rounded-full bg-border">
          <View
            className="h-full rounded-full bg-primary"
            style={{ width: `${(booking.progress ?? 0) * 100}%` }}
          />
        </View>
      </View>
    </View>
  );
}
