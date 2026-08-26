import React from "react";
import { Text, TextInput, View, type TextInputProps } from "react-native";
import { useTranslation } from "react-i18next";
import { colors } from "../../theme/colors";
import { fontFamily, fontSize } from "../../theme/typography";
import { AppText } from "../typography/AppText";

export interface SaudiPhoneFieldProps
  extends Omit<TextInputProps, "value" | "onChangeText" | "keyboardType"> {
  value: string;
  onChangeText: (value: string) => void;
  label?: string;
}

export function SaudiPhoneField({
  value,
  onChangeText,
  label,
  placeholder,
  ...props
}: SaudiPhoneFieldProps) {
  const { t } = useTranslation("common");

  return (
    <View className="w-full">
      {label ? (
        <AppText variant="label" className="mb-2">
          {label}
        </AppText>
      ) : null}
      <View className="h-14 flex-row items-center rounded-2xl border border-border bg-background px-4">
        <View className="flex-row items-center gap-2">
          <Text
            accessibilityLabel={t("a11y.country-sa")}
            style={{ fontSize: 18, lineHeight: 20 }}
          >
            🇸🇦
          </Text>
          <AppText variant="body" className="text-text">
            +966
          </AppText>
        </View>
        <View className="mx-3 h-6 w-px bg-border" />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          keyboardType="phone-pad"
          returnKeyType="done"
          maxLength={9}
          className="flex-1 text-text"
          style={{
            fontFamily: fontFamily.regular,
            fontSize: fontSize.body,
            textAlign: "left",
            writingDirection: "ltr",
          }}
          {...props}
        />
      </View>
    </View>
  );
}
