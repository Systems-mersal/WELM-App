export type CityKey = "riyadh" | "jeddah" | "dammam" | "khobar";

export type SearchCity = {
  cityKey: CityKey;
  latitude: number;
  longitude: number;
};

/** City-center coordinates for mock search/fallback. Not dealership pins. */
export const SEARCH_CITIES: readonly SearchCity[] = [
  { cityKey: "riyadh", latitude: 24.7136, longitude: 46.6753 },
  { cityKey: "jeddah", latitude: 21.5433, longitude: 39.1728 },
  { cityKey: "dammam", latitude: 26.4207, longitude: 50.0888 },
  { cityKey: "khobar", latitude: 26.2172, longitude: 50.1971 },
];

const CITY_BY_KEY: Record<CityKey, SearchCity> = {
  riyadh: SEARCH_CITIES[0],
  jeddah: SEARCH_CITIES[1],
  dammam: SEARCH_CITIES[2],
  khobar: SEARCH_CITIES[3],
};

export function isCityKey(value: string): value is CityKey {
  return value === "riyadh" || value === "jeddah" || value === "dammam" || value === "khobar";
}

export function getSearchCity(cityKey: CityKey): SearchCity {
  return CITY_BY_KEY[cityKey];
}

export function parseCityKey(value: string | undefined): CityKey | null {
  if (value == null || !isCityKey(value)) {
    return null;
  }
  return value;
}
