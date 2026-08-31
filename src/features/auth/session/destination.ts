import type { WelmAuthSession } from "../api/types";

export type WelmPostAuthDestination = "link-mobile" | "account-exists";

/**
 * US-2.6 — Tajeer Plus `isNew`.
 * true → US-3 Link Mobile; false → US-5 Account Exists.
 */
export function getWelmPostAuthDestination(
  session: Pick<WelmAuthSession, "isNew">,
): WelmPostAuthDestination {
  return session.isNew ? "link-mobile" : "account-exists";
}
