import React from "react";
import { Image, View, type ImageSourcePropType } from "react-native";
import { AppText } from "../typography/AppText";

export interface AvatarProps {
  source?: ImageSourcePropType;
  name?: string;
  size?: number;
  className?: string;
}

export function Avatar({ source, name, size = 48, className = "" }: AvatarProps) {
  const initials = name
    ?.split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <View
      className={`items-center justify-center overflow-hidden rounded-full bg-primary/10 ${className}`}
      style={{ width: size, height: size }}
    >
      {source ? (
        <Image source={source} style={{ width: size, height: size }} resizeMode="cover" />
      ) : (
        <AppText variant="label" className="text-primary">
          {initials ?? "?"}
        </AppText>
      )}
    </View>
  );
}
