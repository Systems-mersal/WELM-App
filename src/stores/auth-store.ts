import { create } from "zustand";

import type { WelmAuthSession } from "../features/auth/api/types";
import {
  isLicenseType,
  isNationalityCode,
  type LicenseType,
  type NationalityCode,
} from "../features/auth/profile/lookups";
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
  /** Local-only until PATCH /api/welm/profile exists (US-10). */
  nationalId?: string;
  dateOfBirth?: string;
  dateOfBirthHijri?: string;
  licenseNumber?: string;
  licenseType?: LicenseType;
  nationality?: NationalityCode;
};

export type LocalProfileFields = Pick<
  AuthUser,
  | "nationalId"
  | "dateOfBirth"
  | "dateOfBirthHijri"
  | "licenseNumber"
  | "licenseType"
  | "nationality"
>;

export function copyLocalProfileFields(
  current: AuthUser | null | undefined,
  userId: string,
): LocalProfileFields {
  if (!current || current.id !== userId) {
    return {};
  }
  return {
    nationalId: current.nationalId,
    dateOfBirth: current.dateOfBirth,
    dateOfBirthHijri: current.dateOfBirthHijri,
    licenseNumber: current.licenseNumber,
    licenseType: current.licenseType,
    nationality: current.nationality,
  };
}

function userFromStored(user: {
  id: string;
  name: string;
  firstName?: string;
  phone?: string;
  email?: string;
  nationalId?: string;
  dateOfBirth?: string;
  dateOfBirthHijri?: string;
  licenseNumber?: string;
  licenseType?: string;
  nationality?: string;
}): AuthUser {
  return {
    id: user.id,
    name: user.name,
    firstName: user.firstName,
    phone: user.phone,
    email: user.email,
    nationalId: user.nationalId,
    dateOfBirth: user.dateOfBirth,
    dateOfBirthHijri: user.dateOfBirthHijri,
    licenseNumber: user.licenseNumber,
    licenseType: isLicenseType(user.licenseType) ? user.licenseType : undefined,
    nationality: isNationalityCode(user.nationality)
      ? user.nationality
      : undefined,
  };
}

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
  updateUser: (patch: Partial<AuthUser>) => void;
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
  updateUser: (patch) => {
    const { user, accessToken, refreshToken } = get();
    if (!user || !accessToken) {
      return;
    }
    const next = { ...user, ...patch };
    set({ user: next });
    void saveAuthSession({ accessToken, refreshToken, user: next });
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
        user: userFromStored(stored.user),
        pendingSocial: null,
        pendingSession: null,
        hydrated: true,
      });
      return;
    }
    set({ hydrated: true, pendingSocial: null, pendingSession: null });
  },
}));
