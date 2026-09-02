import { useMemo } from "react";

import { MOCK_VEHICLES } from "../constants/vehicles";
import { filterVehiclesInRadius } from "../lib/vehicle-radius";
import { useLocationStore } from "../stores/location-store";
import type { Vehicle } from "../types";

/** Same filtered collection for Home and Explore. */
export function useFilteredVehicles(): Vehicle[] {
  const latitude = useLocationStore((state) => state.latitude);
  const longitude = useLocationStore((state) => state.longitude);
  const radiusKm = useLocationStore((state) => state.radiusKm);

  return useMemo(() => {
    if (latitude == null || longitude == null) {
      return [];
    }
    return filterVehiclesInRadius(
      MOCK_VEHICLES,
      latitude,
      longitude,
      radiusKm,
    );
  }, [latitude, longitude, radiusKm]);
}
