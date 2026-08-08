import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppButton } from "../../components/buttons/AppButton";
import { AppIcon } from "../../components/icons/AppIcon";
import { AppText } from "../../components/typography/AppText";
import { getVehicleById } from "../../constants/vehicles";
import { useRtl } from "../../hooks/useRtl";
import type { RootStackParamList } from "../../navigation/types";
import { useBookingDraftStore } from "../../stores/booking-draft-store";
import { colors } from "../../theme/colors";
import { BookingStepHeader } from "../shared/BookingStepHeader";
import { StickyBottomBar, ToggleSwitch } from "../shared/BookingUi";

type Props = NativeStackScreenProps<RootStackParamList, "BookingDates">;

const BOOKING_YEAR = 2025;
const BOOKING_MONTH = 4;
const RANGE_START = 13;
const RANGE_END = 17;
const BOOKING_DAYS = RANGE_END - RANGE_START + 1;

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstWeekday(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export function BookingDatesScreen({ navigation, route }: Props) {
  const { t } = useTranslation(["booking-dates", "common"]);
  const insets = useSafeAreaInsets();
  const { chevronStart, chevronEnd } = useRtl();
  const [differentReturn, setDifferentReturn] = useState(false);
  const [displayMonth, setDisplayMonth] = useState(BOOKING_MONTH);

  const vehicle = getVehicleById(route.params.vehicleId);
  const totalPrice = (vehicle?.pricePerDay ?? 450) * BOOKING_DAYS;
  const setDates = useBookingDraftStore((state) => state.setDates);

  const weekdayLabels = useMemo(
    () => Array.from({ length: 7 }, (_, i) => t(`weekdays.${i}`)),
    [t],
  );

  const calendarCells = useMemo(() => {
    const daysInMonth = getDaysInMonth(BOOKING_YEAR, displayMonth);
    const firstDay = getFirstWeekday(BOOKING_YEAR, displayMonth);
    const cells: Array<number | null> = [];

    for (let i = 0; i < firstDay; i += 1) {
      cells.push(null);
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push(day);
    }
    return cells;
  }, [displayMonth]);

  const getDayStyle = (day: number) => {
    if (displayMonth !== BOOKING_MONTH) {
      return "bg-transparent";
    }
    if (day === RANGE_START || day === RANGE_END) {
      return "bg-primary";
    }
    if (day > RANGE_START && day < RANGE_END) {
      return "bg-primaryMuted";
    }
    return "bg-transparent";
  };

  const getDayTextStyle = (day: number) => {
    if (displayMonth === BOOKING_MONTH && (day === RANGE_START || day === RANGE_END)) {
      return "text-white";
    }
    return "text-text";
  };

  return (
    <View className="flex-1 bg-backgroundWarm">
      <BookingStepHeader
        step={t("step", { current: 1, total: 4 })}
        title={t("title")}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120, paddingHorizontal: 24 }}
      >
        <View className="mt-3 rounded-[20px] bg-white px-[18px] py-[18px]">
          <View className="flex-row items-start justify-between">
            <View className="me-3 flex-1 items-start">
              <AppText variant="caption" muted>
                {t("pickup-location")}
              </AppText>
              <AppText variant="label" className="mt-1 text-start">
                {t("pickup-location-value")}
              </AppText>
            </View>
            <View className="h-11 w-11 items-center justify-center rounded-full bg-primary/10">
              <AppIcon name="map-pin" size={20} color={colors.primary} />
            </View>
          </View>

          <View className="my-4 h-px bg-border" />

          <View className="flex-row items-center justify-between gap-3">
            <AppText variant="body" className="flex-1 text-start">
              {t("different-return-location")}
            </AppText>
            <ToggleSwitch value={differentReturn} onValueChange={setDifferentReturn} />
          </View>
        </View>

        <View className="mt-4 rounded-[20px] bg-white px-[18px] py-[18px]">
          <View className="flex-row items-center justify-between">
            <Pressable
              accessibilityRole="button"
              onPress={() => setDisplayMonth((m) => Math.max(0, m - 1))}
              className="h-8 w-8 items-center justify-center rounded-full bg-background active:opacity-70"
            >
              <AppIcon name={chevronStart} size={16} color={colors.text} />
            </Pressable>
            <AppText variant="subtitle">
              {t(`months.${displayMonth}`)} {BOOKING_YEAR}
            </AppText>
            <Pressable
              accessibilityRole="button"
              onPress={() => setDisplayMonth((m) => Math.min(11, m + 1))}
              className="h-8 w-8 items-center justify-center rounded-full bg-background active:opacity-70"
            >
              <AppIcon name={chevronEnd} size={16} color={colors.text} />
            </Pressable>
          </View>

          <View className="mt-4 flex-row">
            {weekdayLabels.map((label) => (
              <View key={label} className="flex-1 items-center py-1">
                <AppText variant="caption" muted>
                  {label}
                </AppText>
              </View>
            ))}
          </View>

          <View className="mt-2 flex-row flex-wrap">
            {calendarCells.map((day, index) => (
              <View key={`cell-${index}`} className="w-[14.28%] items-center py-1">
                {day ? (
                  <View
                    className={`h-10 w-10 items-center justify-center rounded-full ${getDayStyle(day)}`}
                  >
                    <AppText variant="body" className={getDayTextStyle(day)}>
                      {day}
                    </AppText>
                  </View>
                ) : (
                  <View className="h-10 w-10" />
                )}
              </View>
            ))}
          </View>
        </View>

        <View className="mt-4 flex-row gap-3">
          <View className="flex-1 rounded-[20px] bg-white px-4 py-3.5">
            <View className="flex-row items-center justify-between gap-2">
              <View className="flex-1 items-start">
                <AppText variant="caption" muted>
                  {t("pickup-time")}
                </AppText>
                <AppText variant="label" className="mt-0.5">
                  {t("pickup-time-value")}
                </AppText>
              </View>
              <View className="h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                <AppIcon name="clock" size={18} color={colors.primary} />
              </View>
            </View>
          </View>
          <View className="flex-1 rounded-[20px] bg-white px-4 py-3.5">
            <View className="flex-row items-center justify-between gap-2">
              <View className="flex-1 items-start">
                <AppText variant="caption" muted>
                  {t("return-time")}
                </AppText>
                <AppText variant="label" className="mt-0.5">
                  {t("return-time-value")}
                </AppText>
              </View>
              <View className="h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                <AppIcon name="clock" size={18} color={colors.primary} />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <StickyBottomBar>
        <View className="flex-row items-center justify-between">
          <View className="items-start">
            <AppText variant="subtitle" className="text-primary">
              {totalPrice} {t("common:currency")}
            </AppText>
            <AppText variant="caption" muted>
              {t("days", { count: BOOKING_DAYS })}
            </AppText>
          </View>
          <AppButton
            label={t("continue")}
            onPress={() => {
              const pad = (n: number) => n.toString().padStart(2, "0");
              setDates(
                `${BOOKING_YEAR}-${pad(displayMonth + 1)}-${pad(RANGE_START)}`,
                `${BOOKING_YEAR}-${pad(displayMonth + 1)}-${pad(RANGE_END)}`,
              );
              navigation.navigate("BookingExtras", { vehicleId: route.params.vehicleId });
            }}
            className="h-[58px] min-w-[126px] rounded-[29px]"
          />
        </View>
      </StickyBottomBar>
    </View>
  );
}
