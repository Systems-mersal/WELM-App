import type { ImageSourcePropType } from "react-native";

export type VehicleCategory =
  | "luxury"
  | "electric"
  | "sport"
  | "sedan"
  | "suv";

export interface Vehicle {
  id: string;
  nameKey: string;
  brand: string;
  model: string;
  year?: number;
  pricePerDay: number;
  rating: number;
  category: VehicleCategory;
  image: string;
  imageSource: ImageSourcePropType;
  locationKey?: string;
  seats: number;
  transmission: "automatic" | "manual";
  fuelType: string;
  instantBook?: boolean;
  featured?: boolean;
  favorite?: boolean;
}

export interface Booking {
  id: string;
  vehicleId: string;
  startDate: string;
  endDate: string;
  status: "active" | "upcoming" | "past";
  totalPrice: number;
  progress?: number;
  imageSource?: ImageSourcePropType;
}
