import { Platform } from "react-native";

import { signInWithApple } from "./apple-auth";
import { signInWithGoogle } from "./google-auth";
import {
  SocialAuthStatus,
  SocialProvider,
  type SocialAuthResult,
} from "./types";
import { signInWithX } from "./x-auth";

/**
 * Social sign-in entry point.
 *
 * Privacy policy for this layer:
 * - Request only name + email (Apple also returns identity tokens).
 * - Never send the user's phone number to Apple / Google / X.
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

  if (provider === SocialProvider.GOOGLE) {
    return signInWithGoogle();
  }

  return signInWithX();
}
