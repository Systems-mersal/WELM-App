import type { NavigationProp } from "@react-navigation/native";

import { consumePendingPush } from "../../notifications/open-from-push";
import type { RootStackParamList } from "../../../navigation/types";
import { useAuthStore } from "../../../stores/auth-store";
import { useLocationStore } from "../../../stores/location-store";

/** Existing consumer — skip Complete profile (sign-in). */
export function routeToHome(
  navigation: NavigationProp<RootStackParamList>,
): void {
  navigation.reset({
    index: 0,
    routes: [{ name: "MainTabs" }],
  });
  queueMicrotask(() => {
    consumePendingPush(navigation);
  });
}

/**
 * Incomplete customer profile — Complete your details.
 * A finished customer row must call `routeToHome` instead.
 */
export function routePastAuthGate(
  navigation: NavigationProp<RootStackParamList>,
): void {
  const phone = useAuthStore.getState().user?.phone;
  navigation.reset({
    index: 0,
    routes: [{ name: "CompleteIdentity", params: phone ? { phone } : undefined }],
  });
}

function hasCompletedProfile(): boolean {
  const user = useAuthStore.getState().user;
  return Boolean(user?.name?.trim() && user?.nationalId?.trim());
}

/** After identity — Home. The main screen asks for the current location itself. */
export function routeAfterIdentity(
  navigation: NavigationProp<RootStackParamList>,
): void {
  routeToHome(navigation);
}

/** Allow / city pick → Home under confirm-radius (US-14). */
export function resetToLocationRadius(
  navigation: NavigationProp<RootStackParamList>,
): void {
  navigation.reset({
    index: 1,
    routes: [{ name: "MainTabs" }, { name: "LocationRadius" }],
  });
}

/**
 * US-5 «متابعة كـ»: open the parked session, then US-8.
 * Incomplete identity → Complete your details. Otherwise Home, which places
 * the current-location pin and loads nearby cars.
 */
export async function routeAfterContinueAs(
  navigation: NavigationProp<RootStackParamList>,
): Promise<void> {
  if (!hasCompletedProfile()) {
    routePastAuthGate(navigation);
    return;
  }

  const location = useLocationStore.getState();
  if (!location.hydrated) {
    await location.hydrate();
  }

  routeToHome(navigation);
}
