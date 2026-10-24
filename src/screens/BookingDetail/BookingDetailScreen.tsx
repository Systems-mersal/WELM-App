import React from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Screen } from "../../components/common/Screen";
import { StackScreenHeader } from "../../components/layout/StackScreenHeader";
import { AppText } from "../../components/typography/AppText";
import { useWelmBooking } from "../../features/bookings";
import type { RootStackParamList } from "../../navigation/types";
import { colors } from "../../theme/colors";
import { BookingRequestCard } from "../Bookings/components/BookingRequestCard";

type Props = NativeStackScreenProps<RootStackParamList, "BookingDetail">;

export function BookingDetailScreen({ navigation, route }: Props) {
  const { t } = useTranslation(["bookings", "common"]);
  const insets = useSafeAreaInsets();
  const { data: booking, isPending, isError, refetch } = useWelmBooking(
    route.params.bookingId,
  );

  let body: React.ReactNode;
  if (isPending) {
    body = (
      <View className="items-center py-16">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  } else if (isError || !booking) {
    body = (
      <View className="items-center gap-3 rounded-2xl border border-border bg-white px-4 py-8">
        <AppText variant="body" muted className="text-center">
          {t("not-found")}
        </AppText>
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.goBack()}
          className="rounded-pill bg-primary px-5 py-2"
        >
          <AppText variant="caption" className="text-white">
            {t("common:back")}
          </AppText>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            void refetch();
          }}
          className="rounded-pill border border-border px-5 py-2"
        >
          <AppText variant="caption">{t("retry")}</AppText>
        </Pressable>
      </View>
    );
  } else {
    body = <BookingRequestCard booking={booking} />;
  }

  return (
    <Screen
      edges={[]}
      className="bg-background"
      contentClassName="px-5 pt-2"
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      header={
        <StackScreenHeader
          title={t("detail-title")}
          onBack={() => navigation.goBack()}
        />
      }
    >
      {body}
    </Screen>
  );
}
