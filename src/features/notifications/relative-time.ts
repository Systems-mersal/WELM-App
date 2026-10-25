const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

export function formatNotificationRelativeTime(
  iso: string,
  t: (key: string, options?: Record<string, unknown>) => string,
  now = Date.now(),
): string {
  const created = Date.parse(iso);
  if (!Number.isFinite(created)) {
    return "";
  }

  const elapsed = Math.max(0, now - created);
  if (elapsed < MINUTE_MS) {
    return t("just-now");
  }
  if (elapsed < HOUR_MS) {
    return t("minutes-ago", { count: Math.floor(elapsed / MINUTE_MS) });
  }
  if (elapsed < DAY_MS) {
    return t("hours-ago", { count: Math.floor(elapsed / HOUR_MS) });
  }
  return t("days-ago", { count: Math.floor(elapsed / DAY_MS) });
}
