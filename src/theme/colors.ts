import palette from "./palette.json";

export const colors = palette.colors;

export type ColorKey = keyof typeof colors;
