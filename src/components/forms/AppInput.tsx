import React, { type ReactNode } from "react";
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
  rightElement?: ReactNode;
}

export function AppInput({
  label,
  error,
  containerClassName = "",
  inputClassName = "",
  rightElement,
  ...props
}: AppInputProps) {
  const { textAlign, writingDirection } = useRtl();

  return (
    <View className={`w-full ${containerClassName}`}>
      {label ? (
        <AppText variant="label" className="mb-2">
          {label}
        </AppText>
      ) : null}
      <View className="relative">
        <TextInput
          placeholderTextColor={colors.textMuted}
          className={`h-[52px] rounded-2xl border bg-white px-4 text-text ${
            rightElement ? "pe-12" : ""
          } ${error ? "border-danger" : "border-border"} ${inputClassName}`}
          style={{
            fontFamily: fontFamily.regular,
            fontSize: 16,
            textAlign,
            writingDirection,
          }}
          {...props}
        />
        {rightElement ? (
          <View className="absolute bottom-0 end-0 top-0 justify-center pe-3">
            {rightElement}
          </View>
        ) : null}
      </View>
      {error ? (
        <AppText variant="caption" className="mt-1 text-danger">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}
