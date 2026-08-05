import React from "react";
import { Pressable, View } from "react-native";
import { AppText } from "../../../components/typography/AppText";
import { alertComingSoon } from "../../../utils/comingSoon";

interface DocumentCardProps {
  title: string;
  status: "verified" | "pending";
  statusLabel: string;
  uploadedAt: string;
  numberLabel: string;
  updateLabel: string;
}

export function DocumentCard({
  title,
  status,
  statusLabel,
  uploadedAt,
  numberLabel,
  updateLabel,
}: DocumentCardProps) {
  const badgeClass =
    status === "verified"
      ? "bg-successBg"
      : "bg-peach/30";

  const badgeTextClass =
    status === "verified"
      ? "text-success"
      : "text-text";

  return (
    <View className="mb-3 rounded-xl bg-white px-4 py-4">
      <View className="flex-row items-center justify-between">
        <AppText variant="subtitle">{title}</AppText>
        <View className={`rounded-full px-2.5 py-1 ${badgeClass}`}>
          <AppText variant="caption" className={badgeTextClass}>
            {statusLabel}
          </AppText>
        </View>
      </View>

      <View className="mt-4 flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center gap-3">
          <View className="h-[38px] w-[54px] rounded-lg bg-border" />
          <View className="items-start">
            <AppText variant="caption" muted>
              {uploadedAt}
            </AppText>
            <AppText variant="label" className="mt-0.5">
              {numberLabel}
            </AppText>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={updateLabel}
          onPress={alertComingSoon}
          className="rounded-full border border-border px-4 py-2 active:opacity-70"
        >
          <AppText variant="caption">{updateLabel}</AppText>
        </Pressable>
      </View>
    </View>
  );
}
