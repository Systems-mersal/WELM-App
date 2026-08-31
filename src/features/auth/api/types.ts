/** Typed contract for Tajeer Plus WELM auth HTTP APIs. */

export type WelmAuthProvider = "apple" | "google" | "x";

export type WelmAuthUser = {
  id: string;
  name: string;
  firstName?: string;
  email: string | null;
  phone?: string | null;
  handle?: string | null;
};

export type WelmAuthSession = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: WelmAuthUser;
  /** true when no verified +966 yet → US-3; false → existing consumer (US-5). */
  isNew: boolean;
  provider?: WelmAuthProvider;
};

export type WelmSocialAuthRequest = {
  provider: WelmAuthProvider;
  idToken?: string | null;
  accessToken?: string | null;
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
