import React, { useMemo, useState } from "react";
import { Image, Pressable, ScrollView, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppButton } from "../../components/buttons/AppButton";
import { AppIcon } from "../../components/icons/AppIcon";
import { AppText } from "../../components/typography/AppText";
import { getVehicleById } from "../../constants/vehicles";
import type { RootStackParamList } from "../../navigation/types";
import { useBookingDraftStore } from "../../stores/booking-draft-store";
import { colors } from "../../theme/colors";
import { BookingStepHeader } from "../shared/BookingStepHeader";
import { StickyBottomBar } from "../shared/BookingUi";

type Props = NativeStackScreenProps<RootStackParamList, "BookingReview">;

const BOOKING_DAYS = 5;
const EXTRAS_TOTAL = 900;
const VAT_RATE = 0.15;

type PaymentMethod = "mada" | "card" | "apple";

export function BookingReviewScreen({ navigation, route }: Props) {
  const { t } = useTranslation(["booking-review", "vehicles", "common"]);
  const insets = useSafeAreaInsets();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("mada");
  const resetDraft = useBookingDraftStore((state) => state.reset);

  const vehicle = getVehicleById(route.params.vehicleId);

  const rentalTotal = (vehicle?.pricePerDay ?? 450) * BOOKING_DAYS;
  const subtotal = rentalTotal + EXTRAS_TOTAL;
  const tax = Math.round(subtotal * VAT_RATE);
  const grandTotal = subtotal + tax;

  const vehicleName = vehicle
    ? `${t(`vehicles:${vehicle.nameKey}`)}${vehicle.year ? ` ${vehicle.year}` : ""}`
    : "";

  const priceRows = useMemo(
    () => [
      {
        label: t("rental-line", {
          days: BOOKING_DAYS,
          price: vehicle?.pricePerDay ?? 450,
        }),
        amount: rentalTotal,
      },
      { label: t("extras-line"), amount: EXTRAS_TOTAL },
      { label: t("tax-line"), amount: tax },
    ],
    [rentalTotal, t, tax, vehicle?.pricePerDay],
  );

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
        contentContainerStyle={{ paddingBottom: insets.bottom + 120, paddingHorizontal: 20 }}
      >
        <View className="mt-4 flex-row rounded-[20px] bg-white p-4">
          <View className="h-[70px] w-[100px] items-center justify-center overflow-hidden rounded-2xl bg-background">
            <Image
              source={vehicle.imageSource}
              style={{ width: 90, height: 54 }}
              resizeMode="contain"
            />
          </View>
          <View className="ms-3 flex-1 items-end justify-center">
            <AppText variant="label" className="text-start">
              {vehicleName}
            </AppText>
            <View className="mt-1 flex-row items-center gap-1">
              <AppText variant="caption" muted>
                {t("date-range")}
              </AppText>
              <AppIcon name="calendar" size={14} color={colors.textMuted} />
            </View>
            <View className="mt-1 flex-row items-center gap-1">
              <AppText variant="caption" muted>
                {t("location-value")}
              </AppText>
              <AppIcon name="map-pin" size={12} color={colors.textMuted} />
            </View>
          </View>
        </View>

        <View className="mt-4 rounded-[20px] bg-white px-[18px] py-[18px]">
          <AppText variant="subtitle" className="mb-4 text-start">
            {t("price-breakdown")}
          </AppText>
          <View className="mb-4 h-px bg-border" />
          {priceRows.map((row) => (
            <View key={row.label} className="mb-4 flex-row items-center justify-between">
              <AppText variant="label">{row.amount} {t("common:currency")}</AppText>
              <AppText variant="body" muted className="flex-1 text-start">
                {row.label}
              </AppText>
            </View>
          ))}
          <View className="mb-4 h-px bg-border" />
          <View className="flex-row items-center justify-between">
            <AppText variant="title" className="text-primary">
              {grandTotal} {t("common:currency")}
            </AppText>
            <AppText variant="subtitle">{t("total")}</AppText>
          </View>
        </View>

        <View className="mt-4 flex-row items-center rounded-[20px] bg-white px-3 py-2.5">
          <Pressable className="rounded-full bg-primary px-[18px] py-2 active:opacity-80">
            <AppText variant="caption" className="text-white">
              {t("apply")}
            </AppText>
          </Pressable>
          <View className="ms-3 flex-1 flex-row items-center justify-end gap-2">
            <AppText variant="body" muted>
              {t("promo-placeholder")}
            </AppText>
          </View>
        </View>

        <View className="mt-4 rounded-[20px] bg-white px-[18px] py-[18px]">
          <AppText variant="subtitle" className="mb-4 text-start">
            {t("payment-title")}
          </AppText>
          <View className="flex-row gap-2">
            {(
              [
                { key: "mada" as const, label: t("payment-mada"), sub: t("card-mask") },
                { key: "card" as const, label: t("payment-card"), sub: "" },
                { key: "apple" as const, label: t("payment-apple"), sub: "" },
              ] as const
            ).map((method) => (
              <Pressable
                key={method.key}
                accessibilityRole="button"
                onPress={() => setPaymentMethod(method.key)}
                className={`flex-1 items-center rounded-2xl border px-2 py-3 ${
                  paymentMethod === method.key
                    ? "border-primary bg-primary/5"
                    : "border-border bg-background"
                }`}
              >
                {method.sub ? (
                  <AppText variant="caption" muted>
                    {method.sub}
                  </AppText>
                ) : null}
                <AppText variant="caption" className="mt-1">
                  {method.label}
                </AppText>
                {method.key === "apple" ? (
                  <AppIcon name="apple" size={24} color={colors.text} />
                ) : null}
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      <StickyBottomBar>
        <AppButton
          label={t("confirm-booking")}
          onPress={() => {
            resetDraft();
            navigation.navigate("BookingConfirmed", { vehicleId: vehicle.id });
          }}
          className="h-[58px] rounded-[29px]"
        />
      </StickyBottomBar>
    </View>
  );
}
