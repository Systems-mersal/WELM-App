import React from "react";
import { Pressable, View } from "react-native";
import { AppIcon } from "../icons/AppIcon";
import { AppText } from "../typography/AppText";
import { colors } from "../../theme/colors";

export interface TermsCheckboxProps {
  checked: boolean;
  error?: boolean;
  onToggle: () => void;
  accessibilityLabel: string;
  errorMessage?: string;
  children: React.ReactNode;
}

export function TermsCheckbox({
  checked,
  error = false,
  onToggle,
  accessibilityLabel,
  errorMessage,
  children,
}: TermsCheckboxProps) {
  return (
    <View>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        accessibilityLabel={accessibilityLabel}
        onPress={onToggle}
        className="flex-row items-start gap-3"
      >
        <View
          className={`mt-0.5 h-5 w-5 items-center justify-center rounded border ${
            checked
              ? "border-primary bg-primary"
              : error
                ? "border-danger bg-white"
                : "border-border bg-white"
          }`}
        >
          {checked ? (
            <AppIcon name="check" size={12} color={colors.white} />
          ) : null}
        </View>
        <View className="flex-1">{children}</View>
      </Pressable>
      {error && errorMessage ? (
        <AppText variant="caption" className="mt-2 text-danger">
          {errorMessage}
        </AppText>
      ) : null}
    </View>
  );
}
