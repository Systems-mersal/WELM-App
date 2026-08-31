import React from "react";
import { View } from "react-native";

type SignupProgressStep = "account" | "mobile" | "profile";

const ORDER: SignupProgressStep[] = ["account", "mobile", "profile"];

type Props = {
  current: SignupProgressStep;
};

/**
 * US-3 three-segment signup progress: account done, mobile current, profile empty.
 */
export function SignupProgress({ current }: Props) {
  const currentIndex = ORDER.indexOf(current);

  return (
    <View className="flex-row items-center gap-2" accessibilityRole="progressbar">
      {ORDER.map((step, index) => {
        const done = index < currentIndex;
        const active = index === currentIndex;
        return (
          <View
            key={step}
            className={`h-1.5 flex-1 rounded-full ${
              done || active ? "bg-primary" : "bg-border"
            } ${active ? "opacity-100" : done ? "opacity-70" : "opacity-100"}`}
          />
        );
      })}
    </View>
  );
}
