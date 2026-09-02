/** Typed contract for Tajeer Plus WELM auth HTTP APIs. */

export type WelmAuthProvider = "apple" | "google";

export type WelmAuthUser = {
  id: string;
  name: string;
  firstName?: string;
  email: string | null;
  phone?: string | null;
};

export type WelmAuthSession = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: WelmAuthUser;
  /** true when email/phone OTP is not done yet → confirm contact; false → existing consumer. */
  isNew: boolean;
  provider?: WelmAuthProvider;
};

export type WelmSocialAuthRequest = {
  provider: WelmAuthProvider;
  idToken?: string | null;
  accessToken?: string | null;
  refreshToken?: string | null;
  authorizationCode?: string | null;
  fullName?: string | null;
  nonce?: string | null;
  /** Native Apple email (first auth only). May be `@privaterelay.appleid.com`. */
  email?: string | null;
};

export type WelmMeResponse = {
  user: WelmAuthUser;
  isNew: boolean;
};

export type WelmPhoneStartResponse = {
  sent: boolean;
  phone: string;
};

export type WelmPhoneVerifyResponse = {
  verified: boolean;
  phone: string;
  isNew: boolean;
};

export type WelmEmailStartResponse = {
  sent: boolean;
  email: string;
  /** Local/dev only — omitted in production. */
  debugCode?: string;
};

export type WelmEmailVerifyResponse = {
  verified: boolean;
  email: string;
  isNew: boolean;
};

export type WelmAuthErrorCode =
  | "undeployed"
  | "disabled"
  | "unauthorized"
  | "invalid"
  | "network"
  | "unknown";

export class WelmAuthApiError extends Error {
  readonly code: WelmAuthErrorCode;
  readonly status?: number;

  constructor(code: WelmAuthErrorCode, message: string, status?: number) {
    super(message);
    this.name = "WelmAuthApiError";
    this.code = code;
    this.status = status;
  }
}

export function firstNameFromWelmUser(
  user: Pick<WelmAuthUser, "name" | "firstName">,
): string {
  const fromField = user.firstName?.trim();
  if (fromField) {
    return fromField;
  }
  const fromName = user.name.trim().split(/\s+/)[0];
  return fromName || "User";
}
