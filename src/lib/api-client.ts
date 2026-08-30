import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

import type { WelmAuthSession } from "../features/auth/api/types";
import { useAuthStore, type AuthUser } from "../stores/auth-store";

function isWelmAuthRoute(url: string | undefined): boolean {
  return typeof url === "string" && url.includes("/api/welm/auth");
}

function isRefreshRequest(url: string | undefined): boolean {
  return typeof url === "string" && url.includes("/api/welm/auth/refresh");
}

function toAuthUser(session: WelmAuthSession): AuthUser {
  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email ?? undefined,
    phone: session.user.phone ?? undefined,
  };
}

/**
 * HTTP client for Tajeer Plus (`EXPO_PUBLIC_API_URL`).
 * Auth is Bearer from the WELM session store — not Supabase.
 */
export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000",
  timeout: 15000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let refreshInFlight: Promise<boolean> | null = null;

/** Bare POST so refresh never re-enters the 401 interceptor / circular helpers. */
async function tryRefreshSession(): Promise<boolean> {
  const refreshToken = useAuthStore.getState().refreshToken;
  if (!refreshToken) {
    return false;
  }

  try {
    const baseURL =
      apiClient.defaults.baseURL ??
      process.env.EXPO_PUBLIC_API_URL ??
      "http://localhost:3000";
    const { data } = await axios.post<WelmAuthSession>(
      `${baseURL.replace(/\/$/, "")}/api/welm/auth/refresh`,
      { refreshToken },
      {
        timeout: 15000,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      },
    );

    if (!data?.accessToken || !data?.refreshToken) {
      return false;
    }

    useAuthStore
      .getState()
      .setSession(data.accessToken, toAuthUser(data), data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const config = error.config as
      | (InternalAxiosRequestConfig & { _welmRetry?: boolean })
      | undefined;
    const requestUrl = `${config?.baseURL ?? ""}${config?.url ?? ""}`;

    if (
      status === 401 &&
      isWelmAuthRoute(requestUrl) &&
      !isRefreshRequest(requestUrl) &&
      config &&
      !config._welmRetry
    ) {
      if (!refreshInFlight) {
        refreshInFlight = tryRefreshSession().finally(() => {
          refreshInFlight = null;
        });
      }

      const refreshed = await refreshInFlight;
      if (refreshed) {
        config._welmRetry = true;
        const accessToken = useAuthStore.getState().accessToken;
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return apiClient.request(config);
      }

      useAuthStore.getState().clearSession();
    }

    return Promise.reject(error);
  },
);
