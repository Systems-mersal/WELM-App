import type { WelmNotificationDto, WelmNotificationTarget } from "./api";

type PushNavigation = {
  navigate: {
    (name: "Documents"): void;
    (name: "BookingDetail", params: { bookingId: string }): void;
  };
};

export type WelmPushPayload = {
  target: WelmNotificationTarget;
  bookingId: string | null;
};

const AUTH_GATE_ROUTES = new Set(["Splash", "Onboarding", "Login"]);

let pending: WelmPushPayload | null = null;

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function isAuthGateRoute(routeName: string | undefined): boolean {
  return Boolean(routeName && AUTH_GATE_ROUTES.has(routeName));
}

export function parseWelmPushData(
  data: Record<string, unknown> | undefined | null,
): WelmPushPayload | null {
  if (!data) {
    return null;
  }
  const target: WelmNotificationTarget =
    asString(data.target) === "documents" ? "documents" : "booking";
  const bookingId = asString(data.bookingId) || null;
  if (target === "documents") {
    return { target, bookingId };
  }
  if (!bookingId) {
    return null;
  }
  return { target, bookingId };
}

export function payloadFromInboxItem(
  item: WelmNotificationDto,
): WelmPushPayload {
  return {
    target: item.metadata.target,
    bookingId: item.metadata.bookingId ?? item.entityId,
  };
}

export function rememberPushPayload(payload: WelmPushPayload | null): void {
  pending = payload;
}

export function takePendingPushPayload(): WelmPushPayload | null {
  const next = pending;
  pending = null;
  return next;
}

export function openWelmPushTarget(
  navigation: PushNavigation,
  payload: WelmPushPayload,
): void {
  if (payload.target === "documents") {
    navigation.navigate("Documents");
    return;
  }
  if (payload.bookingId) {
    navigation.navigate("BookingDetail", { bookingId: payload.bookingId });
  }
}

export function consumePendingPush(navigation: PushNavigation): void {
  const payload = takePendingPushPayload();
  if (!payload) {
    return;
  }
  openWelmPushTarget(navigation, payload);
}
