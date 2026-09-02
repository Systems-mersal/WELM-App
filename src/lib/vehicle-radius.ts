import {
  SEARCH_CITIES,
  type CityKey,
} from "../constants/search-cities";
import type { LocationRadiusKm } from "./location-storage";
import type { Vehicle } from "../types";

const EARTH_RADIUS_KM = 6371;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/** Great-circle distance in kilometers. */
export function haversineKm(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
): number {
  const dLat = toRadians(toLat - fromLat);
  const dLng = toRadians(toLng - fromLng);
  const lat1 = toRadians(fromLat);
  const lat2 = toRadians(toLat);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return 2 * EARTH_RADIUS_KM * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function filterVehiclesInRadius(
  vehicles: Vehicle[],
  latitude: number,
  longitude: number,
  radiusKm: LocationRadiusKm,
): Vehicle[] {
  return vehicles.filter((vehicle) => {
    if (vehicle.latitude == null || vehicle.longitude == null) {
      return false;
    }
    return (
      haversineKm(latitude, longitude, vehicle.latitude, vehicle.longitude) <=
      radiusKm
    );
  });
}

export function findNearestCityKey(
  latitude: number,
  longitude: number,
): CityKey {
  let nearest = SEARCH_CITIES[0];
  let nearestDistance = haversineKm(
    latitude,
    longitude,
    nearest.latitude,
    nearest.longitude,
  );
  for (const city of SEARCH_CITIES) {
    const distance = haversineKm(
      latitude,
      longitude,
      city.latitude,
      city.longitude,
    );
    if (distance < nearestDistance) {
      nearest = city;
      nearestDistance = distance;
    }
  }
  return nearest.cityKey;
}
