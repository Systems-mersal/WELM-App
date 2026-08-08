import React from "react";
import { Text, type TextProps, type TextStyle } from "react-native";
import { useRtl } from "../../hooks/useRtl";
import { fontFamily, fontSize, lineHeight } from "../../theme/typography";

export type AppTextVariant =
  | "title"
  | "subtitle"
  | "body"
  | "caption"
  | "label"
  | "button";

export interface AppTextProps extends TextProps {
  variant?: AppTextVariant;
  className?: string;
  muted?: boolean;
}

const variantStyles: Record<
  AppTextVariant,
  { size: number; lineHeight: number; weight: TextStyle["fontFamily"] }
> = {
  title: { size: fontSize.title, lineHeight: lineHeight.title, weight: fontFamily.bold },
  subtitle: {
    size: fontSize.subtitle,
    lineHeight: lineHeight.subtitle,
    weight: fontFamily.semibold,
  },
  body: { size: fontSize.body, lineHeight: lineHeight.body, weight: fontFamily.regular },
  caption: {
    size: fontSize.caption,
    lineHeight: lineHeight.caption,
    weight: fontFamily.regular,
  },
  label: { size: fontSize.label, lineHeight: lineHeight.label, weight: fontFamily.semibold },
  button: {
    size: fontSize.button,
    lineHeight: lineHeight.button,
    weight: fontFamily.semibold,
  },
};

const ALIGN_CLASS_RE = /\btext-(center|left|right|start|end|justify)\b/;

export function AppText({
  variant = "body",
  className = "",
  muted = false,
  style,
  ...props
}: AppTextProps) {
  const config = variantStyles[variant];
  const { textAlign, writingDirection } = useRtl();
  const hasExplicitAlign = ALIGN_CLASS_RE.test(className);

  return (
    <Text
      className={`${muted ? "text-textMuted" : "text-text"} ${className}`}
      style={[
        {
          fontFamily: config.weight,
          fontSize: config.size,
          lineHeight: config.lineHeight,
          writingDirection,
          ...(hasExplicitAlign ? {} : { textAlign }),
        },
        style,
      ]}
      {...props}
    />
  );
}
