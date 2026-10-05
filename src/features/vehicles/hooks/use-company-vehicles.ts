import { useQuery } from "@tanstack/react-query";

import { useAuthStore } from "../../../stores/auth-store";
import type { Vehicle } from "../../../types";
import { fetchWelmVehicles, mapWelmVehicleDto } from "../api/welm-vehicles";

export const COMPANY_VEHICLES_QUERY_KEY = ["welm", "vehicles"] as const;

export function useCompanyVehicles() {
  const accessToken = useAuthStore((state) => state.accessToken);

  const query = useQuery({
    queryKey: [...COMPANY_VEHICLES_QUERY_KEY, accessToken ? "auth" : "anon"],
    enabled: Boolean(accessToken),
    queryFn: async (): Promise<Vehicle[]> => {
      const response = await fetchWelmVehicles({ page: 1, limit: 40 });
      return response.vehicles.map(mapWelmVehicleDto);
    },
  });

  return {
    vehicles: query.data ?? [],
    isLoading: query.isLoading || query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isEmpty: !query.isLoading && (query.data?.length ?? 0) === 0,
  };
}
