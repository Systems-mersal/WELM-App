/** Auth feature barrel — screens stay under `src/screens` until a full move. */
export { useAuthStore, type AuthUser } from "../../stores/auth-store";
export { signInWithSocial } from "./social/social-auth";
export { signInWithApple } from "./social/apple-auth";
export { signInWithAppleToWelm } from "./social/apple-to-welm";
export type { AppleSignInToWelmResult } from "./social/apple-to-welm";
export { SocialAuthStatus, SocialProvider } from "./enums";
export type { SocialAuthResult, SocialAuthSuccess } from "./social/types";
export {
  getWelmPostAuthDestination,
  routeAfterWelmAuth,
} from "./navigation/route-after-auth";
export type { WelmPostAuthDestination } from "./navigation/route-after-auth";
export {
  WelmAuthApiError,
  exchangeSocialAuth,
  exchangeSocialCredential,
  fetchWelmMe,
  getWelmOAuthStartUrl,
  logoutWelmSession,
  mapWelmSessionToAuthUser,
  refreshWelmSession,
} from "./api";
export type {
  WelmAuthErrorCode,
  WelmAuthProvider,
  WelmAuthSession,
  WelmAuthUser,
  WelmMeResponse,
  WelmSocialAuthRequest,
} from "./api";
