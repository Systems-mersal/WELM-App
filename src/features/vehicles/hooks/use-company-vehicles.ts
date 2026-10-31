import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { useAuthStore } from "../../../stores/auth-store";
import { useLocationStore } from "../../../stores/location-store";
import type { Vehicle } from "../../../types";
import { fetchWelmVehicles, mapWelmVehicleDto } from "../api/welm-vehicles";

export const COMPANY_VEHICLES_QUERY_KEY = ["welm", "vehicles"] as const;

function roundCoordinate(value: number): number {
  return Number(value.toFixed(4));
}

export function useCompanyVehicles() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const locationHydrated = useLocationStore((state) => state.hydrated);
  const latitude = useLocationStore((state) => state.latitude);
  const longitude = useLocationStore((state) => state.longitude);
  const radiusKm = useLocationStore((state) => state.radiusKm);
  const near =
    latitude != null && longitude != null
      ? {
          latitude: roundCoordinate(latitude),
          longitude: roundCoordinate(longitude),
          radiusKm,
        }
      : null;

  const query = useQuery({
    queryKey: [
      ...COMPANY_VEHICLES_QUERY_KEY,
      accessToken ? "auth" : "anon",
      near?.latitude ?? null,
      near?.longitude ?? null,
      near?.radiusKm ?? null,
    ],
    enabled: Boolean(accessToken) && locationHydrated,
    placeholderData: keepPreviousData,
    queryFn: async ({ queryKey }): Promise<Vehicle[]> => {
      const latitude = typeof queryKey[3] === "number" ? queryKey[3] : undefined;
      const longitude = typeof queryKey[4] === "number" ? queryKey[4] : undefined;
      const radius = typeof queryKey[5] === "number" ? queryKey[5] : undefined;
      const response = await fetchWelmVehicles({
        page: 1,
        limit: 100,
        latitude,
        longitude,
        radiusKm: radius,
      });
      return response.vehicles.map(mapWelmVehicleDto);
    },
  });

  const isLoading = !locationHydrated || query.isPending;

  return {
    vehicles: query.data ?? [],
    isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isEmpty:
      locationHydrated &&
      !isLoading &&
      !query.isFetching &&
      (query.data?.length ?? 0) === 0,
  };
}
