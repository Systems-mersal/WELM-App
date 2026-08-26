/** Auth feature barrel — screens stay under `src/screens` until a full move. */
export { useAuthStore, type AuthUser } from "../../stores/auth-store";
export { signInWithSocial } from "./social/social-auth";
export { SocialAuthStatus, SocialProvider } from "./social/types";
export type { SocialAuthResult, SocialAuthSuccess } from "./social/types";
