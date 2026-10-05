import { useCompanyVehicles } from "../features/vehicles";
import type { Vehicle } from "../types";

/**
 * Company fleet for Home / Explore.
 * Geo radius filter is deferred until vehicle/branch coordinates exist in Tajeer Plus.
 */
export function useFilteredVehicles(): {
  vehicles: Vehicle[];
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  refetch: () => void;
} {
  const { vehicles, isLoading, isError, isEmpty, refetch } = useCompanyVehicles();

  return {
    vehicles,
    isLoading,
    isError,
    isEmpty,
    refetch: () => {
      void refetch();
    },
  };
}
