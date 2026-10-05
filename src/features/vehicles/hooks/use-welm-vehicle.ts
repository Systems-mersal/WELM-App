import { useQuery } from "@tanstack/react-query";

import { useAuthStore } from "../../../stores/auth-store";
import type { Vehicle } from "../../../types";
import { fetchWelmVehicle, mapWelmVehicleDto } from "../api/welm-vehicles";
import { COMPANY_VEHICLES_QUERY_KEY } from "./use-company-vehicles";

export function useWelmVehicle(vehicleId: string | undefined) {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: [...COMPANY_VEHICLES_QUERY_KEY, "detail", vehicleId],
    enabled: Boolean(accessToken && vehicleId),
    queryFn: async (): Promise<Vehicle> => {
      const dto = await fetchWelmVehicle(vehicleId!);
      return mapWelmVehicleDto(dto);
    },
  });
}
