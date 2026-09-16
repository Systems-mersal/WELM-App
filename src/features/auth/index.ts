/** Auth feature barrel — screens stay under `src/screens` until a full move. */
export { useAuthStore, type AuthUser } from "../../stores/auth-store";
export { signInWithSocial } from "./social/social-auth";
export { signInWithApple } from "./social/apple-auth";
export { signInWithAppleToWelm } from "./social/apple-to-welm";
export type {
  AppleSignInToWelmResult,
  SignInWithAppleToWelmOptions,
} from "./social/apple-to-welm";
export { SocialAuthStatus, SocialProvider } from "./enums";
export type { SocialAuthResult, SocialAuthSuccess } from "./social/types";
export {
  getWelmPostAuthDestination,
  routeAfterWelmAuth,
} from "./navigation/route-after-auth";
export { routePastAuthGate, routeToHome } from "./navigation/route-past-auth-gate";
export type { WelmPostAuthDestination } from "./navigation/route-after-auth";
export {
  applyWelmAuthSession,
  completeSocialSignIn,
  commitPendingWelmSession,
  discardWelmAuth,
} from "./session/apply-welm-auth";
export {
  reportWelmAuthFailure,
  setWelmAuthFailureHandler,
  welmAuthUserMessage,
} from "./errors/welm-auth-failure";
export { SignupProgress } from "./ui/SignupProgress";
export { LinkedProviderCard } from "./ui/LinkedProviderCard";
export { IdScanCard } from "./ui/IdScanCard";
export { IdScanCameraSheet } from "./ui/IdScanCameraSheet";
export {
  scanCustomerIdImage,
  mockExtractIdScan,
  autofilledKeysFromFields,
  SCAN_TRACKED_KEYS,
} from "./profile/scan-id";
export type {
  ScanIdFields,
  ScanIdResult,
  ScanIdSuccess,
  ScanTrackedKey,
} from "./profile/scan-id";
export {
  WelmAuthApiError,
  exchangeSocialAuth,
  exchangeSocialCredential,
  fetchWelmMe,
  firstNameFromWelmUser,
  getWelmOAuthStartUrl,
  logoutWelmSession,
  mapWelmSessionToAuthUser,
  refreshWelmSession,
  startWelmPhoneOtp,
  verifyWelmPhoneOtp,
  startWelmEmailOtp,
  verifyWelmEmailOtp,
} from "./api";
export type {
  WelmAuthErrorCode,
  WelmAuthProvider,
  WelmAuthSession,
  WelmAuthUser,
  WelmMeResponse,
  WelmSocialAuthRequest,
} from "./api";
