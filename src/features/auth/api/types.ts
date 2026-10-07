/** Typed contract for Tajeer Plus WELM auth HTTP APIs. */

export type WelmAuthProvider = "apple" | "google";

export type WelmAuthUser = {
  id: string;
  name: string;
  firstName?: string;
  email: string | null;
  phone?: string | null;
  /** false → email signup that still needs the email OTP step. */
  emailVerified?: boolean;
};

export type WelmAuthSession = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: WelmAuthUser;
  /** true when email/phone OTP is not done yet → confirm contact; false → existing consumer. */
  isNew: boolean;
  /**
   * Identity form already saved on Tajeer. False → Complete Profile (US-8)
   * after «متابعة كـ».
   */
  profileComplete?: boolean;
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
  resendInSeconds?: number;
  /** Local/dev only — omitted in production. */
  debugCode?: string;
};

export type WelmEmailVerifyResponse = {
  verified: boolean;
  email: string;
  isNew: boolean;
};

export type WelmCompanyOption = {
  id: string;
  name: string;
};

export type WelmProfileRequest = {
  companyId: string;
  name: string;
  idDocumentType?: "national" | "resident";
  nationalId: string;
  nationality?: string;
  dateOfBirth?: string;
  licenseType?: string;
  licenseNumber?: string;
  licenseExpiry?: string;
  placeOfIssue?: string;
};

export type WelmProfileResponse = {
  customerId: string;
  user: {
    id: string;
    name: string;
    firstName: string;
    nationalId: string;
    idDocumentType: "national" | "resident";
  };
};

export type WelmAuthErrorCode =
  | "undeployed"
  | "disabled"
  | "unauthorized"
  | "invalid"
  | "network"
  | "unknown";

/** Machine-readable `code` from Tajeer Plus email OTP endpoints. */
export type WelmEmailOtpErrorCode =
  | "invalid_email"
  | "already_verified"
  | "resend_cooldown"
  | "rate_limited"
  | "email_send_failed"
  | "no_pending"
  | "invalid_code"
  | "expired"
  | "too_many_attempts";

export type WelmAuthErrorDetails = {
  serverCode?: string;
  retryAfterSeconds?: number;
  attemptsLeft?: number;
};

export class WelmAuthApiError extends Error {
  readonly code: WelmAuthErrorCode;
  readonly status?: number;
  readonly serverCode?: string;
  readonly retryAfterSeconds?: number;
  readonly attemptsLeft?: number;

  constructor(
    code: WelmAuthErrorCode,
    message: string,
    status?: number,
    details?: WelmAuthErrorDetails,
  ) {
    super(message);
    this.name = "WelmAuthApiError";
    this.code = code;
    this.status = status;
    this.serverCode = details?.serverCode;
    this.retryAfterSeconds = details?.retryAfterSeconds;
    this.attemptsLeft = details?.attemptsLeft;
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
