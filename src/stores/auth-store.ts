import { create } from "zustand";

export type AuthUser = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
};

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  setSession: (token: string, user: AuthUser) => void;
  clearSession: () => void;
};

/** Client auth session store — wire to login/OTP when backend is ready. */
export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  setSession: (token, user) => set({ token, user }),
  clearSession: () => set({ token: null, user: null }),
}));
