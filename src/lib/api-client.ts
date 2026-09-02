import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

import type { WelmAuthSession } from "../features/auth/api/types";
import {
  copyLocalProfileFields,
  useAuthStore,
  type AuthUser,
} from "../stores/auth-store";
import { getApiBaseUrl } from "./api-base-url";

function isWelmAuthRoute(url: string | undefined): boolean {
  return typeof url === "string" && url.includes("/api/welm/auth");
}

function isRefreshRequest(url: string | undefined): boolean {
  return typeof url === "string" && url.includes("/api/welm/auth/refresh");
}

function toAuthUser(session: WelmAuthSession): AuthUser {
  const current = useAuthStore.getState().user;
  return {
    id: session.user.id,
    name: session.user.name,
    firstName: session.user.firstName,
    email: session.user.email ?? undefined,
    phone: session.user.phone ?? undefined,
    ...copyLocalProfileFields(current, session.user.id),
  };
}

/**
 * HTTP client for Tajeer Plus (`EXPO_PUBLIC_API_URL`).
 * Auth is Bearer from the WELM session store — not Supabase.
 */
export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
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
  if (__DEV__) {
    const base = config.baseURL ?? getApiBaseUrl();
    console.log(
      `[welm/http] → ${(config.method ?? "get").toUpperCase()} ${base}${config.url ?? ""}`,
    );
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
    const baseURL = apiClient.defaults.baseURL ?? getApiBaseUrl();
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

function welmHttpOutcome(url: string | undefined, data: unknown): string {
  if (!url?.includes("/api/welm/auth/social")) {
    return "";
  }
  if (!data || typeof data !== "object" || !("isNew" in data)) {
    return "";
  }
  return (data as { isNew?: boolean }).isNew
    ? " SIGNUP → Link Mobile"
    : " SIGN IN → Account Exists";
}

apiClient.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      console.log(
        `[welm/http] ← ${response.status} ${response.config.url ?? ""}${welmHttpOutcome(response.config.url, response.data)}`,
      );
    }
    return response;
  },
  async (error: AxiosError) => {
    if (__DEV__) {
      const errBody = error.response?.data as { error?: string } | undefined;
      console.warn(
        `[welm/http] ← ${error.response?.status ?? error.code} ${error.config?.baseURL ?? ""}${error.config?.url ?? ""}`,
        errBody?.error ?? error.message,
      );
    }
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
