import React from "react";
import { Pressable, View } from "react-native";

import { AppText } from "../typography/AppText";

export type BirthCalendar = "hijri" | "gregorian";

type Props = {
  value: BirthCalendar;
  hijriLabel: string;
  gregorianLabel: string;
  onChange: (next: BirthCalendar) => void;
};

const OPTIONS: BirthCalendar[] = ["hijri", "gregorian"];

export function CalendarToggle({
  value,
  hijriLabel,
  gregorianLabel,
  onChange,
}: Props) {
  const labels: Record<BirthCalendar, string> = {
    hijri: hijriLabel,
    gregorian: gregorianLabel,
  };

  return (
    <View
      accessibilityRole="tablist"
      className="mb-3 flex-row rounded-2xl bg-background p-1"
    >
      {OPTIONS.map((option) => {
        const active = option === value;
        return (
          <Pressable
            key={option}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={labels[option]}
            onPress={() => onChange(option)}
            className={`flex-1 items-center rounded-xl py-2.5 ${
              active ? "bg-white" : "bg-transparent"
            }`}
          >
            <AppText
              variant="label"
              className={active ? "text-primary" : "text-textMuted"}
            >
              {labels[option]}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
