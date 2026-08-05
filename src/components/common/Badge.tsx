import React from "react";
import { View } from "react-native";
import { AppText } from "../typography/AppText";

export interface BadgeProps {
  label: string;
  variant?: "primary" | "success" | "danger" | "neutral";
  className?: string;
}

const variantClasses: Record<NonNullable<BadgeProps["variant"]>, string> = {
  primary: "bg-primary/10",
  success: "bg-successBg",
  danger: "bg-danger/10",
  neutral: "bg-border",
};

const textClasses: Record<NonNullable<BadgeProps["variant"]>, string> = {
  primary: "text-primary",
  success: "text-success",
  danger: "text-danger",
  neutral: "text-textMuted",
};

export function Badge({ label, variant = "primary", className = "" }: BadgeProps) {
  return (
    <View className={`rounded-full px-3 py-1 ${variantClasses[variant]} ${className}`}>
      <AppText variant="caption" className={textClasses[variant]}>
        {label}
      </AppText>
    </View>
  );
}
