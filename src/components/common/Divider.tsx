import React from "react";
import { View } from "react-native";

export interface DividerProps {
  className?: string;
  vertical?: boolean;
}

export function Divider({ className = "", vertical = false }: DividerProps) {
  return (
    <View
      className={`bg-border ${vertical ? "h-full w-px" : "h-px w-full"} ${className}`}
    />
  );
}
