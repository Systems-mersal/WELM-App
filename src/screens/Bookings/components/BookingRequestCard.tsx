import React, { memo, useCallback, useState } from "react";
import { Alert, Pressable, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";

import { AppText } from "../../../components/typography/AppText";
import {
  bookingNeedsPayment,
  confirmWelmBookingPayment,
  quotedTotalToCents,
  WELM_BOOKINGS_QUERY_KEY,
  type WelmBookingDto,
} from "../../../features/bookings";
import { ApplePayButton } from "../../../payments/ApplePayButton";
import { PaymentService } from "../../../payments/PaymentService";
import { BookingStatusTimeline } from "./BookingStatusTimeline";

export const BookingRequestCard = memo(function BookingRequestCard({
  booking,
  onPress,
}: {
  booking: WelmBookingDto;
  onPress?: (bookingId: string) => void;
}) {
  const { t } = useTranslation(["bookings", "common", "payments"]);
  const queryClient = useQueryClient();
  const [paying, setPaying] = useState(false);
  const needsPay = bookingNeedsPayment(booking);

  const vehicleName = booking.vehicle
    ? [booking.vehicle.make, booking.vehicle.model].filter(Boolean).join(" ")
    : booking.vehicleId;

  const onPay = useCallback(async () => {
    if (paying) return;
    setPaying(true);
    try {
      const amountCents = quotedTotalToCents(booking.quotedTotal);
      const currency = (
        (booking.currency || "SAR").toLowerCase() === "usd" ? "usd" : "sar"
      ) as "sar" | "usd";
      const result = await PaymentService.payWithApplePay({
        amountCents,
        currency,
        merchantDisplayName: "WELM",
        merchantCountryCode: "SA",
        cartItems: [
          {
            label: vehicleName || t("pay-rental-label"),
            amountCents,
          },
        ],
      });

      if (result.status === "canceled") {
        return;
      }
      if (result.status !== "success") {
        Alert.alert(
          t("payments:error-title", { defaultValue: "Payment failed" }),
          result.error.message,
        );
        return;
      }

      await confirmWelmBookingPayment({
        bookingId: booking.id,
        paymentIntentId: result.paymentIntentId,
        amountCents,
        currency,
      });

      await queryClient.invalidateQueries({ queryKey: WELM_BOOKINGS_QUERY_KEY });
      Alert.alert(
        t("pay-success-title"),
        t("pay-success-message", {
          total: booking.quotedTotal,
          currency: t("common:currency"),
        }),
      );
    } catch (error) {
      Alert.alert(
        t("payments:error-title", { defaultValue: "Payment failed" }),
        error instanceof Error ? error.message : t("common:error"),
      );
    } finally {
      setPaying(false);
    }
  }, [booking, paying, queryClient, t, vehicleName]);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress?.(booking.id)}
      className="rounded-2xl border border-border bg-white p-4 active:opacity-90"
    >
      <View className="flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1">
          <AppText variant="label" numberOfLines={1}>
            {vehicleName}
          </AppText>
          <AppText variant="caption" muted className="mt-1">
            {t("date-range", {
              start: booking.startAt.slice(0, 10),
              end: booking.endAt.slice(0, 10),
            })}
          </AppText>
          <AppText variant="caption" muted className="mt-1">
            {t("days-total", {
              days: booking.quotedDays,
              total: booking.quotedTotal,
              currency: t("common:currency"),
            })}
          </AppText>
        </View>
        <View className="rounded-full bg-primaryMuted px-2.5 py-1">
          <AppText variant="caption" className="text-primaryDeep">
            {t(`status.${booking.status}`)}
          </AppText>
        </View>
      </View>
      <BookingStatusTimeline steps={booking.timeline} />
      {needsPay ? (
        <View className="mt-3 gap-2" onStartShouldSetResponder={() => true}>
          <AppText variant="caption" className="text-amber-800">
            {t("pay-awaiting-hint")}
          </AppText>
          <ApplePayButton onPress={() => void onPay()} loading={paying} />
        </View>
      ) : null}
    </Pressable>
  );
});
