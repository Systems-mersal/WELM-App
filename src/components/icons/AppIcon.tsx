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
  close: "x",
  check: "check",
  clock: "clock",
  shield: "shield",
  compass: "compass",
  plus: "plus",
  list: "list",
  map: "map",
} as const;

const IONICONS_LOGO_MAP = {
  apple: "logo-apple",
  google: "logo-google",
} as const;

export type AppIconName =
  | keyof typeof FEATHER_ICON_MAP
  | keyof typeof IONICONS_LOGO_MAP;

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
  if (name in IONICONS_LOGO_MAP) {
    return (
      <Ionicons
        name={IONICONS_LOGO_MAP[name as keyof typeof IONICONS_LOGO_MAP]}
        size={size}
        color={color}
        testID={testID}
      />
    );
  }

  return (
    <Feather
      name={FEATHER_ICON_MAP[name as keyof typeof FEATHER_ICON_MAP]}
      size={size}
      color={color}
      testID={testID}
    />
  );
}
