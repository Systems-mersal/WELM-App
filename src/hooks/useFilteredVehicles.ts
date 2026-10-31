import { useMemo } from "react";

import { useCompanyVehicles } from "../features/vehicles";
import { filterVehiclesInRadius } from "../lib/vehicle-radius";
import { useLocationStore } from "../stores/location-store";
import type { Vehicle } from "../types";

/** Available cars inside the current map pin and search radius. */
export function useFilteredVehicles(): {
  vehicles: Vehicle[];
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  refetch: () => void;
} {
  const latitude = useLocationStore((state) => state.latitude);
  const longitude = useLocationStore((state) => state.longitude);
  const radiusKm = useLocationStore((state) => state.radiusKm);
  const { vehicles, isLoading, isFetching, isError, refetch } =
    useCompanyVehicles();

  const visible = useMemo(() => {
    if (latitude == null || longitude == null) {
      return vehicles;
    }
    return filterVehiclesInRadius(vehicles, latitude, longitude, radiusKm);
  }, [latitude, longitude, radiusKm, vehicles]);

  const waitingForMatch = isFetching && visible.length === 0;

  return {
    vehicles: visible,
    isLoading: isLoading || waitingForMatch,
    isError,
    isEmpty: !isLoading && !waitingForMatch && visible.length === 0,
    refetch: () => {
      void refetch();
    },
  };
}
