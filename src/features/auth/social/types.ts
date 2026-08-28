import { SocialAuthStatus } from "../enums/social-auth-status";
import { SocialProvider } from "../enums/social-provider";

export { SocialAuthStatus, SocialProvider };

export type SocialAuthCancelled = {
  status: SocialAuthStatus.CANCELLED;
};

export type SocialAuthUnavailable = {
  status: SocialAuthStatus.UNAVAILABLE;
};

export type SocialAuthFailed = {
  status: SocialAuthStatus.FAILED;
};

export type SocialAuthSuccess = {
  status: SocialAuthStatus.SUCCESS;
  provider: SocialProvider;
  /** Display name from the provider (may be null). */
  name: string | null;
  /** Email from the provider (may be null / private relay for Apple). */
  email: string | null;
  /** Apple / OIDC identity token — never includes phone. */
  identityToken: string | null;
  accessToken: string | null;
  authorizationCode: string | null;
  nonce: string | null;
  // Intentionally no `phone` field — phone must not be posted to social networks.
};

export type SocialAuthResult =
  | SocialAuthCancelled
  | SocialAuthUnavailable
  | SocialAuthFailed
  | SocialAuthSuccess;
