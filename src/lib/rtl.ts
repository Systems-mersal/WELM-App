import { I18nManager } from "react-native";
import type { AppIconName } from "../components/icons/AppIcon";

export function isRTL(): boolean {
  return I18nManager.isRTL;
}

/** Chevron pointing toward reading start (typical back affordance). */
export function chevronStart(): AppIconName {
  return I18nManager.isRTL ? "chevron-right" : "chevron-left";
}

/** Chevron pointing toward reading end (typical forward affordance). */
export function chevronEnd(): AppIconName {
  return I18nManager.isRTL ? "chevron-left" : "chevron-right";
}

export function writingTextAlign(): "left" | "right" {
  return I18nManager.isRTL ? "right" : "left";
}

export function getWritingDirection(): "rtl" | "ltr" {
  return I18nManager.isRTL ? "rtl" : "ltr";
}
