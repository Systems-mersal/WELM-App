import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppButton } from "../../components/buttons/AppButton";
import { AppIcon } from "../../components/icons/AppIcon";
import { AppText } from "../../components/typography/AppText";
import {
  computeInclusiveDays,
  computeLocalQuote,
} from "../../features/bookings";
import { useWelmVehicle } from "../../features/vehicles";
import { getVehicleById } from "../../constants/vehicles";
import { useRtl } from "../../hooks/useRtl";
import type { RootStackParamList } from "../../navigation/types";
import { useBookingDraftStore } from "../../stores/booking-draft-store";
import { colors } from "../../theme/colors";
import { BookingStepHeader } from "../shared/BookingStepHeader";
import { StickyBottomBar, ToggleSwitch } from "../shared/BookingUi";

type Props = NativeStackScreenProps<RootStackParamList, "BookingDates">;

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isBeforeDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() < startOfDay(b).getTime();
}

function isInRange(day: Date, start: Date | null, end: Date | null): boolean {
  if (!start || !end) return false;
  const t = startOfDay(day).getTime();
  return t > startOfDay(start).getTime() && t < startOfDay(end).getTime();
}

export function BookingDatesScreen({ navigation, route }: Props) {
  const { t } = useTranslation(["booking-dates", "common"]);
  const insets = useSafeAreaInsets();
  const { chevronStart, chevronEnd } = useRtl();
  const today = useMemo(() => startOfDay(new Date()), []);
  const [cursor, setCursor] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [rangeStart, setRangeStart] = useState<Date | null>(today);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);
  const [differentReturn, setDifferentReturn] = useState(false);

  const mockVehicle = getVehicleById(route.params.vehicleId);
  const { data: apiVehicle } = useWelmVehicle(
    mockVehicle ? undefined : route.params.vehicleId,
  );
  const vehicle = mockVehicle ?? apiVehicle;
  const dailyRate = vehicle?.pricePerDay ?? 0;

  const setDates = useBookingDraftStore((state) => state.setDates);
  const setQuote = useBookingDraftStore((state) => state.setQuote);
  const setLocations = useBookingDraftStore((state) => state.setLocations);
  const setVehicleId = useBookingDraftStore((state) => state.setVehicleId);

  const weekdayLabels = useMemo(
    () => Array.from({ length: 7 }, (_, i) => t(`weekdays.${i}`)),
    [t],
  );

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const calendarCells = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const cells: Array<number | null> = [];
    for (let i = 0; i < firstDay; i += 1) cells.push(null);
    for (let day = 1; day <= daysInMonth; day += 1) cells.push(day);
    return cells;
  }, [month, year]);

  const selectedDays =
    rangeStart && rangeEnd ? computeInclusiveDays(rangeStart, rangeEnd) : 0;
  const quote = computeLocalQuote(dailyRate, Math.max(selectedDays, 1));
  const totalPrice = rangeStart && rangeEnd ? quote.quotedTotal : 0;

  const shiftMonth = (delta: number) => {
    setCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  const onSelectDay = (day: number) => {
    const selected = startOfDay(new Date(year, month, day));
    if (isBeforeDay(selected, today)) return;

    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(selected);
      setRangeEnd(null);
      return;
    }

    if (isBeforeDay(selected, rangeStart)) {
      setRangeStart(selected);
      setRangeEnd(null);
      return;
    }

    setRangeEnd(selected);
  };

  const getDayStyle = (day: number) => {
    const date = startOfDay(new Date(year, month, day));
    if (isBeforeDay(date, today)) return "bg-transparent opacity-40";
    if (rangeStart && sameDay(date, rangeStart)) return "bg-primary";
    if (rangeEnd && sameDay(date, rangeEnd)) return "bg-primary";
    if (isInRange(date, rangeStart, rangeEnd)) return "bg-primaryMuted";
    return "bg-transparent";
  };

  const getDayTextStyle = (day: number) => {
    const date = startOfDay(new Date(year, month, day));
    if (isBeforeDay(date, today)) return "text-textMuted";
    if (
      (rangeStart && sameDay(date, rangeStart)) ||
      (rangeEnd && sameDay(date, rangeEnd))
    ) {
      return "text-white";
    }
    return "text-text";
  };

  const canContinue = Boolean(rangeStart && rangeEnd && dailyRate >= 0);

  const handleContinue = () => {
    if (!rangeStart || !rangeEnd) return;
    const pad = (n: number) => n.toString().padStart(2, "0");
    const startStr = `${rangeStart.getFullYear()}-${pad(rangeStart.getMonth() + 1)}-${pad(rangeStart.getDate())}`;
    const endStr = `${rangeEnd.getFullYear()}-${pad(rangeEnd.getMonth() + 1)}-${pad(rangeEnd.getDate())}`;
    const days = computeInclusiveDays(rangeStart, rangeEnd);
    const nextQuote = computeLocalQuote(dailyRate, days);

    setVehicleId(route.params.vehicleId);
    setDates(startStr, endStr);
    setQuote(nextQuote);
    setLocations(
      vehicle?.locationLabel ?? t("pickup-location-value"),
      differentReturn ? t("pickup-location-value") : null,
    );
    navigation.navigate("BookingExtras", { vehicleId: route.params.vehicleId });
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
        contentContainerStyle={{
          paddingBottom: insets.bottom + 120,
          paddingHorizontal: 24,
        }}
      >
        <View className="mt-3 rounded-[20px] bg-white px-[18px] py-[18px]">
          <View className="flex-row items-start justify-between">
            <View className="me-3 flex-1 items-start">
              <AppText variant="caption" muted>
                {t("pickup-location")}
              </AppText>
              <AppText variant="label" className="mt-1 text-start">
                {vehicle?.locationLabel ?? t("pickup-location-value")}
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
            <ToggleSwitch
              value={differentReturn}
              onValueChange={setDifferentReturn}
            />
          </View>
        </View>

        <View className="mt-4 rounded-[20px] bg-white px-[18px] py-[18px]">
          <View className="flex-row items-center justify-between">
            <Pressable
              accessibilityRole="button"
              onPress={() => shiftMonth(-1)}
              className="h-8 w-8 items-center justify-center rounded-full bg-background active:opacity-70"
            >
              <AppIcon name={chevronStart} size={16} color={colors.text} />
            </Pressable>
            <AppText variant="subtitle">
              {t(`months.${month}`)} {year}
            </AppText>
            <Pressable
              accessibilityRole="button"
              onPress={() => shiftMonth(1)}
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
                  <Pressable
                    accessibilityRole="button"
                    disabled={isBeforeDay(new Date(year, month, day), today)}
                    onPress={() => onSelectDay(day)}
                    className={`h-10 w-10 items-center justify-center rounded-full ${getDayStyle(day)}`}
                  >
                    <AppText variant="body" className={getDayTextStyle(day)}>
                      {day}
                    </AppText>
                  </Pressable>
                ) : (
                  <View className="h-10 w-10" />
                )}
              </View>
            ))}
          </View>
          <AppText variant="caption" muted className="mt-3 text-center">
            {t("select-range-hint")}
          </AppText>
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
              {rangeStart && rangeEnd
                ? t("days", { count: selectedDays })
                : t("select-dates")}
            </AppText>
          </View>
          <AppButton
            label={t("continue")}
            disabled={!canContinue}
            onPress={handleContinue}
            className="h-[58px] min-w-[126px] rounded-[29px]"
          />
        </View>
      </StickyBottomBar>
    </View>
  );
}
