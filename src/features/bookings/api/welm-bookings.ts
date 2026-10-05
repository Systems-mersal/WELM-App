import { apiClient } from "../../../lib/api-client";

export type WelmBookingTimelineStep = {
  key:
    | "pending_approval"
    | "approved"
    | "contract_creation"
    | "awaiting_payment"
    | "vehicle_delivered";
  status: "done" | "current" | "upcoming";
};

export type WelmBookingDto = {
  id: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  paymentStatus?: "none" | "awaiting" | "paid" | "failed";
  vehicleId: string;
  vehicle: {
    id: string;
    make: string;
    model: string;
    displayNumber: string | null;
    photos: string[];
    dailyRate: number;
    branch: { id: string | null; name: string | null; city: string | null };
  } | null;
  startAt: string;
  endAt: string;
  pickupLocation: string | null;
  returnLocation: string | null;
  quotedDailyRate: number;
  quotedDays: number;
  quotedExtrasTotal: number;
  quotedSubtotal: number;
  quotedVat: number;
  quotedTotal: number;
  currency: string;
  contractId: string | null;
  createdAt: string;
  timeline: WelmBookingTimelineStep[];
};

export const VAT_RATE = 0.15;

export function computeInclusiveDays(start: Date, end: Date): number {
  const startUtc = Date.UTC(
    start.getFullYear(),
    start.getMonth(),
    start.getDate(),
  );
  const endUtc = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.max(1, Math.floor((endUtc - startUtc) / 86_400_000) + 1);
}

export function computeLocalQuote(dailyRate: number, days: number, extrasTotal = 0) {
  const rental = Math.max(0, dailyRate) * Math.max(1, days);
  const subtotal = rental + Math.max(0, extrasTotal);
  const vat = Math.round(subtotal * VAT_RATE * 100) / 100;
  const total = Math.round((subtotal + vat) * 100) / 100;
  return {
    quotedDays: Math.max(1, days),
    quotedDailyRate: Math.max(0, dailyRate),
    quotedExtrasTotal: Math.max(0, extrasTotal),
    quotedSubtotal: Math.round(subtotal * 100) / 100,
    quotedVat: vat,
    quotedTotal: total,
  };
}

export function toStartOfDayIso(date: Date, hour = 10, minute = 0): string {
  const d = new Date(date);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export function toEndOfDayIso(date: Date, hour = 16, minute = 0): string {
  const d = new Date(date);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export async function createWelmBooking(input: {
  vehicleId: string;
  startAt: string;
  endAt: string;
  pickupLocation?: string | null;
  returnLocation?: string | null;
  extras?: Array<{ code?: string; name?: string; amount?: number }>;
}): Promise<WelmBookingDto> {
  const { data } = await apiClient.post<{ booking: WelmBookingDto }>(
    "/api/welm/bookings",
    input,
  );
  if (!data?.booking?.id) {
    throw new Error("Invalid booking response");
  }
  return data.booking;
}

export async function fetchWelmBookings(): Promise<WelmBookingDto[]> {
  const { data } = await apiClient.get<{ bookings: WelmBookingDto[] }>(
    "/api/welm/bookings",
  );
  return data?.bookings ?? [];
}

export async function fetchWelmBooking(
  bookingId: string,
): Promise<WelmBookingDto> {
  const { data } = await apiClient.get<{ booking: WelmBookingDto }>(
    `/api/welm/bookings/${bookingId}`,
  );
  if (!data?.booking?.id) {
    throw new Error("Invalid booking response");
  }
  return data.booking;
}

export async function confirmWelmBookingPayment(input: {
  bookingId: string;
  paymentIntentId: string;
  amountCents: number;
  currency?: string;
}): Promise<WelmBookingDto> {
  const { data } = await apiClient.post<{ booking: WelmBookingDto }>(
    `/api/welm/bookings/${input.bookingId}/confirm-payment`,
    {
      paymentIntentId: input.paymentIntentId,
      amountCents: input.amountCents,
      currency: input.currency ?? "sar",
    },
  );
  if (!data?.booking?.id) {
    throw new Error("Invalid confirm-payment response");
  }
  return data.booking;
}

export function bookingNeedsPayment(booking: WelmBookingDto): boolean {
  if (booking.paymentStatus === "awaiting") return true;
  if (booking.paymentStatus === "paid") return false;
  return booking.timeline.some(
    (s) => s.key === "awaiting_payment" && s.status === "current",
  );
}

export function quotedTotalToCents(quotedTotal: number): number {
  return Math.round(Math.max(0, quotedTotal) * 100);
}
