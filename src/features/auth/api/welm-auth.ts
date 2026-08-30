import axios from "axios";

import { apiClient } from "../../../lib/api-client";
import type { AuthUser } from "../../../stores/auth-store";
import type { SocialAuthSuccess } from "../social/types";
import {
  WelmAuthApiError,
  type WelmAuthSession,
  type WelmMeResponse,
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

  if (status === 400 || status === 403) {
    return new WelmAuthApiError("invalid", message, status);
  }

  return new WelmAuthApiError("unknown", message, status);
}

export function mapWelmSessionToAuthUser(session: WelmAuthSession): AuthUser {
  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email ?? undefined,
    phone: session.user.phone ?? undefined,
  };
}

export function socialSuccessToRequest(
  credential: SocialAuthSuccess,
): WelmSocialAuthRequest {
  return {
    provider: credential.provider,
    idToken: credential.identityToken,
    accessToken: credential.accessToken,
    authorizationCode: credential.authorizationCode,
    fullName: credential.name,
    nonce: credential.nonce,
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

/** Hosted OAuth start URL (X / optional Google) — never points at supabase.co. */
export function getWelmOAuthStartUrl(provider: "x" | "google"): string {
  const base = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/api/welm/auth/oauth/start?provider=${provider}`;
}
