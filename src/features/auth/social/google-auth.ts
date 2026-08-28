import * as AuthSession from "expo-auth-session";
import * as Crypto from "expo-crypto";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";

import {
  SocialAuthStatus,
  SocialProvider,
  type SocialAuthResult,
} from "./types";

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_DISCOVERY: AuthSession.DiscoveryDocument = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
  revocationEndpoint: "https://oauth2.googleapis.com/revoke",
  userInfoEndpoint: "https://openidconnect.googleapis.com/v1/userinfo",
};

const GOOGLE_SCOPES = [
  // OpenID Connect only — name + email. Never request phone or write scopes.
  "openid",
  "profile",
  "email",
];

type GoogleIdTokenClaims = {
  email?: string;
  name?: string;
};

function googleClientId(): string | null {
  // TODO: set EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID / EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID
  // in env when Cloud Console OAuth clients exist. Do not hardcode IDs.
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
  const clientId = Platform.OS === "ios" ? iosClientId : androidClientId;
  if (typeof clientId !== "string" || clientId.length === 0) {
    return null;
  }
  return clientId;
}

function decodeIdTokenClaims(idToken: string): GoogleIdTokenClaims {
  const segment = idToken.split(".")[1];
  if (!segment) {
    return {};
  }
  try {
    const padded = segment.replace(/-/g, "+").replace(/_/g, "/");
    const padLength = padded.length % 4;
    const withPad =
      padLength === 0 ? padded : padded + "=".repeat(4 - padLength);
    const parsed: GoogleIdTokenClaims = JSON.parse(atob(withPad));
    return parsed;
  } catch {
    return {};
  }
}

export async function signInWithGoogle(): Promise<SocialAuthResult> {
  const clientId = googleClientId();
  if (!clientId) {
    return { status: SocialAuthStatus.UNAVAILABLE };
  }

  const redirectUri = AuthSession.makeRedirectUri({
    scheme: "welm",
    path: "auth/callback",
  });
  const bytes = await Crypto.getRandomBytesAsync(16);
  const nonce = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");

  const request = new AuthSession.AuthRequest({
    clientId,
    scopes: GOOGLE_SCOPES,
    redirectUri,
    responseType: AuthSession.ResponseType.IdToken,
    usePKCE: false,
    extraParams: { nonce, prompt: AuthSession.Prompt.SelectAccount },
  });

  try {
    const result = await request.promptAsync(GOOGLE_DISCOVERY);
    if (result.type === "cancel" || result.type === "dismiss") {
      return { status: SocialAuthStatus.CANCELLED };
    }
    if (result.type !== "success") {
      return { status: SocialAuthStatus.FAILED };
    }

    const identityToken =
      result.params.id_token ?? result.authentication?.idToken ?? null;
    const accessToken =
      result.params.access_token ?? result.authentication?.accessToken ?? null;
    const claims = identityToken ? decodeIdTokenClaims(identityToken) : {};

    return {
      status: SocialAuthStatus.SUCCESS,
      provider: SocialProvider.GOOGLE,
      name: claims.name ?? null,
      email: claims.email ?? null,
      identityToken,
      accessToken,
      authorizationCode: result.params.code ?? null,
      nonce,
    };
  } catch {
    return { status: SocialAuthStatus.FAILED };
  }
}
