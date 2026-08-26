import { create } from "zustand";

import type { SocialAuthSuccess } from "../features/auth/social/types";

export type AuthUser = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
};

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  /** Memory-only OAuth credential. Not a session — do not persist. */
  pendingSocial: SocialAuthSuccess | null;
  setPendingSocial: (credential: SocialAuthSuccess | null) => void;
  setSession: (token: string, user: AuthUser) => void;
  clearSession: () => void;
};

/** Client auth session store — wire to login/OTP when backend is ready. */
export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  pendingSocial: null,
  setPendingSocial: (credential) => {
    set({ pendingSocial: credential });
  },
  setSession: (token, user) => set({ token, user, pendingSocial: null }),
  clearSession: () => set({ token: null, user: null, pendingSocial: null }),
}));
