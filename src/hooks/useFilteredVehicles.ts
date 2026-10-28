import { useCompanyVehicles } from "../features/vehicles";
import type { Vehicle } from "../types";

/** All available cars for Home / Explore (not scoped to company or radius). */
export function useFilteredVehicles(): {
  vehicles: Vehicle[];
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  refetch: () => void;
} {
  const { vehicles, isLoading, isError, refetch } = useCompanyVehicles();

  return {
    vehicles,
    isLoading,
    isError,
    isEmpty: !isLoading && vehicles.length === 0,
    refetch: () => {
      void refetch();
    },
  };
}
