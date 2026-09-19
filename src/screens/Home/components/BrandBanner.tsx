import React from "react";
import { View } from "react-native";

import { WelmLogo } from "../../../components/brand/WelmLogo";

export function BrandBanner() {
  return (
    <View className="h-[90px] items-center justify-center overflow-hidden rounded-[20px] bg-white px-5">
      <WelmLogo width={220} />
    </View>
  );
}
