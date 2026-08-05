import React from "react";
import { Image, Pressable, View } from "react-native";
import { useTranslation } from "react-i18next";
import { AppText } from "../../../components/typography/AppText";
import { getVehicleById } from "../../../constants/vehicles";
import type { Booking } from "../../../types";
import { useVehicleLabel } from "../../../components/common/CategoryChips";

export interface PastBookingRowProps {
  booking: Booking;
  onRebook: (vehicleId: string) => void;
}

export function PastBookingRow({ booking, onRebook }: PastBookingRowProps) {
  const { t } = useTranslation("bookings");
  const vehicle = getVehicleById(booking.vehicleId);
  if (!vehicle) return null;
  const { name } = useVehicleLabel(vehicle);

  return (
    <View className="flex-row items-center rounded-2xl border border-border bg-white p-3">
      <Image
        source={booking.imageSource ?? vehicle?.imageSource}
        className="h-[72px] w-[72px] rounded-xl"
        resizeMode="cover"
      />
      <View className="ms-3 flex-1">
        <AppText variant="label" numberOfLines={1}>
          {name}
        </AppText>
        <AppText variant="caption" muted className="mt-1">
          {t("date-range", {
            start: t("dates.past1-start"),
            end: t("dates.past1-end"),
          })}
        </AppText>
      </View>
      <Pressable
        onPress={() => onRebook(booking.vehicleId)}
        className="rounded-full border border-primary px-4 py-2"
      >
        <AppText variant="caption" className="text-primary">
          {t("rebook")}
        </AppText>
      </Pressable>
    </View>
  );
}
