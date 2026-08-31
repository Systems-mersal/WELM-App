import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import type { RootStackParamList } from "../../../navigation/types";
import type { WelmAuthProvider, WelmAuthSession } from "../api/types";
import { completeSocialSignIn } from "../session/apply-welm-auth";
import type { WelmPostAuthDestination } from "../session/destination";

export type { WelmPostAuthDestination };
export { getWelmPostAuthDestination } from "../session/destination";

type AuthStackNavigation = NativeStackNavigationProp<
  RootStackParamList,
  "CreateAccount" | "Login"
>;

function resolveProvider(
  session: WelmAuthSession,
  fallback?: string,
): WelmAuthProvider {
  const value = session.provider ?? fallback;
  if (value === "google" || value === "x" || value === "apple") {
    return value;
  }
  return "apple";
}

/**
 * Persist or park the session, then route US-3 / US-5.
 */
export function routeAfterWelmAuth(
  navigation: AuthStackNavigation,
  session: WelmAuthSession,
  provider?: string,
): void {
  const destination = completeSocialSignIn(session);

  if (destination === "link-mobile") {
    navigation.replace("LinkMobile", {
      provider: resolveProvider(session, provider),
    });
    return;
  }

  navigation.replace("AccountExists");
}
