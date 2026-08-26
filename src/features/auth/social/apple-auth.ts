import * as AppleAuthentication from "expo-apple-authentication";
import * as Crypto from "expo-crypto";
import { Platform } from "react-native";

import {
  SocialAuthStatus,
  SocialProvider,
  type SocialAuthResult,
} from "./types";

function appleErrorCode(error: object): string | null {
  if (!("code" in error)) {
    return null;
  }
  const code = error.code;
  return typeof code === "string" ? code : null;
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
    if (
      typeof error === "object" &&
      error !== null &&
      appleErrorCode(error) === "ERR_REQUEST_CANCELED"
    ) {
      return { status: SocialAuthStatus.CANCELLED };
    }
    return { status: SocialAuthStatus.FAILED };
  }
}
