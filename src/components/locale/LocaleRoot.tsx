import React from "react";
import { View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { useRtl } from "../../hooks/useRtl";

interface LocaleRootProps {
  children: React.ReactNode;
}

/**
 * RN equivalent of DMS `<html lang dir>` + inner `dir` wrapper.
 * Applies LTR/RTL from the active language in place — no app reload.
 */
export function LocaleRoot({ children }: LocaleRootProps) {
  const { direction } = useRtl();

  return (
    <View style={{ flex: 1, direction }}>
      <NavigationContainer direction={direction}>
        <StatusBar style="dark" />
        {children}
      </NavigationContainer>
    </View>
  );
}
