import * as AppleAuthentication from "expo-apple-authentication";
import { Platform } from "react-native";

import {
  SocialAuthStatus,
  SocialProvider,
  type SocialAuthResult,
} from "./types";

/** Expo + native ASAuthorizationError.canceled variants. */
const APPLE_CANCEL_CODES = new Set([
  "ERR_REQUEST_CANCELED",
  "ERR_CANCELED",
  "1001",
  1001,
]);

function isAppleCancelError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  if ("code" in error) {
    const code = (error as { code: unknown }).code;
    if (APPLE_CANCEL_CODES.has(code as string | number)) {
      return true;
    }
    if (typeof code === "string" && /cancel/i.test(code)) {
      return true;
    }
  }

  if ("message" in error) {
    const message = (error as { message: unknown }).message;
    if (typeof message === "string" && /cancel/i.test(message)) {
      return true;
    }
  }

  return false;
}

function appleDisplayName(
  fullName: AppleAuthentication.AppleAuthenticationFullName | null,
): string | null {
  if (!fullName) {
    return null;
  }
  const formatted = AppleAuthentication.formatFullName(fullName).trim();
  return formatted.length > 0 ? formatted : null;
}

/**
 * Native Sign in with Apple (iOS only).
 * Scopes: FULL_NAME + EMAIL only — never phone.
 * No nonce — avoids GoTrue hex/base64url nonce mismatches with Apple.
 * Does not call Supabase; caller posts identityToken to Tajeer Plus.
 */
export async function signInWithApple(): Promise<SocialAuthResult> {
  if (Platform.OS !== "ios") {
    return { status: SocialAuthStatus.UNAVAILABLE };
  }

  const available = await AppleAuthentication.isAvailableAsync();
  if (!available) {
    return { status: SocialAuthStatus.UNAVAILABLE };
  }

  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    if (!credential.identityToken) {
      if (__DEV__) {
        console.warn("[apple-auth] signInAsync returned without identityToken");
      }
      return { status: SocialAuthStatus.FAILED };
    }

    // identityToken must be a JWT (three base64url segments).
    if (credential.identityToken.split(".").length !== 3) {
      if (__DEV__) {
        console.warn("[apple-auth] identityToken is not a JWT");
      }
      return { status: SocialAuthStatus.FAILED };
    }

    return {
      status: SocialAuthStatus.SUCCESS,
      provider: SocialProvider.APPLE,
      name: appleDisplayName(credential.fullName),
      email: credential.email,
      identityToken: credential.identityToken,
      accessToken: null,
      refreshToken: null,
      authorizationCode: credential.authorizationCode,
      nonce: null,
    };
  } catch (error) {
    if (isAppleCancelError(error)) {
      return { status: SocialAuthStatus.CANCELLED };
    }
    if (__DEV__) {
      console.warn("[apple-auth] signInAsync failed", error);
    }
    return { status: SocialAuthStatus.FAILED };
  }
}
