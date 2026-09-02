import { Alert } from "react-native";

import { WelmAuthApiError } from "../api/types";

export type WelmAuthFailurePayload = {
  error: unknown;
  message: string;
  title?: string;
};

type WelmAuthFailureHandler = (payload: WelmAuthFailurePayload) => void;

/**
 * Default Alert for Login / OTP / Link Mobile.
 * Create Account shows an inline banner via local state instead.
 * Do not invoke on native cancel (API was never called).
 */
const defaultHandler: WelmAuthFailureHandler = ({ title, message }) => {
  if (title) {
    Alert.alert(title, message);
    return;
  }
  Alert.alert(message);
};

let handler: WelmAuthFailureHandler = defaultHandler;

export function setWelmAuthFailureHandler(
  next: WelmAuthFailureHandler | null,
): void {
  handler = next ?? defaultHandler;
}

export function welmAuthUserMessage(
  error: unknown,
  copy: { unavailable: string; fallback: string },
): string {
  if (error instanceof WelmAuthApiError) {
    if (error.code === "undeployed" || error.code === "disabled") {
      return copy.unavailable;
    }
    return error.message || copy.fallback;
  }
  return copy.fallback;
}

/** Login / OTP / Link Mobile — API failures only. Do not call on ERR_REQUEST_CANCELED. */
export function reportWelmAuthFailure(
  error: unknown,
  message: string,
  title?: string,
): void {
  handler({ error, message, title });
}
