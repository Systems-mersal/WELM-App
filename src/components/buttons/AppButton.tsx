import React from "react";
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  View,
} from "react-native";
import { colors } from "../../theme/colors";
import { AppText } from "../typography/AppText";

export interface AppButtonProps extends Omit<PressableProps, "children"> {
  label: string;
  loading?: boolean;
  variant?: "primary" | "outline" | "ghost";
  className?: string;
  textClassName?: string;
}

export function AppButton({
  label,
  loading = false,
  variant = "primary",
  disabled,
  className = "",
  textClassName = "",
  ...props
}: AppButtonProps) {
  const isDisabled = disabled || loading;

  const containerClass =
    variant === "primary"
      ? "bg-primary"
      : variant === "outline"
        ? "bg-transparent border border-primary"
        : "bg-transparent";

  const labelClass =
    variant === "primary"
      ? "text-white"
      : variant === "outline"
        ? "text-primary"
        : "text-primary";

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      className={`h-[54px] items-center justify-center rounded-pill px-6 ${containerClass} ${
        isDisabled ? "opacity-50" : "active:opacity-80"
      } ${className}`}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? colors.white : colors.primary} />
      ) : (
        <AppText variant="button" className={`${labelClass} ${textClassName}`}>
          {label}
        </AppText>
      )}
    </Pressable>
  );
}
