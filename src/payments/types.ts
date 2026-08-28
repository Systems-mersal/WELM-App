/**
 * Payment domain types — framework-agnostic.
 * Amounts are always in the smallest currency unit unless noted otherwise.
 */

export type PaymentCurrency = "sar" | "usd";

export interface CartSummary {
  /** Line items for the Apple Pay sheet (display amounts as decimal strings). */
  label: string;
  /** Amount in smallest currency unit (e.g. 10000 = 100.00 SAR). */
  amountCents: number;
}

export type PaymentErrorCode =
  | "unavailable"
  | "network"
  | "declined"
  | "canceled"
  | "invalid_config"
  | "unknown";

export interface PaymentError {
  code: PaymentErrorCode;
  message: string;
}

export type PaymentResult =
  | { status: "success"; paymentIntentId: string }
  | { status: "canceled" }
  | { status: "failure"; error: PaymentError };

export interface CreateIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

export interface PayWithApplePayParams {
  /** Total charge in smallest currency unit. */
  amountCents: number;
  currency: PaymentCurrency;
  /** Merchant display name shown as the final Apple Pay cart row. */
  merchantDisplayName: string;
  /** Optional line items (excluding the final total row). */
  cartItems?: CartSummary[];
  /** ISO country code for Apple Pay (e.g. SA). */
  merchantCountryCode: string;
}
