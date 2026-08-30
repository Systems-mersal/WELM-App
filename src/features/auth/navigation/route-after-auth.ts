import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import type { RootStackParamList } from "../../../navigation/types";
import type { WelmAuthSession } from "../api/types";

export type WelmPostAuthDestination = "link-mobile" | "home";

/**
 * US-2.6 — decide next screen from Tajeer Plus `isNew`.
 * isNew → US-3 Link Mobile (screen TBD)
 * !isNew → US-5 existing consumer home
 */
export function getWelmPostAuthDestination(
  session: Pick<WelmAuthSession, "isNew">,
): WelmPostAuthDestination {
  return session.isNew ? "link-mobile" : "home";
}

type AuthStackNavigation = NativeStackNavigationProp<
  RootStackParamList,
  "CreateAccount" | "Login"
>;

/**
 * Apply US-2.6 routing after a successful WELM session is stored.
 * Link-mobile UI (US-3) is not built yet — stay on Create Account so the
 * phone OTP path remains available. Existing users go to MainTabs.
 */
export function routeAfterWelmAuth(
  navigation: AuthStackNavigation,
  session: Pick<WelmAuthSession, "isNew">,
): void {
  const destination = getWelmPostAuthDestination(session);

  if (destination === "home") {
    navigation.replace("MainTabs");
    return;
  }

  // destination === "link-mobile" (US-3 TBD)
  // Prefer Create Account so the user can continue with Saudi mobile OTP.
  const state = navigation.getState();
  const current = state.routes[state.index]?.name;
  if (current !== "CreateAccount") {
    navigation.navigate("CreateAccount");
  }
}
