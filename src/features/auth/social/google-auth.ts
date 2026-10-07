import { Platform } from "react-native";
import * as AuthSession from "expo-auth-session";
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

const GOOGLE_DISCOVERY: AuthSession.DiscoveryDocument = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
};

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

function googleIosClientId(): string | null {
  const id = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim();
  return id || null;
}

/** Google Cloud iOS clients only accept this reversed-client-id scheme. */
export function googleIosRedirectUri(clientId: string): string {
  const guid = clientId.replace(/\.apps\.googleusercontent\.com$/i, "");
  return `com.googleusercontent.apps.${guid}:/oauthredirect`;
}

async function signInWithGoogleIos(
  clientId: string,
): Promise<SocialAuthResult> {
  const redirectUri = googleIosRedirectUri(clientId);
  const request = new AuthSession.AuthRequest({
    clientId,
    redirectUri,
    responseType: AuthSession.ResponseType.Code,
    scopes: ["openid", "email", "profile"],
    usePKCE: true,
    extraParams: { prompt: "select_account" },
  });

  const result = await request.promptAsync(GOOGLE_DISCOVERY);
  if (result.type === "cancel" || result.type === "dismiss") {
    return { status: SocialAuthStatus.CANCELLED };
  }
  if (result.type === "error") {
    const code = result.error?.code ?? result.params.error;
    if (code === "access_denied") {
      return { status: SocialAuthStatus.CANCELLED };
    }
    return {
      status: SocialAuthStatus.FAILED,
      message: result.error?.message || code,
    };
  }
  if (result.type !== "success" || !result.params.code) {
    return { status: SocialAuthStatus.FAILED };
  }

  const tokens = await new AuthSession.AccessTokenRequest({
    clientId,
    redirectUri,
    code: result.params.code,
    extraParams: {
      code_verifier: request.codeVerifier ?? "",
    },
  }).performAsync(GOOGLE_DISCOVERY);

  const identityToken = tokens.idToken?.trim() || null;
  if (!identityToken) {
    return {
      status: SocialAuthStatus.FAILED,
      message: "Google sign-in did not return an identity token",
    };
  }

  return {
    status: SocialAuthStatus.SUCCESS,
    provider: SocialProvider.GOOGLE,
    name: null,
    email: null,
    identityToken,
    accessToken: tokens.accessToken ?? null,
    refreshToken: tokens.refreshToken ?? null,
    authorizationCode: null,
    nonce: null,
  };
}

/**
 * Hosted Google OAuth via Tajeer Plus — never opens supabase.co.
 *
 * Used when no iOS client ID is set (e.g. Android until a native client exists).
 */
async function signInWithGoogleHosted(): Promise<SocialAuthResult> {
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
        params.error_description?.replace(/\+/g, " ").trim() || params.error;
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

/**
 * Google sign-in.
 *
 * iOS uses the Google Cloud **iOS** OAuth client + PKCE (`id_token` → Tajeer).
 * That avoids `redirect_uri_mismatch` from the hosted Web-client flow.
 */
export async function signInWithGoogle(): Promise<SocialAuthResult> {
  const iosClientId = googleIosClientId();
  if (Platform.OS === "ios" && iosClientId) {
    try {
      return await signInWithGoogleIos(iosClientId);
    } catch {
      return { status: SocialAuthStatus.FAILED };
    }
  }

  return signInWithGoogleHosted();
}
