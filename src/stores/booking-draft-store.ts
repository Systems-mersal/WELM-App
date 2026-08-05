import { create } from "zustand";

export type BookingDraft = {
  vehicleId: string | null;
  startDate: string | null;
  endDate: string | null;
  extras: string[];
};

type BookingDraftState = BookingDraft & {
  setVehicleId: (vehicleId: string) => void;
  setDates: (startDate: string, endDate: string) => void;
  setExtras: (extras: string[]) => void;
  reset: () => void;
};

const initialDraft: BookingDraft = {
  vehicleId: null,
  startDate: null,
  endDate: null,
  extras: [],
};

/** In-progress booking draft across Dates → Extras → Review. */
export const useBookingDraftStore = create<BookingDraftState>((set) => ({
  ...initialDraft,
  setVehicleId: (vehicleId) => set({ vehicleId }),
  setDates: (startDate, endDate) => set({ startDate, endDate }),
  setExtras: (extras) => set({ extras }),
  reset: () => set(initialDraft),
}));
