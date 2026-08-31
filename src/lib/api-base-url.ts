import Constants from "expo-constants";
import { NativeModules } from "react-native";

const FALLBACK = "http://localhost:3000";

function isLoopback(host: string): boolean {
  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "0.0.0.0" ||
    host === "::1"
  );
}

/** Host Metro used to load JS — the Mac, not the phone. */
function packagerHost(): string | null {
  const scriptURL = NativeModules.SourceCode?.scriptURL as string | undefined;
  if (typeof scriptURL === "string") {
    const match = scriptURL.match(/^https?:\/\/\[?([^\]/:]+)\]?(?::\d+)?/i);
    const host = match?.[1];
    if (host && !isLoopback(host)) {
      return host;
    }
  }

  const hostUri =
    Constants.expoConfig?.hostUri ??
    Constants.linkingUri?.replace(/^exp:\/\//, "");
  if (typeof hostUri === "string") {
    const host = hostUri.split(":")[0]?.replace(/^\[/, "").replace(/\]$/, "");
    if (host && !isLoopback(host)) {
      return host;
    }
  }

  return null;
}

/**
 * Tajeer Plus origin. In __DEV__, `localhost` is rewritten to the Metro
 * host so a physical iPhone can reach the Mac (`ERR_NETWORK` otherwise).
 */
export function getApiBaseUrl(): string {
  const raw = (process.env.EXPO_PUBLIC_API_URL ?? FALLBACK).replace(/\/$/, "");

  if (!__DEV__) {
    return raw;
  }

  try {
    const url = new URL(raw);
    if (!isLoopback(url.hostname)) {
      return raw;
    }
    const host = packagerHost();
    if (!host) {
      return raw;
    }
    url.hostname = host;
    return url.origin;
  } catch {
    return raw;
  }
}
