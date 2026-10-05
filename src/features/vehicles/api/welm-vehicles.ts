import type { ImageSourcePropType } from "react-native";

import { VEHICLE_IMAGES } from "../../../constants/vehicles";
import { apiClient } from "../../../lib/api-client";
import type { Vehicle, VehicleCategory } from "../../../types";

export type WelmVehicleDto = {
  id: string;
  displayNumber: string | null;
  make: string;
  model: string;
  year: number | null;
  color: string | null;
  carClass: string | null;
  photos: string[];
  dailyRate: number;
  monthlyRate: number | null;
  branch: {
    id: string | null;
    name: string | null;
    city: string | null;
  };
  status: string;
};

export type WelmVehiclesResponse = {
  vehicles: WelmVehicleDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
};

export type WelmVehicleDetailResponse = {
  vehicle: WelmVehicleDto;
};

const FALLBACK_IMAGE: ImageSourcePropType = VEHICLE_IMAGES["range-rover"];

function mapCarClass(carClass: string | null): VehicleCategory {
  const value = (carClass ?? "").toLowerCase();
  if (value.includes("suv") || value.includes("crossover")) {
    return "suv";
  }
  if (value.includes("sport") || value.includes("coupe")) {
    return "sport";
  }
  if (value.includes("electric") || value.includes("ev")) {
    return "electric";
  }
  if (value.includes("luxury") || value.includes("premium")) {
    return "luxury";
  }
  if (value.includes("sedan") || value.includes("saloon")) {
    return "sedan";
  }
  return "luxury";
}

export function mapWelmVehicleDto(dto: WelmVehicleDto): Vehicle {
  const make = dto.make?.trim() || "Vehicle";
  const model = dto.model?.trim() || "";
  const displayName = [make, model].filter(Boolean).join(" ");
  const photoUri = dto.photos.find((url) => url.trim().length > 0);
  const branchLabel = dto.branch.name?.trim() || dto.branch.city?.trim();

  return {
    id: dto.id,
    displayName,
    brand: make,
    model: model || make,
    year: dto.year ?? undefined,
    pricePerDay: dto.dailyRate || 0,
    rating: 0,
    category: mapCarClass(dto.carClass),
    image: photoUri ?? "remote",
    imageSource: photoUri ? { uri: photoUri } : FALLBACK_IMAGE,
    locationLabel: branchLabel,
    seats: 5,
    transmission: "automatic",
    fuelType: "petrol",
    featured: false,
  };
}

export async function fetchWelmVehicles(options?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<WelmVehiclesResponse> {
  const { data } = await apiClient.get<WelmVehiclesResponse>("/api/welm/vehicles", {
    params: {
      page: options?.page ?? 1,
      limit: options?.limit ?? 40,
      search: options?.search || undefined,
    },
  });
  return data;
}

export async function fetchWelmVehicle(
  vehicleId: string,
): Promise<WelmVehicleDto> {
  const { data } = await apiClient.get<WelmVehicleDetailResponse>(
    `/api/welm/vehicles/${vehicleId}`,
  );
  if (!data?.vehicle?.id) {
    throw new Error("Invalid vehicle response");
  }
  return data.vehicle;
}
