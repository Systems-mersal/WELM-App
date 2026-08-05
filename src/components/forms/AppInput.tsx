import React from "react";
import { TextInput, View, type TextInputProps } from "react-native";
import { writingTextAlign } from "../../lib/rtl";
import { colors } from "../../theme/colors";
import { fontFamily } from "../../theme/typography";
import { AppText } from "../typography/AppText";

export interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerClassName?: string;
  inputClassName?: string;
}

export function AppInput({
  label,
  error,
  containerClassName = "",
  inputClassName = "",
  ...props
}: AppInputProps) {
  return (
    <View className={`w-full ${containerClassName}`}>
      {label ? (
        <AppText variant="label" className="mb-2">
          {label}
        </AppText>
      ) : null}
      <TextInput
        placeholderTextColor={colors.textMuted}
        className={`h-[52px] rounded-2xl border border-border bg-white px-4 text-text ${inputClassName}`}
        style={{
          fontFamily: fontFamily.regular,
          fontSize: 16,
          textAlign: writingTextAlign(),
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
