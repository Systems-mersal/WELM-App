import React from "react";
import { Pressable, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CommonActions } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppButton } from "../../components/buttons/AppButton";
import { AppIcon } from "../../components/icons/AppIcon";
import { AppText } from "../../components/typography/AppText";
import { getVehicleById } from "../../constants/vehicles";
import type { RootStackParamList } from "../../navigation/types";
import { colors } from "../../theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "BookingConfirmed">;

export function BookingConfirmedScreen({ navigation, route }: Props) {
  const { t } = useTranslation(["booking-confirmed", "vehicles"]);
  const insets = useSafeAreaInsets();

  const vehicle = route.params?.vehicleId
    ? getVehicleById(route.params.vehicleId)
    : undefined;

  const vehicleName = vehicle
    ? `${t(`vehicles:${vehicle.nameKey}`)}${vehicle.year ? ` ${vehicle.year}` : ""}`
    : t("vehicles:mercedes-e350");

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
    { label: t("booking-id"), value: t("booking-ref") },
    { label: t("vehicle-label"), value: vehicleName },
    { label: t("period-label"), value: t("period-value") },
    { label: t("location-label"), value: t("location-value") },
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
        <View className="mt-4 flex-row gap-2">
          <View className="h-2 w-2 rounded-full bg-primary/30" />
          <View className="h-2 w-2 rounded-full bg-primary" />
        </View>
      </View>

      <AppText variant="title" className="mt-6 text-center">
        {t("title")}
      </AppText>
      <AppText variant="body" muted className="mt-3 text-center leading-6">
        {t("subtitle")}
      </AppText>

      <View className="mt-8 rounded-[20px] bg-primary px-5 py-5">
        {summaryRows.map((row, index) => (
          <View key={row.label}>
            {index > 0 ? <View className="my-0 h-px bg-white/20" /> : null}
            <View className="flex-row items-center justify-between py-3.5">
              <AppText variant="label" className="flex-1 text-white">
                {row.value}
              </AppText>
              <AppText variant="caption" className="text-white/80">
                {row.label}
              </AppText>
            </View>
          </View>
        ))}
      </View>

      <View className="flex-1" />

      <AppButton
        label={t("view-booking")}
        onPress={goToBookings}
        className="h-[58px] rounded-[29px]"
      />
      <Pressable
        accessibilityRole="button"
        onPress={goToHome}
        className="mt-4 items-center py-2 active:opacity-70"
      >
        <AppText variant="button" className="text-primary">
          {t("back-to-home")}
        </AppText>
      </Pressable>
    </View>
  );
}
