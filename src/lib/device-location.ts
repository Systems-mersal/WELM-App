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

export type PlaceSearchResult = {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  subtitle: string;
};

const MAX_PLACE_RESULTS = 5;

function joinParts(parts: Array<string | null | undefined>): string {
  return Array.from(
    new Set(parts.map((part) => part?.trim()).filter(Boolean) as string[]),
  ).join(", ");
}

/**
 * Address / place text → coordinates with readable labels.
 * Call on submit only — the OS geocoder rate-limits frequent requests.
 */
export async function searchPlaces(query: string): Promise<PlaceSearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  const matches = (await Location.geocodeAsync(trimmed)).slice(
    0,
    MAX_PLACE_RESULTS,
  );

  return Promise.all(
    matches.map(async (match, index) => {
      let title = trimmed;
      let subtitle = "";
      try {
        const [address] = await Location.reverseGeocodeAsync({
          latitude: match.latitude,
          longitude: match.longitude,
        });
        if (address) {
          title =
            address.name || address.district || address.city || trimmed;
          subtitle = joinParts([
            address.district !== title ? address.district : null,
            address.city !== title ? address.city : null,
            address.region,
            address.country,
          ]);
        }
      } catch {
        // Keep the typed text as the label.
      }
      return {
        id: `${match.latitude},${match.longitude},${index}`,
        latitude: match.latitude,
        longitude: match.longitude,
        title,
        subtitle,
      };
    }),
  );
}
