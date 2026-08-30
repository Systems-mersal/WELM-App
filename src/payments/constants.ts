import type { PaymentCurrency } from "./types";

/**
 * Sample "Add Funds" charge used on Profile.
 * Amounts are in the smallest currency unit (halalas for SAR).
 * 10000 = 100.00 SAR — change here, not in the screen.
 */
export const SAMPLE_TOP_UP = {
  amountCents: 10_000,
  currency: "sar" as PaymentCurrency,
  merchantCountryCode: "SA",
  merchantDisplayName: "WELM",
  cartLabel: "Account top-up",
} as const;

/** Apple Merchant ID — replace with your real ID from Apple Developer. */
export const APPLE_MERCHANT_ID =
  process.env.EXPO_PUBLIC_APPLE_MERCHANT_ID ?? "merchant.com.welm.tajeerplus";

/** Stripe publishable key only (never the secret key). */
export const STRIPE_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "pk_test_REPLACE_ME";

/**
 * Local Stripe PaymentIntent stub (`/server`), not Tajeer Plus.
 * Keep separate from `EXPO_PUBLIC_API_URL` (Tajeer Plus origin).
 * Simulator: http://localhost:3001
 * Physical device: http://<your-mac-lan-ip>:3001
 */
export const PAYMENTS_API_BASE_URL =
  process.env.EXPO_PUBLIC_PAYMENTS_API_URL ?? "http://localhost:3001";
