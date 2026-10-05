import React, { useMemo, useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { isAxiosError } from "axios";

import { AppButton } from "../../components/buttons/AppButton";
import { useVehicleLabel } from "../../components/common/CategoryChips";
import { AppIcon } from "../../components/icons/AppIcon";
import { AppText } from "../../components/typography/AppText";
import { getVehicleById } from "../../constants/vehicles";
import {
  createWelmBooking,
  toEndOfDayIso,
  toStartOfDayIso,
} from "../../features/bookings";
import { useWelmVehicle } from "../../features/vehicles";
import type { RootStackParamList } from "../../navigation/types";
import { useBookingDraftStore } from "../../stores/booking-draft-store";
import { colors } from "../../theme/colors";
import { BookingStepHeader } from "../shared/BookingStepHeader";
import { StickyBottomBar } from "../shared/BookingUi";

type Props = NativeStackScreenProps<RootStackParamList, "BookingReview">;

function parseDateOnly(value: string | null): Date | null {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

export function BookingReviewScreen({ navigation, route }: Props) {
  const { t } = useTranslation(["booking-review", "vehicles", "common"]);
  const insets = useSafeAreaInsets();
  const [submitting, setSubmitting] = useState(false);

  const draft = useBookingDraftStore();
  const setLastBookingId = useBookingDraftStore((s) => s.setLastBookingId);
  const resetDraft = useBookingDraftStore((s) => s.reset);

  const mockVehicle = getVehicleById(route.params.vehicleId);
  const { data: apiVehicle } = useWelmVehicle(
    mockVehicle ? undefined : route.params.vehicleId,
  );
  const vehicle = mockVehicle ?? apiVehicle;
  const { name: vehicleName } = useVehicleLabel(
    vehicle ?? {
      id: route.params.vehicleId,
      brand: "",
      model: "",
      pricePerDay: 0,
      rating: 0,
      category: "luxury",
      image: "",
      imageSource: { uri: "" },
      seats: 5,
      transmission: "automatic",
      fuelType: "petrol",
    },
  );

  const days = draft.quotedDays || 1;
  const dailyRate = draft.quotedDailyRate || vehicle?.pricePerDay || 0;
  const extrasTotal = draft.quotedExtrasTotal || 0;
  const rentalTotal = dailyRate * days;
  const tax = draft.quotedVat;
  const grandTotal = draft.quotedTotal || rentalTotal + extrasTotal + tax;

  const dateLabel = useMemo(() => {
    if (!draft.startDate || !draft.endDate) return "—";
    return t("date-range", { start: draft.startDate, end: draft.endDate });
  }, [draft.endDate, draft.startDate, t]);

  const priceRows = useMemo(
    () => [
      {
        label: t("rental-line", { days, price: dailyRate }),
        amount: rentalTotal,
      },
      ...(extrasTotal > 0
        ? [{ label: t("extras-line"), amount: extrasTotal }]
        : []),
      { label: t("tax-line"), amount: tax },
    ],
    [dailyRate, days, extrasTotal, rentalTotal, t, tax],
  );

  const handleSubmit = async () => {
    if (!draft.startDate || !draft.endDate) {
      Alert.alert(t("common:error"), t("submit-error"));
      return;
    }
    const start = parseDateOnly(draft.startDate);
    const end = parseDateOnly(draft.endDate);
    if (!start || !end) {
      Alert.alert(t("common:error"), t("submit-error"));
      return;
    }

    setSubmitting(true);
    try {
      const booking = await createWelmBooking({
        vehicleId: route.params.vehicleId,
        startAt: toStartOfDayIso(start, 10, 0),
        endAt: toEndOfDayIso(end, 16, 0),
        pickupLocation: draft.pickupLocation,
        returnLocation: draft.returnLocation,
        extras: draft.extras.map((code) => ({
          code,
          amount:
            code === "insurance"
              ? 200
              : code === "driver"
                ? 150
                : code === "child-seat"
                  ? 50
                  : code === "gps"
                    ? 30
                    : code === "airport"
                      ? 100
                      : 0,
        })),
      });
      setLastBookingId(booking.id);
      const vehicleId = route.params.vehicleId;
      resetDraft();
      navigation.navigate("BookingConfirmed", {
        vehicleId,
        bookingId: booking.id,
      });
    } catch (error) {
      const message = isAxiosError(error)
        ? String(
            (error.response?.data as { error?: string } | undefined)?.error ??
              "",
          )
        : "";
      if (message.toLowerCase().includes("profile")) {
        Alert.alert(t("common:error"), t("profile-required"), [
          {
            text: "OK",
            onPress: () => navigation.navigate("ProfileGate"),
          },
        ]);
      } else {
        Alert.alert(t("common:error"), t("submit-error"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!vehicle) {
    return (
      <View className="flex-1 items-center justify-center bg-backgroundWarm">
        <AppText>{t("common:error")}</AppText>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-backgroundWarm">
      <BookingStepHeader
        step={t("step", { current: 3, total: 4 })}
        title={t("title")}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 120,
          paddingHorizontal: 20,
        }}
      >
        <View className="mt-4 flex-row rounded-[20px] bg-white p-4">
          <View className="me-3 flex-1 items-start justify-center">
            <AppText variant="label" className="text-start">
              {vehicleName}
              {vehicle.year ? ` ${vehicle.year}` : ""}
            </AppText>
            <View className="mt-1 flex-row items-center gap-1">
              <AppIcon name="calendar" size={14} color={colors.textMuted} />
              <AppText variant="caption" muted>
                {dateLabel}
              </AppText>
            </View>
            <View className="mt-1 flex-row items-center gap-1">
              <AppIcon name="map-pin" size={12} color={colors.textMuted} />
              <AppText variant="caption" muted>
                {draft.pickupLocation || t("location-value")}
              </AppText>
            </View>
          </View>
          <View className="h-[70px] w-[100px] items-center justify-center overflow-hidden rounded-2xl bg-background">
            <Image
              source={vehicle.imageSource}
              style={{ width: 90, height: 54 }}
              resizeMode="contain"
            />
          </View>
        </View>

        <View className="mt-4 rounded-[20px] bg-white px-[18px] py-[18px]">
          <AppText variant="subtitle" className="mb-4 text-start">
            {t("price-breakdown")}
          </AppText>
          <View className="mb-4 h-px bg-border" />
          {priceRows.map((row) => (
            <View
              key={row.label}
              className="mb-4 flex-row items-center justify-between gap-3"
            >
              <AppText variant="body" muted className="flex-1 text-start">
                {row.label}
              </AppText>
              <AppText variant="label">
                {row.amount} {t("common:currency")}
              </AppText>
            </View>
          ))}
          <View className="mb-4 h-px bg-border" />
          <View className="flex-row items-center justify-between gap-3">
            <AppText variant="subtitle">{t("total")}</AppText>
            <AppText variant="title" className="text-primary">
              {grandTotal} {t("common:currency")}
            </AppText>
          </View>
        </View>

        <View className="mt-4 rounded-[20px] border border-border bg-primaryMuted/40 px-4 py-3">
          <AppText variant="caption" className="text-start text-primaryDeep">
            {t("no-payment-note")}
          </AppText>
        </View>
      </ScrollView>

      <StickyBottomBar>
        {submitting ? (
          <View className="items-center py-2">
            <ActivityIndicator color={colors.primary} />
            <AppText variant="caption" muted className="mt-2">
              {t("submitting")}
            </AppText>
          </View>
        ) : (
          <AppButton
            label={t("submit-request")}
            onPress={() => {
              void handleSubmit();
            }}
            className="h-[58px] rounded-[29px]"
          />
        )}
      </StickyBottomBar>
    </View>
  );
}
