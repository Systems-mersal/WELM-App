import React, { memo } from "react";
import { View } from "react-native";
import { useTranslation } from "react-i18next";

import { AppText } from "../../../components/typography/AppText";
import type { WelmBookingTimelineStep } from "../../../features/bookings";
import { colors } from "../../../theme/colors";

export const BookingStatusTimeline = memo(function BookingStatusTimeline({
  steps,
}: {
  steps: WelmBookingTimelineStep[];
}) {
  const { t } = useTranslation("bookings");

  return (
    <View className="mt-3 gap-3">
      {steps.map((step, index) => {
        const done = step.status === "done";
        const current = step.status === "current";
        const color = done
          ? colors.success
          : current
            ? colors.primary
            : colors.border;
        return (
          <View key={step.key} className="flex-row items-start gap-3">
            <View className="items-center">
              <View
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              {index < steps.length - 1 ? (
                <View
                  className="mt-1 w-0.5 flex-1 min-h-[18px]"
                  style={{
                    backgroundColor: done ? colors.success : colors.border,
                  }}
                />
              ) : null}
            </View>
            <AppText
              variant="caption"
              className={current ? "text-primary" : done ? "text-text" : "text-textMuted"}
            >
              {t(`timeline.${step.key}`)}
            </AppText>
          </View>
        );
      })}
    </View>
  );
});
