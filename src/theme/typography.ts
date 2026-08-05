export const fontFamily = {
  regular: "Cairo_400Regular",
  semibold: "Cairo_600SemiBold",
  bold: "Cairo_700Bold",
  interRegular: "Inter_400Regular",
  interSemibold: "Inter_600SemiBold",
  interBold: "Inter_700Bold",
} as const;

export const fontSize = {
  title: 28,
  subtitle: 20,
  body: 16,
  caption: 12,
  label: 14,
  button: 16,
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const lineHeight = {
  title: 36,
  subtitle: 28,
  body: 24,
  caption: 16,
  label: 20,
  button: 24,
} as const;

export type FontSizeKey = keyof typeof fontSize;
