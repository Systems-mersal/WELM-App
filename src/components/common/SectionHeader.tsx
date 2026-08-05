import React from "react";
import { Pressable, View } from "react-native";
import { AppText } from "../typography/AppText";

export interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
  className?: string;
}

export function SectionHeader({
  title,
  actionLabel,
  onActionPress,
  className = "",
}: SectionHeaderProps) {
  return (
    <View className={`flex-row items-center justify-between ${className}`}>
      <AppText variant="subtitle">{title}</AppText>
      {actionLabel && onActionPress ? (
        <Pressable onPress={onActionPress} hitSlop={8}>
          <AppText variant="label" className="text-primary">
            {actionLabel}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}
