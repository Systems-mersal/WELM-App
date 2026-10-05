import React from "react";
import { View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CommonActions } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppButton } from "../../components/buttons/AppButton";
import { useVehicleLabel } from "../../components/common/CategoryChips";
import { AppIcon } from "../../components/icons/AppIcon";
import { AppText } from "../../components/typography/AppText";
import { getVehicleById } from "../../constants/vehicles";
import { useWelmBooking } from "../../features/bookings";
import { useWelmVehicle } from "../../features/vehicles";
import type { RootStackParamList } from "../../navigation/types";
import { colors } from "../../theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "BookingConfirmed">;

export function BookingConfirmedScreen({ navigation, route }: Props) {
  const { t } = useTranslation(["booking-confirmed", "common"]);
  const insets = useSafeAreaInsets();
  const bookingId = route.params?.bookingId;
  const { data: booking } = useWelmBooking(bookingId);

  const mockVehicle = route.params?.vehicleId
    ? getVehicleById(route.params.vehicleId)
    : undefined;
  const { data: apiVehicle } = useWelmVehicle(
    mockVehicle || !route.params?.vehicleId
      ? undefined
      : route.params.vehicleId,
  );
  const vehicle = mockVehicle ?? apiVehicle;
  const { name: vehicleName } = useVehicleLabel(
    vehicle ?? {
      id: route.params?.vehicleId ?? "vehicle",
      brand: booking?.vehicle?.make ?? "",
      model: booking?.vehicle?.model ?? "",
      displayName: booking?.vehicle
        ? [booking.vehicle.make, booking.vehicle.model].filter(Boolean).join(" ")
        : undefined,
      pricePerDay: booking?.quotedDailyRate ?? 0,
      rating: 0,
      category: "luxury",
      image: "",
      imageSource: { uri: "" },
      seats: 5,
      transmission: "automatic",
      fuelType: "petrol",
    },
  );

  const goToBookings = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: "MainTabs",
            state: {
              routes: [{ name: "Bookings" }],
              index: 0,
            },
          },
        ],
      }),
    );
  };

  const goToHome = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: "MainTabs",
            state: {
              routes: [{ name: "Home" }],
              index: 0,
            },
          },
        ],
      }),
    );
  };

  const summaryRows = [
    {
      label: t("booking-id"),
      value: bookingId ?? booking?.id ?? t("booking-ref"),
    },
    { label: t("status-label"), value: t("status-pending") },
    { label: t("vehicle-label"), value: vehicleName || "—" },
    {
      label: t("period-label"),
      value: booking
        ? t("period-value", {
            days: booking.quotedDays,
            start: booking.startAt.slice(0, 10),
            end: booking.endAt.slice(0, 10),
          })
        : "—",
    },
    {
      label: t("location-label"),
      value: booking?.pickupLocation || t("location-value"),
    },
    {
      label: t("total-label"),
      value: booking
        ? `${booking.quotedTotal} ${booking.currency}`
        : "—",
    },
  ];

  return (
    <View
      className="flex-1 bg-white px-6"
      style={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }}
    >
      <View className="items-center">
        <View className="h-[100px] w-[100px] items-center justify-center rounded-full bg-primary">
          <AppIcon name="check" size={40} color={colors.white} />
        </View>
        <AppText variant="title" className="mt-5 text-center">
          {t("title")}
        </AppText>
        <AppText variant="body" muted className="mt-2 text-center">
          {t("subtitle")}
        </AppText>
      </View>

      <View className="mt-8 gap-3 rounded-[20px] border border-border bg-background px-4 py-4">
        {summaryRows.map((row) => (
          <View
            key={row.label}
            className="flex-row items-start justify-between gap-3"
          >
            <AppText variant="caption" muted className="flex-1 text-start">
              {row.label}
            </AppText>
            <AppText
              variant="caption"
              className="max-w-[55%] text-end"
              numberOfLines={2}
            >
              {row.value}
            </AppText>
          </View>
        ))}
      </View>

      <View className="mt-auto gap-3">
        <AppButton label={t("view-booking")} onPress={goToBookings} />
        <AppButton
          label={t("back-to-home")}
          variant="outline"
          onPress={goToHome}
        />
      </View>
    </View>
  );
}
