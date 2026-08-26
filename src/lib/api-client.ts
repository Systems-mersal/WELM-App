import axios from "axios";

import { useAuthStore } from "../stores/auth-store";

function isWelmAuthRoute(url: string | undefined): boolean {
  return typeof url === "string" && url.includes("/api/welm/auth");
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

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = `${error.config?.baseURL ?? ""}${error.config?.url ?? ""}`;

    if (status === 401 && isWelmAuthRoute(requestUrl)) {
      // TODO(US-2.2): POST /api/welm/auth/refresh then retry; until then drop the session.
      useAuthStore.getState().clearSession();
    }

    return Promise.reject(error);
  },
);
