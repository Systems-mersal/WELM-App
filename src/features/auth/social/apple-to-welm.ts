import { Platform } from "react-native";

import { exchangeSocialAuth } from "../api/welm-auth";
import type { WelmAuthSession } from "../api/types";
import { signInWithApple } from "../social/apple-auth";
import { SocialAuthStatus, SocialProvider } from "../social/types";

export type AppleSignInToWelmResult =
  | { status: SocialAuthStatus.CANCELLED }
  | { status: SocialAuthStatus.UNAVAILABLE }
  | { status: SocialAuthStatus.FAILED }
  | { status: SocialAuthStatus.SUCCESS; session: WelmAuthSession };

export type SignInWithAppleToWelmOptions = {
  /** Called after the native sheet succeeds, before the Tajeer HTTP exchange. */
  onNativeSuccess?: () => void;
};

/**
 * Native Apple → POST /api/welm/auth/social.
 * Persistence is decided by applyWelmAuthSession (US-3 vs US-5).
 * Never calls Supabase. Never posts phone.
 */
export async function signInWithAppleToWelm(
  options?: SignInWithAppleToWelmOptions,
): Promise<AppleSignInToWelmResult> {
  if (Platform.OS !== "ios") {
    return { status: SocialAuthStatus.UNAVAILABLE };
  }

  const apple = await signInWithApple();
  if (apple.status !== SocialAuthStatus.SUCCESS) {
    return { status: apple.status };
  }

  if (!apple.identityToken) {
    return { status: SocialAuthStatus.FAILED };
  }

  options?.onNativeSuccess?.();

  const session = await exchangeSocialAuth({
    provider: SocialProvider.APPLE,
    idToken: apple.identityToken,
    fullName: apple.name,
    email: apple.email,
  });

  return { status: SocialAuthStatus.SUCCESS, session };
}
