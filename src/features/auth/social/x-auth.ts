import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";

import { SocialAuthStatus, type SocialAuthResult } from "./types";

WebBrowser.maybeCompleteAuthSession();

export async function signInWithX(): Promise<SocialAuthResult> {
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: "welm",
    path: "auth/callback",
  });

  // TODO(US-2.2): hosted X start URL (e.g. Tajeer Plus `/api/welm/auth/x`)
  // using AuthSession / WebBrowser and redirectUri. Do not invent the start URL.
  // When implemented: request profile/email only — never post phone to X.
  void redirectUri;

  return { status: SocialAuthStatus.UNAVAILABLE };
}
