import React from "react";
import { View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { PushBootstrap } from "../../features/notifications";
import { useRtl } from "../../hooks/useRtl";
import { navigationRef } from "../../navigation/navigation-ref";

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
      <NavigationContainer ref={navigationRef} direction={direction}>
        <StatusBar style="dark" />
        {children}
        <PushBootstrap />
      </NavigationContainer>
    </View>
  );
}
