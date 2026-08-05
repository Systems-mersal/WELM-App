import React from "react";
import { Pressable, View } from "react-native";
import { AppIcon } from "../../../components/icons/AppIcon";
import { AppText } from "../../../components/typography/AppText";
import { chevronEnd } from "../../../lib/rtl";
import { colors } from "../../../theme/colors";

export interface SettingsRowProps {
  label: string;
  value?: string;
  onPress?: () => void;
}

export function SettingsRow({ label, value, onPress }: SettingsRowProps) {
  const interactive = typeof onPress === "function";
  const content = (
    <>
      <AppText variant="body" className={interactive ? undefined : "text-textMuted"}>
        {label}
      </AppText>
      <View className="flex-row items-center gap-2">
        {value ? (
          <AppText variant="caption" muted>
            {value}
          </AppText>
        ) : null}
        {interactive ? (
          <AppIcon name={chevronEnd()} size={18} color={colors.textMuted} />
        ) : null}
      </View>
    </>
  );

  if (!interactive) {
    return (
      <View className="flex-row items-center justify-between border-b border-border py-4">
        {content}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className="flex-row items-center justify-between border-b border-border py-4 active:opacity-70"
    >
      {content}
    </Pressable>
  );
}

export function SettingsList({
  rows,
}: {
  rows: Array<{ key: string; label: string; value?: string; onPress?: () => void }>;
}) {
  return (
    <View className="mt-6 rounded-[20px] bg-white px-4">
      {rows.map((row) => (
        <View key={row.key}>
          <SettingsRow label={row.label} value={row.value} onPress={row.onPress} />
        </View>
      ))}
    </View>
  );
}
