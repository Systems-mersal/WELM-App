import AsyncStorage from "@react-native-async-storage/async-storage";

import { parseCityKey, type CityKey } from "../constants/search-cities";

const LOCATION_KEY = "welm.deviceLocation.v1";

export type LocationRadiusKm = 10 | 25 | 50;
export type StoredLocationStatus = "granted" | "denied" | "skipped" | "city";

export const LOCATION_RADIUS_OPTIONS: readonly LocationRadiusKm[] = [10, 25, 50];
export const DEFAULT_RADIUS_KM: LocationRadiusKm = 10;

export type StoredDeviceLocation = {
  status: StoredLocationStatus;
  latitude?: number;
  longitude?: number;
  radiusKm?: LocationRadiusKm;
  cityKey?: CityKey;
};

export function parseRadiusKm(value: number | undefined): LocationRadiusKm {
  if (value === 10 || value === 25 || value === 50) {
    return value;
  }
  return DEFAULT_RADIUS_KM;
}

function isStoredStatus(value: string | undefined): value is StoredLocationStatus {
  return (
    value === "granted" ||
    value === "denied" ||
    value === "skipped" ||
    value === "city"
  );
}

export async function loadDeviceLocation(): Promise<StoredDeviceLocation | null> {
  const raw = await AsyncStorage.getItem(LOCATION_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<StoredDeviceLocation>;
    if (!isStoredStatus(parsed.status)) {
      return null;
    }
    const cityKey = parseCityKey(
      typeof parsed.cityKey === "string" ? parsed.cityKey : undefined,
    );
    return {
      status: parsed.status,
      latitude:
        typeof parsed.latitude === "number" ? parsed.latitude : undefined,
      longitude:
        typeof parsed.longitude === "number" ? parsed.longitude : undefined,
      radiusKm: parseRadiusKm(
        typeof parsed.radiusKm === "number" ? parsed.radiusKm : undefined,
      ),
      cityKey: cityKey ?? undefined,
    };
  } catch {
    return null;
  }
}

export async function saveDeviceLocation(
  location: StoredDeviceLocation,
): Promise<void> {
  await AsyncStorage.setItem(LOCATION_KEY, JSON.stringify(location));
}
