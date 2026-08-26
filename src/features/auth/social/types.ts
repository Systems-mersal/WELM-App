export enum SocialProvider {
  APPLE = "apple",
  GOOGLE = "google",
  X = "x",
}

export enum SocialAuthStatus {
  CANCELLED = "cancelled",
  UNAVAILABLE = "unavailable",
  FAILED = "failed",
  SUCCESS = "success",
}

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
  name: string | null;
  email: string | null;
  identityToken: string | null;
  accessToken: string | null;
  authorizationCode: string | null;
  nonce: string | null;
};

export type SocialAuthResult =
  | SocialAuthCancelled
  | SocialAuthUnavailable
  | SocialAuthFailed
  | SocialAuthSuccess;
