import { create } from "zustand";

export type BookingDraft = {
  vehicleId: string | null;
  startDate: string | null;
  endDate: string | null;
  pickupLocation: string | null;
  returnLocation: string | null;
  extras: string[];
  quotedDays: number;
  quotedDailyRate: number;
  quotedExtrasTotal: number;
  quotedSubtotal: number;
  quotedVat: number;
  quotedTotal: number;
  lastBookingId: string | null;
};

type BookingDraftState = BookingDraft & {
  setVehicleId: (vehicleId: string) => void;
  setDates: (startDate: string, endDate: string) => void;
  setLocations: (
    pickupLocation: string | null,
    returnLocation: string | null,
  ) => void;
  setQuote: (quote: {
    quotedDays: number;
    quotedDailyRate: number;
    quotedExtrasTotal?: number;
    quotedSubtotal: number;
    quotedVat: number;
    quotedTotal: number;
  }) => void;
  setExtras: (extras: string[]) => void;
  setLastBookingId: (id: string | null) => void;
  reset: () => void;
};

const initialDraft: BookingDraft = {
  vehicleId: null,
  startDate: null,
  endDate: null,
  pickupLocation: null,
  returnLocation: null,
  extras: [],
  quotedDays: 0,
  quotedDailyRate: 0,
  quotedExtrasTotal: 0,
  quotedSubtotal: 0,
  quotedVat: 0,
  quotedTotal: 0,
  lastBookingId: null,
};

/** In-progress booking draft across Dates → Extras → Review. */
export const useBookingDraftStore = create<BookingDraftState>((set) => ({
  ...initialDraft,
  setVehicleId: (vehicleId) => set({ vehicleId }),
  setDates: (startDate, endDate) => set({ startDate, endDate }),
  setLocations: (pickupLocation, returnLocation) =>
    set({ pickupLocation, returnLocation }),
  setQuote: (quote) =>
    set({
      quotedDays: quote.quotedDays,
      quotedDailyRate: quote.quotedDailyRate,
      quotedExtrasTotal: quote.quotedExtrasTotal ?? 0,
      quotedSubtotal: quote.quotedSubtotal,
      quotedVat: quote.quotedVat,
      quotedTotal: quote.quotedTotal,
    }),
  setExtras: (extras) => set({ extras }),
  setLastBookingId: (lastBookingId) => set({ lastBookingId }),
  reset: () => set(initialDraft),
}));
