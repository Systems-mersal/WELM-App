import type { Booking } from "../types";
import activeMercedes from "../assets/figma/bookings/active-mercedes.png";
import pastBmw from "../assets/figma/bookings/past-bmw.png";

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: "booking-active-1",
    vehicleId: "mercedes-e350",
    startDate: "2026-08-01",
    endDate: "2026-08-05",
    status: "active",
    totalPrice: 2400,
    progress: 0.45,
    imageSource: activeMercedes,
  },
  {
    id: "booking-past-1",
    vehicleId: "bmw-x5",
    startDate: "2026-07-10",
    endDate: "2026-07-14",
    status: "past",
    totalPrice: 1800,
    imageSource: pastBmw,
  },
  {
    id: "booking-past-2",
    vehicleId: "audi-a8",
    startDate: "2026-06-01",
    endDate: "2026-06-03",
    status: "past",
    totalPrice: 1600,
    imageSource: pastBmw,
  },
];
