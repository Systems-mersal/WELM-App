import { create } from "zustand";

import type { SocialAuthSuccess } from "../features/auth/social/types";
import {
  clearAuthSession,
  loadAuthSession,
  saveAuthSession,
} from "../lib/auth-storage";

export type AuthUser = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
};

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  hydrated: boolean;
  /** Memory-only OAuth credential. Not a session — do not persist. */
  pendingSocial: SocialAuthSuccess | null;
  setPendingSocial: (credential: SocialAuthSuccess | null) => void;
  setSession: (
    accessToken: string,
    user: AuthUser,
    refreshToken?: string | null,
  ) => void;
  clearSession: () => void;
  hydrate: () => Promise<void>;
};

/** Client auth session — persist access + refresh for Tajeer Plus Bearer calls. */
export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  hydrated: false,
  pendingSocial: null,
  setPendingSocial: (credential) => {
    set({ pendingSocial: credential });
  },
  setSession: (accessToken, user, refreshToken = null) => {
    set({ accessToken, refreshToken, user, pendingSocial: null });
    void saveAuthSession({ accessToken, refreshToken, user });
  },
  clearSession: () => {
    set({
      accessToken: null,
      refreshToken: null,
      user: null,
      pendingSocial: null,
    });
    void clearAuthSession();
  },
  hydrate: async () => {
    if (get().hydrated) {
      return;
    }
    const stored = await loadAuthSession();
    if (stored) {
      set({
        accessToken: stored.accessToken,
        refreshToken: stored.refreshToken,
        user: stored.user,
        pendingSocial: null,
        hydrated: true,
      });
      return;
    }
    set({ hydrated: true, pendingSocial: null });
  },
}));
