import type { NavigationProp } from "@react-navigation/native";

import type { RootStackParamList } from "../../../navigation/types";

/**
 * US-8 — never open Home / MainTabs after social or signup OTP.
 * Profile + location fields are US-9.
 */
export function routePastAuthGate(
  navigation: NavigationProp<RootStackParamList>,
): void {
  navigation.reset({
    index: 0,
    routes: [{ name: "ProfileGate" }],
  });
}
