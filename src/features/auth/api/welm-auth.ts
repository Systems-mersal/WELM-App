import axios from "axios";

import { getApiBaseUrl } from "../../../lib/api-base-url";
import { apiClient } from "../../../lib/api-client";
import {
  copyLocalProfileFields,
  useAuthStore,
  type AuthUser,
} from "../../../stores/auth-store";
import type { SocialAuthSuccess } from "../social/types";
import {
  WelmAuthApiError,
  type WelmAuthSession,
  type WelmMeResponse,
  type WelmPhoneStartResponse,
  type WelmPhoneVerifyResponse,
  type WelmEmailStartResponse,
  type WelmEmailVerifyResponse,
  type WelmSocialAuthRequest,
} from "./types";

const SOCIAL_PATH = "/api/welm/auth/social";
const REFRESH_PATH = "/api/welm/auth/refresh";
const LOGOUT_PATH = "/api/welm/auth/logout";
const ME_PATH = "/api/welm/auth/me";

function isAuthEnabled(): boolean {
  const flag = process.env.EXPO_PUBLIC_WELM_AUTH_ENABLED;
  // Default on when unset; set to "false" to block calls with a clear error.
  return flag !== "false" && flag !== "0";
}

function assertEnabled(): void {
  if (!isAuthEnabled()) {
    throw new WelmAuthApiError(
      "disabled",
      "WELM auth API is disabled (EXPO_PUBLIC_WELM_AUTH_ENABLED=false). Enable it after Tajeer Plus deploys /api/welm/auth/*.",
    );
  }
}

function mapAxiosError(error: unknown): WelmAuthApiError {
  if (error instanceof WelmAuthApiError) {
    return error;
  }

  if (!axios.isAxiosError(error)) {
    return new WelmAuthApiError(
      "unknown",
      error instanceof Error ? error.message : "Auth request failed",
    );
  }

  const status = error.response?.status;
  const message =
    (typeof error.response?.data?.error === "string" &&
      error.response.data.error) ||
    error.message;

  if (
    status === 404 ||
    status === 501 ||
    status === 502 ||
    status === 503 ||
    error.code === "ECONNREFUSED" ||
    error.code === "ERR_NETWORK"
  ) {
    return new WelmAuthApiError(
      "undeployed",
      "WELM auth API is not available on this Tajeer Plus host yet. Deploy /api/welm/auth/* — do not use Supabase from the app.",
      status,
    );
  }

  if (status === 401) {
    return new WelmAuthApiError("unauthorized", message, status);
  }

  if (status === 400 || status === 403 || status === 409) {
    return new WelmAuthApiError("invalid", message, status);
  }

  return new WelmAuthApiError("unknown", message, status);
}

export function mapWelmSessionToAuthUser(session: WelmAuthSession): AuthUser {
  const current = useAuthStore.getState().user;
  return {
    id: session.user.id,
    name: session.user.name,
    firstName:
      session.user.firstName ||
      session.user.name.trim().split(/\s+/)[0] ||
      "User",
    email: session.user.email ?? undefined,
    phone: session.user.phone ?? undefined,
    ...copyLocalProfileFields(current, session.user.id),
  };
}

export function socialSuccessToRequest(
  credential: SocialAuthSuccess,
): WelmSocialAuthRequest {
  return {
    provider: credential.provider,
    idToken: credential.identityToken,
    accessToken: credential.accessToken,
    refreshToken: credential.refreshToken,
    authorizationCode: credential.authorizationCode,
    fullName: credential.name,
    nonce: credential.nonce,
    email: credential.email,
  };
}

/** POST /api/welm/auth/social */
export async function exchangeSocialAuth(
  body: WelmSocialAuthRequest,
): Promise<WelmAuthSession> {
  assertEnabled();
  try {
    const { data } = await apiClient.post<WelmAuthSession>(SOCIAL_PATH, body);
    if (!data?.accessToken || !data?.user?.id) {
      throw new WelmAuthApiError("unknown", "Invalid social auth response");
    }
    return data;
  } catch (error) {
    throw mapAxiosError(error);
  }
}

/** Convenience: native social success → Tajeer session. */
export async function exchangeSocialCredential(
  credential: SocialAuthSuccess,
): Promise<WelmAuthSession> {
  return exchangeSocialAuth(socialSuccessToRequest(credential));
}

/** POST /api/welm/auth/refresh */
export async function refreshWelmSession(
  refreshToken: string,
): Promise<WelmAuthSession> {
  assertEnabled();
  try {
    const { data } = await apiClient.post<WelmAuthSession>(REFRESH_PATH, {
      refreshToken,
    });
    if (!data?.accessToken || !data?.refreshToken) {
      throw new WelmAuthApiError("unknown", "Invalid refresh response");
    }
    return data;
  } catch (error) {
    throw mapAxiosError(error);
  }
}

/** POST /api/welm/auth/logout — best-effort; always safe to clear locally after. */
export async function logoutWelmSession(): Promise<void> {
  if (!isAuthEnabled()) {
    return;
  }
  try {
    await apiClient.post(LOGOUT_PATH);
  } catch (error) {
    const mapped = mapAxiosError(error);
    if (mapped.code === "undeployed" || mapped.code === "unauthorized") {
      return;
    }
    throw mapped;
  }
}

/** GET /api/welm/auth/me */
export async function fetchWelmMe(): Promise<WelmMeResponse> {
  assertEnabled();
  try {
    const { data } = await apiClient.get<WelmMeResponse>(ME_PATH);
    if (!data?.user?.id) {
      throw new WelmAuthApiError("unknown", "Invalid /me response");
    }
    return data;
  } catch (error) {
    throw mapAxiosError(error);
  }
}

/** Hosted OAuth start URL (Google) — never points at supabase.co. */
export function getWelmOAuthStartUrl(provider: "google"): string {
  return `${getApiBaseUrl()}/api/welm/auth/oauth/start?provider=${provider}`;
}

const PHONE_START_PATH = "/api/welm/auth/phone/start";
const PHONE_VERIFY_PATH = "/api/welm/auth/phone/verify";

/** POST /api/welm/auth/phone/start — never sent to Apple/Google. */
export async function startWelmPhoneOtp(
  phone: string,
): Promise<WelmPhoneStartResponse> {
  assertEnabled();
  try {
    const { data } = await apiClient.post<WelmPhoneStartResponse>(
      PHONE_START_PATH,
      { phone },
    );
    if (!data?.sent || !data.phone) {
      throw new WelmAuthApiError("unknown", "Invalid phone start response");
    }
    return data;
  } catch (error) {
    throw mapAxiosError(error);
  }
}

/** POST /api/welm/auth/phone/verify */
export async function verifyWelmPhoneOtp(
  phone: string,
  code: string,
): Promise<WelmPhoneVerifyResponse> {
  assertEnabled();
  try {
    const { data } = await apiClient.post<WelmPhoneVerifyResponse>(
      PHONE_VERIFY_PATH,
      { phone, code },
    );
    if (!data?.verified) {
      throw new WelmAuthApiError("unknown", "Invalid phone verify response");
    }
    return data;
  } catch (error) {
    throw mapAxiosError(error);
  }
}

const EMAIL_START_PATH = "/api/welm/auth/email/start";
const EMAIL_VERIFY_PATH = "/api/welm/auth/email/verify";

/** POST /api/welm/auth/email/start */
export async function startWelmEmailOtp(
  email: string,
): Promise<WelmEmailStartResponse> {
  assertEnabled();
  try {
    const { data } = await apiClient.post<WelmEmailStartResponse>(
      EMAIL_START_PATH,
      { email },
    );
    if (!data?.sent || !data.email) {
      throw new WelmAuthApiError("unknown", "Invalid email start response");
    }
    return data;
  } catch (error) {
    throw mapAxiosError(error);
  }
}

/** POST /api/welm/auth/email/verify */
export async function verifyWelmEmailOtp(
  email: string,
  code: string,
): Promise<WelmEmailVerifyResponse> {
  assertEnabled();
  try {
    const { data } = await apiClient.post<WelmEmailVerifyResponse>(
      EMAIL_VERIFY_PATH,
      { email, code },
    );
    if (!data?.verified) {
      throw new WelmAuthApiError("unknown", "Invalid email verify response");
    }
    return data;
  } catch (error) {
    throw mapAxiosError(error);
  }
}
