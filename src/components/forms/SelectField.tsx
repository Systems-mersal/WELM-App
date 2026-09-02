import React from "react";
import { Pressable, View } from "react-native";

import { colors } from "../../theme/colors";
import { useRtl } from "../../hooks/useRtl";
import { AppIcon } from "../icons/AppIcon";
import { AppText } from "../typography/AppText";

type Props = {
  label: string;
  value?: string;
  placeholder: string;
  error?: string;
  onPress: () => void;
};

export function SelectField({
  label,
  value,
  placeholder,
  error,
  onPress,
}: Props) {
  const { chevronEnd } = useRtl();

  return (
    <View className="w-full">
      <AppText variant="label" className="mb-2">
        {label}
      </AppText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={onPress}
        className={`h-[52px] flex-row items-center rounded-2xl border bg-white px-4 ${
          error ? "border-danger" : "border-border"
        }`}
      >
        <AppText
          variant="body"
          className={`flex-1 text-start ${value ? "text-text" : "text-textMuted"}`}
          numberOfLines={1}
        >
          {value || placeholder}
        </AppText>
        <AppIcon name={chevronEnd} size={18} color={colors.textMuted} />
      </Pressable>
      {error ? (
        <AppText variant="caption" className="mt-1 text-danger">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}
