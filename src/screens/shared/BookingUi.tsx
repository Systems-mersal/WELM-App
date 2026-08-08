import React from "react";
import { Pressable, View } from "react-native";
import { useRtl } from "../../hooks/useRtl";

interface StickyBottomBarProps {
  children: React.ReactNode;
  className?: string;
}

export function StickyBottomBar({ children, className = "" }: StickyBottomBarProps) {
  return (
    <View
      className={`absolute inset-x-0 bottom-0 border-t border-border bg-white px-6 py-4 ${className}`}
    >
      {children}
    </View>
  );
}

interface ToggleSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export function ToggleSwitch({ value, onValueChange }: ToggleSwitchProps) {
  const { isRTL } = useRtl();
  // Keep switch thumb motion physically LTR (ON = right), even in RTL layouts.
  const thumbOnEnd = isRTL ? !value : value;

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      onPress={() => onValueChange(!value)}
      className={`h-6 w-11 justify-center rounded-full px-0.5 ${
        value ? "bg-primary" : "bg-border"
      }`}
    >
      <View
        className={`h-5 w-5 rounded-full bg-white shadow-sm ${
          thumbOnEnd ? "self-end" : "self-start"
        }`}
      />
    </Pressable>
  );
}
