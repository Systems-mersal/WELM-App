import React from "react";
import { TextInput, View, type TextInputProps } from "react-native";
import { useRtl } from "../../hooks/useRtl";
import { colors } from "../../theme/colors";
import { fontFamily } from "../../theme/typography";
import { AppText } from "../typography/AppText";

export interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerClassName?: string;
  inputClassName?: string;
  /** Mint autofill chrome from ID scan. */
  autoFilled?: boolean;
  autoFilledLabel?: string;
}

export function AppInput({
  label,
  error,
  containerClassName = "",
  inputClassName = "",
  autoFilled = false,
  autoFilledLabel,
  ...props
}: AppInputProps) {
  const { textAlign, writingDirection } = useRtl();

  return (
    <View
      className={`w-full ${autoFilled ? "rounded-2xl border border-primarySoft bg-primaryMuted p-3" : ""} ${containerClassName}`}
    >
      {label || (autoFilled && autoFilledLabel) ? (
        <View className="mb-2 flex-row flex-wrap items-center gap-2">
          {label ? (
            <AppText variant="label" className="text-start">
              {label}
            </AppText>
          ) : null}
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
      ) : null}
      <TextInput
        placeholderTextColor={colors.textMuted}
        className={`h-[52px] rounded-2xl border px-4 text-text ${
          autoFilled ? "border-primarySoft bg-white" : "bg-white"
        } ${error ? "border-danger" : autoFilled ? "" : "border-border"} ${inputClassName}`}
        style={{
          fontFamily: fontFamily.regular,
          fontSize: 16,
          textAlign,
          writingDirection,
        }}
        {...props}
      />
      {error ? (
        <AppText variant="caption" className="mt-1 text-danger">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}
