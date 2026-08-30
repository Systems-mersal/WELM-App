import { Platform } from "react-native";

import {
  exchangeSocialAuth,
  mapWelmSessionToAuthUser,
} from "../api/welm-auth";
import type { WelmAuthSession } from "../api/types";
import { useAuthStore } from "../../../stores/auth-store";
import { signInWithApple } from "../social/apple-auth";
import { SocialAuthStatus, SocialProvider } from "../social/types";

export type AppleSignInToWelmResult =
  | { status: SocialAuthStatus.CANCELLED }
  | { status: SocialAuthStatus.UNAVAILABLE }
  | { status: SocialAuthStatus.FAILED }
  | { status: SocialAuthStatus.SUCCESS; session: WelmAuthSession };

/**
 * Native Apple → POST /api/welm/auth/social → persist session.
 * Never calls Supabase. Never posts phone.
 */
export async function signInWithAppleToWelm(): Promise<AppleSignInToWelmResult> {
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

  const session = await exchangeSocialAuth({
    provider: SocialProvider.APPLE,
    idToken: apple.identityToken,
    fullName: apple.name,
  });

  // Persist tokens + API user (including Apple private-relay email).
  useAuthStore
    .getState()
    .setSession(
      session.accessToken,
      mapWelmSessionToAuthUser(session),
      session.refreshToken,
    );

  return { status: SocialAuthStatus.SUCCESS, session };
}
