import * as Location from "expo-location";

export type ForegroundLocationResult =
  | { ok: true; latitude: number; longitude: number }
  | { ok: false; reason: "denied" | "unavailable" | "failed" };

/** One-shot foreground fix. No background tracking. */
export async function requestForegroundLocation(): Promise<ForegroundLocationResult> {
  try {
    const servicesOn = await Location.hasServicesEnabledAsync();
    if (!servicesOn) {
      return { ok: false, reason: "unavailable" };
    }

    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== Location.PermissionStatus.GRANTED) {
      return { ok: false, reason: "denied" };
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      ok: true,
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
  } catch {
    return { ok: false, reason: "failed" };
  }
}
