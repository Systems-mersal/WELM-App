import { useAuthStore } from "../../../stores/auth-store";
import type { WelmAuthSession } from "../api/types";
import { logoutWelmSession, mapWelmSessionToAuthUser } from "../api/welm-auth";
import {
  getWelmPostAuthDestination,
  type WelmPostAuthDestination,
} from "./destination";

/**
 * New consumer (US-3): persist Bearer so phone APIs work.
 * Existing consumer (US-5): park tokens in memory only.
 */
export function applyWelmAuthSession(
  session: WelmAuthSession,
): WelmPostAuthDestination {
  const destination = getWelmPostAuthDestination(session);
  const store = useAuthStore.getState();

  if (destination === "link-mobile") {
    store.setSession(
      session.accessToken,
      mapWelmSessionToAuthUser(session),
      session.refreshToken,
    );
    return destination;
  }

  store.clearSession();
  store.setPendingSession(session);
  return destination;
}

/**
 * US-2.6 — one helper for Apple / Google.
 * Consumes `{ accessToken, refreshToken, user, isNew }`.
 */
export function completeSocialSignIn(
  session: WelmAuthSession,
): WelmPostAuthDestination {
  return applyWelmAuthSession(session);
}

/** US-5 «متابعة كـ {firstName}» — open the parked session. */
export function commitPendingWelmSession(): boolean {
  const pending = useAuthStore.getState().pendingSession;
  if (!pending?.accessToken) {
    return false;
  }
  useAuthStore
    .getState()
    .setSession(
      pending.accessToken,
      mapWelmSessionToAuthUser(pending),
      pending.refreshToken,
    );
  return true;
}

/** US-3 unlink / US-5 dismiss — drop incomplete or unopened session. */
export async function discardWelmAuth(options?: {
  revoke?: boolean;
}): Promise<void> {
  const store = useAuthStore.getState();
  if (options?.revoke && store.accessToken) {
    try {
      await logoutWelmSession();
    } catch {
      // Local drop always wins.
    }
  }
  store.clearSession();
}
