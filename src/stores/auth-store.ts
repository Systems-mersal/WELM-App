import { create } from "zustand";

import type { WelmAuthSession } from "../features/auth/api/types";
import {
  isIdDocumentType,
  isLicenseType,
  isNationalityCode,
  type IdDocumentType,
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
  /** Apple / Google only — used for Complete Profile mint pills. */
  provider?: "apple" | "google";
  /** false until the email OTP step succeeds (email + password signup). */
  emailVerified?: boolean;
  /** Contact used to open this session. Locks that field on Complete your details. */
  signInMethod?: "email" | "phone";
  nationalId?: string;
  idDocumentType?: IdDocumentType;
  dateOfBirth?: string;
  dateOfBirthHijri?: string;
  licenseNumber?: string;
  licenseType?: LicenseType;
  licenseExpiry?: string;
  placeOfIssue?: string;
  nationality?: NationalityCode;
};

export type LocalProfileFields = Pick<
  AuthUser,
  | "nationalId"
  | "idDocumentType"
  | "dateOfBirth"
  | "dateOfBirthHijri"
  | "licenseNumber"
  | "licenseType"
  | "licenseExpiry"
  | "placeOfIssue"
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
    idDocumentType: current.idDocumentType,
    dateOfBirth: current.dateOfBirth,
    dateOfBirthHijri: current.dateOfBirthHijri,
    licenseNumber: current.licenseNumber,
    licenseType: current.licenseType,
    licenseExpiry: current.licenseExpiry,
    placeOfIssue: current.placeOfIssue,
    nationality: current.nationality,
  };
}

function userFromStored(user: {
  id: string;
  name: string;
  firstName?: string;
  phone?: string;
  email?: string;
  provider?: string;
  emailVerified?: boolean;
  signInMethod?: string;
  nationalId?: string;
  idDocumentType?: string;
  dateOfBirth?: string;
  dateOfBirthHijri?: string;
  licenseNumber?: string;
  licenseType?: string;
  licenseExpiry?: string;
  placeOfIssue?: string;
  nationality?: string;
}): AuthUser {
  return {
    id: user.id,
    name: user.name,
    firstName: user.firstName,
    phone: user.phone,
    email: user.email,
    provider:
      user.provider === "apple" || user.provider === "google"
        ? user.provider
        : undefined,
    emailVerified: user.emailVerified,
    signInMethod:
      user.signInMethod === "email" || user.signInMethod === "phone"
        ? user.signInMethod
        : undefined,
    nationalId: user.nationalId,
    idDocumentType: isIdDocumentType(user.idDocumentType)
      ? user.idDocumentType
      : undefined,
    dateOfBirth: user.dateOfBirth,
    dateOfBirthHijri: user.dateOfBirthHijri,
    licenseNumber: user.licenseNumber,
    licenseType: isLicenseType(user.licenseType) ? user.licenseType : undefined,
    licenseExpiry: user.licenseExpiry,
    placeOfIssue: user.placeOfIssue,
    nationality: isNationalityCode(user.nationality)
      ? user.nationality
      : undefined,
  };
}

export function resolveSignInMethod(
  user: Pick<AuthUser, "signInMethod" | "email" | "phone"> | null | undefined,
): "email" | "phone" {
  if (user?.signInMethod === "email" || user?.signInMethod === "phone") {
    return user.signInMethod;
  }
  const email = user?.email?.trim() ?? "";
  const phone = (user?.phone ?? "").replace(/\s+/g, "");
  const realEmail = email.length > 0 && !email.endsWith("@consumers.welm");
  const saudiPhone = /^\+9665\d{8}$/.test(phone);
  if (saudiPhone && !realEmail) {
    return "phone";
  }
  return "email";
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
  /**
   * Local identity saved on this device for the parked user.
   * Survives US-5 `clearSession` so Continue-as can run the US-8 gate.
   */
  pendingProfile: LocalProfileFields | null;
  setPendingSocial: (credential: SocialAuthSuccess | null) => void;
  setPendingSession: (
    session: WelmAuthSession | null,
    profile?: LocalProfileFields | null,
  ) => void;
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
  pendingProfile: null,
  setPendingSocial: (credential) => {
    set({ pendingSocial: credential });
  },
  setPendingSession: (session, profile = null) => {
    set({
      pendingSession: session,
      pendingProfile: session ? (profile ?? null) : null,
    });
  },
  setSession: (accessToken, user, refreshToken = null) => {
    set({
      accessToken,
      refreshToken,
      user,
      pendingSocial: null,
      pendingSession: null,
      pendingProfile: null,
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
      pendingProfile: null,
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
        pendingProfile: null,
        hydrated: true,
      });
      return;
    }
    set({
      hydrated: true,
      pendingSocial: null,
      pendingSession: null,
      pendingProfile: null,
    });
  },
}));
