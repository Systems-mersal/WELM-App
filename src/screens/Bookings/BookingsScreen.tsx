import React, { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppText } from "../../components/typography/AppText";
import { Screen } from "../../components/common/Screen";
import { useWelmBookings } from "../../features/bookings";
import { colors } from "../../theme/colors";
import {
  BookingSegmentedControl,
  type BookingTab,
} from "./components/BookingSegmentedControl";
import { BookingRequestCard } from "./components/BookingRequestCard";

export function BookingsScreen() {
  const { t } = useTranslation(["bookings", "common"]);
  const insets = useSafeAreaInsets();
  const [selectedTab, setSelectedTab] = useState<BookingTab>("upcoming");
  const { bookings, isLoading, isError, isEmpty, refetch } = useWelmBookings();

  const tabLabels = useMemo(
    () => ({
      past: t("tabs.past"),
      upcoming: t("tabs.upcoming"),
      current: t("tabs.current"),
    }),
    [t],
  );

  const requestBookings = useMemo(
    () =>
      bookings.filter(
        (b) => b.status === "pending" || b.status === "approved",
      ),
    [bookings],
  );
  const pastBookings = useMemo(
    () =>
      bookings.filter(
        (b) => b.status === "rejected" || b.status === "cancelled",
      ),
    [bookings],
  );
  const activeBookings = useMemo(
    () =>
      bookings.filter(
        (b) =>
          b.status === "approved" &&
          b.timeline.some(
            (step) =>
              step.key === "vehicle_delivered" && step.status !== "upcoming",
          ),
      ),
    [bookings],
  );

  const list =
    selectedTab === "current"
      ? activeBookings
      : selectedTab === "past"
        ? pastBookings
        : requestBookings;

  const emptyLabel =
    selectedTab === "current"
      ? t("empty-current")
      : selectedTab === "past"
        ? t("empty-past")
        : t("empty-upcoming");

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
        <AppText variant="label" className="mb-3 mt-2">
          {selectedTab === "upcoming"
            ? t("requests-title")
            : selectedTab === "past"
              ? t("past-bookings")
              : t("active-booking")}
        </AppText>

        {isLoading ? (
          <View className="items-center py-16">
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : isError ? (
          <View className="items-center gap-3 rounded-2xl border border-border bg-white px-4 py-8">
            <AppText variant="body" muted className="text-center">
              {t("common:error")}
            </AppText>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                void refetch();
              }}
              className="rounded-pill bg-primary px-5 py-2"
            >
              <AppText variant="caption" className="text-white">
                {t("retry")}
              </AppText>
            </Pressable>
          </View>
        ) : isEmpty || list.length === 0 ? (
          <View className="items-center rounded-2xl border border-border bg-white px-4 py-10">
            <AppText variant="body" muted className="text-center">
              {emptyLabel}
            </AppText>
          </View>
        ) : (
          <View className="gap-3">
            {list.map((booking) => (
              <BookingRequestCard key={booking.id} booking={booking} />
            ))}
          </View>
        )}
      </Screen>
    </View>
  );
}
