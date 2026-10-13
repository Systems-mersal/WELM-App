import { useMemo } from "react";

import { useCompanyVehicles } from "../features/vehicles";
import { filterVehiclesInRadius } from "../lib/vehicle-radius";
import { useLocationStore } from "../stores/location-store";
import type { Vehicle } from "../types";

/**
 * Company fleet for Home / Explore.
 * When the customer has a search point, only cars at branches inside that radius are shown.
 */
export function useFilteredVehicles(): {
  vehicles: Vehicle[];
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  refetch: () => void;
} {
  const { vehicles, isLoading, isError, refetch } = useCompanyVehicles();
  const latitude = useLocationStore((state) => state.latitude);
  const longitude = useLocationStore((state) => state.longitude);
  const radiusKm = useLocationStore((state) => state.radiusKm);

  const visible = useMemo(() => {
    if (latitude == null || longitude == null) {
      return vehicles;
    }
    const serverSentBranchPins = vehicles.some(
      (vehicle) => vehicle.latitude != null && vehicle.longitude != null,
    );
    if (!serverSentBranchPins) {
      return vehicles;
    }
    return filterVehiclesInRadius(vehicles, latitude, longitude, radiusKm);
  }, [latitude, longitude, radiusKm, vehicles]);

  return {
    vehicles: visible,
    isLoading,
    isError,
    isEmpty: !isLoading && visible.length === 0,
    refetch: () => {
      void refetch();
    },
  };
}
