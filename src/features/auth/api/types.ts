/** Typed contract for Tajeer Plus WELM auth HTTP APIs. */

export type WelmAuthProvider = "apple" | "google" | "x";

export type WelmAuthUser = {
  id: string;
  name: string;
  email: string | null;
  phone?: string | null;
};

export type WelmAuthSession = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: WelmAuthUser;
  /** true when no verified +966 yet → US-3; false → existing consumer (US-5). */
  isNew: boolean;
};

export type WelmSocialAuthRequest = {
  provider: WelmAuthProvider;
  idToken?: string | null;
  accessToken?: string | null;
  authorizationCode?: string | null;
  fullName?: string | null;
  nonce?: string | null;
};

export type WelmMeResponse = {
  user: WelmAuthUser;
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
