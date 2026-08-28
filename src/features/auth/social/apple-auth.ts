import * as AppleAuthentication from "expo-apple-authentication";
import * as Crypto from "expo-crypto";
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

export async function signInWithApple(): Promise<SocialAuthResult> {
  if (Platform.OS !== "ios") {
    return { status: SocialAuthStatus.UNAVAILABLE };
  }

  const available = await AppleAuthentication.isAvailableAsync();
  if (!available) {
    return { status: SocialAuthStatus.UNAVAILABLE };
  }

  const bytes = await Crypto.getRandomBytesAsync(16);
  const nonce = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");

  try {
    const credential = await AppleAuthentication.signInAsync({
      // Name + email only. Never request or send the user's phone to Apple.
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce,
    });

    return {
      status: SocialAuthStatus.SUCCESS,
      provider: SocialProvider.APPLE,
      name: appleDisplayName(credential.fullName),
      email: credential.email,
      identityToken: credential.identityToken,
      accessToken: null,
      authorizationCode: credential.authorizationCode,
      nonce,
    };
  } catch (error) {
    if (isAppleCancelError(error)) {
      return { status: SocialAuthStatus.CANCELLED };
    }
    return { status: SocialAuthStatus.FAILED };
  }
}
