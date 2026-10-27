import { useQuery } from "@tanstack/react-query";

import { useAuthStore } from "../../../stores/auth-store";
import { useLocationStore } from "../../../stores/location-store";
import type { Vehicle } from "../../../types";
import { fetchWelmVehicles, mapWelmVehicleDto } from "../api/welm-vehicles";

export const COMPANY_VEHICLES_QUERY_KEY = ["welm", "vehicles"] as const;

export function useCompanyVehicles() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const locationHydrated = useLocationStore((state) => state.hydrated);

  const query = useQuery({
    queryKey: [...COMPANY_VEHICLES_QUERY_KEY, accessToken ? "auth" : "anon"],
    enabled: Boolean(accessToken) && locationHydrated,
    queryFn: async (): Promise<Vehicle[]> => {
      const response = await fetchWelmVehicles({
        page: 1,
        limit: 40,
      });
      return response.vehicles.map(mapWelmVehicleDto);
    },
  });

  const isLoading = !locationHydrated || query.isLoading || query.isFetching;

  return {
    vehicles: query.data ?? [],
    isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isEmpty: locationHydrated && !isLoading && (query.data?.length ?? 0) === 0,
  };
}
