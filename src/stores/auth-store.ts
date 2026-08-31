import { create } from "zustand";

import type { WelmAuthSession } from "../features/auth/api/types";
import type { SocialAuthSuccess } from "../features/auth/social/types";
import {
  clearAuthSession,
  loadAuthSession,
  saveAuthSession,
} from "../lib/auth-storage";

export type AuthUser = {
  id: string;
  name: string;
  firstName?: string;
  phone?: string;
  email?: string;
  handle?: string;
};

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  hydrated: boolean;
  /** Memory-only OAuth credential. Not a session — do not persist. */
  pendingSocial: SocialAuthSuccess | null;
  /**
   * Existing WELM consumer (US-5). Tokens stay in memory until
   * "continue as {firstName}". Never written to auth-storage.
   */
  pendingSession: WelmAuthSession | null;
  setPendingSocial: (credential: SocialAuthSuccess | null) => void;
  setPendingSession: (session: WelmAuthSession | null) => void;
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
  pendingSession: null,
  setPendingSocial: (credential) => {
    set({ pendingSocial: credential });
  },
  setPendingSession: (session) => {
    set({ pendingSession: session });
  },
  setSession: (accessToken, user, refreshToken = null) => {
    set({
      accessToken,
      refreshToken,
      user,
      pendingSocial: null,
      pendingSession: null,
    });
    void saveAuthSession({ accessToken, refreshToken, user });
  },
  clearSession: () => {
    set({
      accessToken: null,
      refreshToken: null,
      user: null,
      pendingSocial: null,
      pendingSession: null,
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
        pendingSession: null,
        hydrated: true,
      });
      return;
    }
    set({ hydrated: true, pendingSocial: null, pendingSession: null });
  },
}));
