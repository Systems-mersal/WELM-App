import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import type { RootStackParamList } from "../../../navigation/types";
import type { WelmAuthProvider, WelmAuthSession } from "../api/types";
import {
  commitPendingWelmSession,
  completeSocialSignIn,
} from "../session/apply-welm-auth";
import type { WelmPostAuthDestination } from "../session/destination";
import { routeToHome } from "./route-past-auth-gate";

export type { WelmPostAuthDestination };
export { getWelmPostAuthDestination } from "../session/destination";

export type WelmAuthEntry = "login" | "signup";

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
 * Persist or park the session, then route:
 * - new consumer → Link Mobile (signup)
 * - existing + Create Account → Account Exists
 * - existing + Login → Home (skip Complete profile)
 */
export function routeAfterWelmAuth(
  navigation: AuthStackNavigation,
  session: WelmAuthSession,
  provider?: string,
  entry: WelmAuthEntry = "signup",
): void {
  const destination = completeSocialSignIn(session);

  if (destination === "link-mobile") {
    navigation.replace("LinkMobile", {
      provider: resolveProvider(session, provider),
    });
    return;
  }

  if (entry === "login") {
    commitPendingWelmSession();
    routeToHome(navigation);
    return;
  }

  navigation.replace("AccountExists");
}
