import { Platform } from "react-native";

import { signInWithApple } from "./apple-auth";
import { signInWithGoogle } from "./google-auth";
import {
  SocialAuthStatus,
  SocialProvider,
  type SocialAuthResult,
} from "./types";
import { signInWithX } from "./x-auth";

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
