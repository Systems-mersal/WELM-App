import type { NavigationProp } from "@react-navigation/native";

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

function hasChosenLocation(): boolean {
  const { status, latitude, longitude, cityKey } = useLocationStore.getState();
  if (status === "granted" || status === "city") {
    return latitude != null && longitude != null;
  }
  return Boolean(cityKey);
}

/** After identity — GPS rationale if location is unset; otherwise Home. */
export function routeAfterIdentity(
  navigation: NavigationProp<RootStackParamList>,
): void {
  if (hasChosenLocation()) {
    routeToHome(navigation);
    return;
  }
  navigation.reset({
    index: 0,
    routes: [{ name: "LocationRationale" }],
  });
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
 * Incomplete identity → Complete your details. Unset location → LocationRadius when
 * coordinates exist; otherwise Home (Enable Location card).
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

  if (!hasChosenLocation()) {
    const { latitude, longitude } = useLocationStore.getState();
    if (latitude != null && longitude != null) {
      resetToLocationRadius(navigation);
      return;
    }
    routeAfterIdentity(navigation);
    return;
  }

  routeToHome(navigation);
}
