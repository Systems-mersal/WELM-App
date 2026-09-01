import type { NavigationProp } from "@react-navigation/native";

import type { RootStackParamList } from "../../../navigation/types";

/** Existing consumer — skip Complete profile (sign-in). */
export function routeToHome(
  navigation: NavigationProp<RootStackParamList>,
): void {
  navigation.reset({
    index: 0,
    routes: [{ name: "MainTabs" }],
  });
}

/**
 * New signup only — Complete profile after contact OTP.
 * Sign-in must call `routeToHome` instead.
 */
export function routePastAuthGate(
  navigation: NavigationProp<RootStackParamList>,
): void {
  navigation.reset({
    index: 0,
    routes: [{ name: "ProfileGate" }],
  });
}
