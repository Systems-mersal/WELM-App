import React, { useMemo, useState } from "react";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "../../components/typography/AppText";
import { MOCK_BOOKINGS } from "../../constants/bookings";
import type { MainTabNavigationProp } from "../../navigation/types";
import { Screen } from "../../components/common/Screen";
import {
  ActiveBookingCard,
} from "./components/ActiveBookingCard";
import {
  BookingSegmentedControl,
  type BookingTab,
} from "./components/BookingSegmentedControl";
import { PastBookingRow } from "./components/PastBookingRow";

export function BookingsScreen() {
  const { t } = useTranslation("bookings");
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<MainTabNavigationProp<"Bookings">>();
  const [selectedTab, setSelectedTab] = useState<BookingTab>("current");

  const tabLabels = useMemo(
    () => ({
      past: t("tabs.past"),
      upcoming: t("tabs.upcoming"),
      current: t("tabs.current"),
    }),
    [t],
  );

  const activeBooking = MOCK_BOOKINGS.find((b) => b.status === "active");
  const pastBookings = MOCK_BOOKINGS.filter((b) => b.status === "past");

  const openVehicle = (vehicleId: string) => {
    navigation.navigate("VehicleDetails", { vehicleId });
  };

  return (
    <View className="flex-1 bg-background">
      <View
        className="bg-primaryDark px-6 pb-5"
        style={{ paddingTop: insets.top + 8 }}
      >
        <AppText variant="title" className="mb-4 text-white">
          {t("title")}
        </AppText>
        <BookingSegmentedControl
          selected={selectedTab}
          onSelect={setSelectedTab}
          labels={tabLabels}
        />
      </View>

      <Screen
        scrollable
        edges={[]}
        className="bg-background"
        contentClassName="px-6"
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        {selectedTab === "current" && activeBooking ? (
          <>
            <AppText variant="label" className="mt-2">
              {t("active-booking")}
            </AppText>
            <ActiveBookingCard booking={activeBooking} />
          </>
        ) : null}

        {selectedTab === "past" ? (
          <>
            <AppText variant="label" className="mb-3 mt-2">
              {t("past-bookings")}
            </AppText>
            <View className="gap-3">
              {pastBookings.map((booking) => (
                <PastBookingRow
                  key={booking.id}
                  booking={booking}
                  onRebook={openVehicle}
                />
              ))}
            </View>
          </>
        ) : null}

        {selectedTab === "upcoming" ? (
          <AppText variant="body" muted className="mt-6 text-center">
            {t("empty-upcoming")}
          </AppText>
        ) : null}
      </Screen>
    </View>
  );
}
