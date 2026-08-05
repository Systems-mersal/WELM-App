import React from "react";
import { Pressable, type PressableProps } from "react-native";
import { colors } from "../../theme/colors";
import { AppIcon, type AppIconName } from "../icons/AppIcon";

export interface IconButtonProps extends Omit<PressableProps, "children"> {
  name: AppIconName;
  size?: number;
  color?: string;
  className?: string;
}

export function IconButton({
  name,
  size = 24,
  color = colors.text,
  className = "",
  ...props
}: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      className={`h-10 w-10 items-center justify-center rounded-full active:opacity-70 ${className}`}
      hitSlop={8}
      {...props}
    >
      <AppIcon name={name} size={size} color={color} />
    </Pressable>
  );
}
