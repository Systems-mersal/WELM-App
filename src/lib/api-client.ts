import axios from "axios";

/**
 * Shared HTTP client for future API work.
 * Base URL / auth interceptors can be wired when the backend is ready.
 */
export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? "https://api.example.com",
  timeout: 15000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  // Attach auth token from the auth store when available.
  return config;
});
