import React from "react";
import { Pressable, type PressableProps } from "react-native";
import { AppText } from "../typography/AppText";

export interface ChipProps extends Omit<PressableProps, "children"> {
  label: string;
  selected?: boolean;
  className?: string;
}

export function Chip({ label, selected = false, className = "", ...props }: ChipProps) {
  return (
    <Pressable
      className={`rounded-full px-4 py-2 ${
        selected ? "bg-primary" : "bg-white border border-border"
      } ${className}`}
      {...props}
    >
      <AppText
        variant="caption"
        className={selected ? "text-white" : "text-text"}
      >
        {label}
      </AppText>
    </Pressable>
  );
}
