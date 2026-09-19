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
  /** Mint autofill chrome from ID scan. */
  autoFilled?: boolean;
  autoFilledLabel?: string;
}

export function AppInput({
  label,
  error,
  containerClassName = "",
  inputClassName = "",
  rightElement,
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
      <View className="relative">
        <TextInput
          placeholderTextColor={colors.textMuted}
          className={`h-[52px] rounded-2xl border bg-white px-4 text-text ${
            rightElement ? "pe-12" : ""
          } ${
            error
              ? "border-danger"
              : autoFilled
                ? "border-primarySoft"
                : "border-border"
          } ${inputClassName}`}
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
