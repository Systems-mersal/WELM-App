import React from "react";
import { Pressable, View } from "react-native";
import { AppText } from "../../../components/typography/AppText";

export type BookingTab = "past" | "upcoming" | "current";

export interface BookingSegmentedControlProps {
  selected: BookingTab;
  onSelect: (tab: BookingTab) => void;
  labels: Record<BookingTab, string>;
}

const TAB_ORDER: BookingTab[] = ["past", "upcoming", "current"];

export function BookingSegmentedControl({
  selected,
  onSelect,
  labels,
}: BookingSegmentedControlProps) {
  return (
    <View className="flex-row rounded-2xl bg-white/15 p-1">
      {TAB_ORDER.map((tab) => {
        const active = tab === selected;
        return (
          <Pressable
            key={tab}
            onPress={() => onSelect(tab)}
            className={`flex-1 items-center rounded-xl py-2.5 ${
              active ? "bg-white" : "bg-transparent"
            }`}
          >
            <AppText
              variant="caption"
              className={active ? "text-primary font-cairo-semibold" : "text-white/90"}
            >
              {labels[tab]}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
