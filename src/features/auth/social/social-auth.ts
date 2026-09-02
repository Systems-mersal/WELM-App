import { Platform } from "react-native";

import { signInWithApple } from "./apple-auth";
import { signInWithGoogle } from "./google-auth";
import {
  SocialAuthStatus,
  SocialProvider,
  type SocialAuthResult,
} from "./types";

/**
 * Social sign-in entry point.
 *
 * Privacy policy for this layer:
 * - Request only name + email (Apple also returns identity tokens).
 * - Never send the user's phone number to Apple / Google.
 * - Phone linking is a separate WELM/backend step after social success.
 */
export async function signInWithSocial(
  provider: SocialProvider,
): Promise<SocialAuthResult> {
  if (provider === SocialProvider.APPLE) {
    if (Platform.OS !== "ios") {
      return { status: SocialAuthStatus.UNAVAILABLE };
    }
    return signInWithApple();
  }

  return signInWithGoogle();
}
