import React from "react";
import { Feather, Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";

const FEATHER_ICON_MAP = {
  home: "home",
  search: "search",
  calendar: "calendar",
  heart: "heart",
  user: "user",
  bell: "bell",
  star: "star",
  "chevron-left": "chevron-left",
  "chevron-right": "chevron-right",
  sliders: "sliders",
  "map-pin": "map-pin",
  x: "x",
  check: "check",
  clock: "clock",
  shield: "shield",
  compass: "compass",
  plus: "plus",
} as const;

export type AppIconName = keyof typeof FEATHER_ICON_MAP | "apple";

export interface AppIconProps {
  name: AppIconName;
  size?: number;
  color?: string;
  testID?: string;
}

export function AppIcon({
  name,
  size = 24,
  color = colors.text,
  testID,
}: AppIconProps) {
  if (name === "apple") {
    return <Ionicons name="logo-apple" size={size} color={color} testID={testID} />;
  }

  return (
    <Feather name={FEATHER_ICON_MAP[name]} size={size} color={color} testID={testID} />
  );
}
