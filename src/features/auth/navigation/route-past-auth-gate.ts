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

/**
 * US-5 «متابعة كـ» — resume the parked session, then US-8.
 * Incomplete identity goes to Complete Profile. A finished profile lands on
 * Home, which still asks for location until a pin or city is saved.
 */
export function routeAfterAccountContinue(
  navigation: NavigationProp<RootStackParamList>,
  profileComplete: boolean,
): void {
  if (!profileComplete) {
    routePastAuthGate(navigation);
    return;
  }
  routeToHome(navigation);
}
