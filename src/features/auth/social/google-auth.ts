import * as WebBrowser from "expo-web-browser";

import { getWelmOAuthStartUrl } from "../api/welm-auth";
import {
  SocialAuthStatus,
  SocialProvider,
  type SocialAuthResult,
} from "./types";

WebBrowser.maybeCompleteAuthSession();

/** Must match Tajeer Plus `WELM_APP_CALLBACK` (`lib/welm/oauth.ts`). */
const WELM_OAUTH_CALLBACK = "welm://auth/callback";

function parseCallbackParams(url: string): Record<string, string> {
  const queryIndex = url.indexOf("?");
  if (queryIndex < 0) {
    return {};
  }
  const params = new URLSearchParams(url.slice(queryIndex + 1));
  const out: Record<string, string> = {};
  params.forEach((value, key) => {
    out[key] = value;
  });
  return out;
}

/**
 * Hosted Google OAuth via Tajeer Plus — never opens supabase.co.
 *
 * Flow:
 * 1. openAuthSession → GET /api/welm/auth/oauth/start?provider=google
 * 2. Tajeer + Google, then redirect welm://auth/callback?access_token=&refresh_token=
 * 3. Caller POSTs tokens to /api/welm/auth/social
 */
export async function signInWithGoogle(): Promise<SocialAuthResult> {
  const startUrl = getWelmOAuthStartUrl("google");

  try {
    const result = await WebBrowser.openAuthSessionAsync(
      startUrl,
      WELM_OAUTH_CALLBACK,
    );

    if (result.type === "cancel" || result.type === "dismiss") {
      return { status: SocialAuthStatus.CANCELLED };
    }
    if (result.type !== "success" || !result.url) {
      return { status: SocialAuthStatus.FAILED };
    }

    const params = parseCallbackParams(result.url);
    if (params.error) {
      const detail =
        params.error_description?.replace(/\+/g, " ").trim() ||
        params.error;
      return { status: SocialAuthStatus.FAILED, message: detail };
    }

    const accessToken = params.access_token?.trim() || null;
    const refreshToken = params.refresh_token?.trim() || null;
    if (!accessToken || !refreshToken) {
      return {
        status: SocialAuthStatus.FAILED,
        message: "Google sign-in did not return a session",
      };
    }

    return {
      status: SocialAuthStatus.SUCCESS,
      provider: SocialProvider.GOOGLE,
      name: null,
      email: null,
      identityToken: null,
      accessToken,
      refreshToken,
      authorizationCode: null,
      nonce: null,
    };
  } catch {
    return { status: SocialAuthStatus.FAILED };
  }
}
