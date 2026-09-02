import { create } from "zustand";

import { getSearchCity, type CityKey } from "../constants/search-cities";
import { requestForegroundLocation } from "../lib/device-location";
import {
  DEFAULT_RADIUS_KM,
  loadDeviceLocation,
  parseRadiusKm,
  saveDeviceLocation,
  type LocationRadiusKm,
  type StoredDeviceLocation,
  type StoredLocationStatus,
} from "../lib/location-storage";

export type LocationPromptStatus = "idle" | StoredLocationStatus;

type LocationState = {
  hydrated: boolean;
  status: LocationPromptStatus;
  latitude: number | null;
  longitude: number | null;
  radiusKm: LocationRadiusKm;
  cityKey: CityKey | null;
  requesting: boolean;
  hydrate: () => Promise<void>;
  enableLocation: () => Promise<"granted" | "denied" | "unavailable" | "failed">;
  skipLocation: () => void;
  selectCity: (cityKey: CityKey) => void;
  setRadiusKm: (radiusKm: LocationRadiusKm) => void;
};

function persistSnapshot(state: {
  status: StoredLocationStatus;
  latitude: number | null;
  longitude: number | null;
  radiusKm: LocationRadiusKm;
  cityKey: CityKey | null;
}): void {
  const payload: StoredDeviceLocation = {
    status: state.status,
    radiusKm: state.radiusKm,
  };
  if (state.latitude != null && state.longitude != null) {
    payload.latitude = state.latitude;
    payload.longitude = state.longitude;
  }
  if (state.cityKey) {
    payload.cityKey = state.cityKey;
  }
  saveDeviceLocation(payload).catch(() => undefined);
}

export const useLocationStore = create<LocationState>((set, get) => ({
  hydrated: false,
  status: "idle",
  latitude: null,
  longitude: null,
  radiusKm: DEFAULT_RADIUS_KM,
  cityKey: null,
  requesting: false,
  hydrate: async () => {
    if (get().hydrated) {
      return;
    }
    const stored = await loadDeviceLocation();
    if (stored) {
      set({
        status: stored.status,
        latitude: stored.latitude ?? null,
        longitude: stored.longitude ?? null,
        radiusKm: parseRadiusKm(stored.radiusKm),
        cityKey: stored.cityKey ?? null,
        hydrated: true,
      });
      return;
    }
    set({ hydrated: true });
  },
  enableLocation: async () => {
    if (get().requesting) {
      return "failed";
    }
    set({ requesting: true });
    const result = await requestForegroundLocation();
    if (result.ok) {
      const radiusKm = get().radiusKm;
      const next = {
        status: "granted" as const,
        latitude: result.latitude,
        longitude: result.longitude,
        radiusKm,
        cityKey: null,
        requesting: false,
      };
      set(next);
      persistSnapshot(next);
      return "granted";
    }
    if (result.reason === "denied") {
      const next = {
        status: "denied" as const,
        latitude: null as number | null,
        longitude: null as number | null,
        requesting: false,
      };
      set(next);
      persistSnapshot({
        status: "denied",
        latitude: null,
        longitude: null,
        radiusKm: get().radiusKm,
        cityKey: null,
      });
      return "denied";
    }
    set({ requesting: false });
    return result.reason;
  },
  skipLocation: () => {
    const radiusKm = get().radiusKm;
    set({
      status: "skipped",
      latitude: null,
      longitude: null,
      cityKey: null,
    });
    persistSnapshot({
      status: "skipped",
      latitude: null,
      longitude: null,
      radiusKm,
      cityKey: null,
    });
  },
  selectCity: (cityKey) => {
    const city = getSearchCity(cityKey);
    const radiusKm = get().radiusKm;
    const next = {
      status: "city" as const,
      cityKey,
      latitude: city.latitude,
      longitude: city.longitude,
      radiusKm,
    };
    set(next);
    persistSnapshot({ ...next, cityKey });
  },
  setRadiusKm: (radiusKm) => {
    const { status, latitude, longitude, cityKey } = get();
    set({ radiusKm });
    if (
      (status === "granted" || status === "city") &&
      latitude != null &&
      longitude != null
    ) {
      persistSnapshot({
        status,
        latitude,
        longitude,
        radiusKm,
        cityKey,
      });
    }
  },
}));
