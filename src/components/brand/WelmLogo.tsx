import React from "react";
import { Image, type ImageStyle, type StyleProp } from "react-native";

import welmLogo from "../../assets/brand/welm-logo.png";

/** Source asset is 1024×366. */
const LOGO_ASPECT = 1024 / 366;

export type WelmLogoProps = {
  width?: number;
  height?: number;
  style?: StyleProp<ImageStyle>;
};

export function WelmLogo({ width = 200, height, style }: WelmLogoProps) {
  const resolvedHeight = height ?? Math.round(width / LOGO_ASPECT);

  return (
    <Image
      source={welmLogo}
      style={[{ width, height: resolvedHeight }, style]}
      resizeMode="contain"
      accessibilityRole="image"
      accessibilityLabel="WELM"
    />
  );
}
