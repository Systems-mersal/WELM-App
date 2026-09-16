import React from "react";
import { Pressable, View } from "react-native";

import { colors } from "../../theme/colors";
import { fontFamily } from "../../theme/typography";
import { useRtl } from "../../hooks/useRtl";
import { AppIcon } from "../icons/AppIcon";
import { AppText } from "../typography/AppText";

type Props = {
  label: string;
  value?: string;
  placeholder: string;
  error?: string;
  onPress: () => void;
  autoFilled?: boolean;
  autoFilledLabel?: string;
};

export function SelectField({
  label,
  value,
  placeholder,
  error,
  onPress,
  autoFilled = false,
  autoFilledLabel,
}: Props) {
  const { chevronEnd } = useRtl();

  return (
    <View
      className={`w-full ${autoFilled ? "rounded-2xl border border-primarySoft bg-primaryMuted p-3" : ""}`}
    >
      <View className="mb-2 flex-row flex-wrap items-center gap-2">
        <AppText variant="label" className="text-start">
          {label}
        </AppText>
        {autoFilled && autoFilledLabel ? (
          <View className="rounded-pill bg-white px-2.5 py-0.5">
            <AppText
              className="text-primary"
              style={{ fontFamily: fontFamily.semibold, fontSize: 11 }}
            >
              {autoFilledLabel}
            </AppText>
          </View>
        ) : null}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={onPress}
        className={`h-[52px] flex-row items-center rounded-2xl border bg-white px-4 ${
          error
            ? "border-danger"
            : autoFilled
              ? "border-primarySoft"
              : "border-border"
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
