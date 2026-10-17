import { isAxiosError } from "axios";
import {
  confirmPlatformPayPayment,
  isPlatformPaySupported,
  PlatformPay,
} from "@stripe/stripe-react-native";
import { apiClient } from "../lib/api-client";
import { PAYMENTS_API_BASE_URL, STRIPE_PUBLISHABLE_KEY } from "./constants";
import { formatAmountFromCents, toApplePayCurrencyCode } from "./money";
import type {
  CreateIntentResponse,
  PayWithApplePayParams,
  PaymentCurrency,
  PaymentError,
  PaymentResult,
} from "./types";

export class PaymentServiceError extends Error {
  readonly paymentError: PaymentError;

  constructor(paymentError: PaymentError) {
    super(paymentError.message);
    this.name = "PaymentServiceError";
    this.paymentError = paymentError;
  }
}

function networkError(detail?: string): PaymentError {
  return {
    code: "network",
    message:
      detail ??
      "Could not reach Tajeer Plus to start the payment.",
  };
}

function declinedError(detail?: string): PaymentError {
  return {
    code: "declined",
    message: detail ?? "Apple Pay declined this payment. Try another card in Wallet.",
  };
}

function unavailableError(): PaymentError {
  return {
    code: "unavailable",
    message: "Apple Pay is not available on this device or Wallet has no cards.",
  };
}

function invalidConfigError(): PaymentError {
  return {
    code: "invalid_config",
    message:
      "Stripe is not configured. Set EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY in your .env file.",
  };
}

function asPaymentCurrency(value: string | undefined, fallback: PaymentCurrency): PaymentCurrency {
  const code = (value ?? "").trim().toLowerCase();
  if (code === "usd" || code === "sar") return code;
  return fallback;
}

/**
 * Booking payments create the PaymentIntent on Tajeer Plus.
 * The Stripe secret key stays on that server.
 */
export const PaymentService = {
  async isApplePayAvailable(): Promise<boolean> {
    try {
      return await isPlatformPaySupported();
    } catch {
      return false;
    }
  },

  async createPaymentIntent(
    amountCents: number,
    currency: string,
  ): Promise<CreateIntentResponse> {
    if (!STRIPE_PUBLISHABLE_KEY || STRIPE_PUBLISHABLE_KEY.includes("REPLACE_ME")) {
      throw new PaymentServiceError(invalidConfigError());
    }

    let response: Response;
    try {
      response = await fetch(`${PAYMENTS_API_BASE_URL}/api/payments/create-intent`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: amountCents, currency }),
      });
    } catch {
      throw new PaymentServiceError(networkError());
    }

    let payload: Partial<CreateIntentResponse> & { message?: string } = {};
    try {
      payload = (await response.json()) as typeof payload;
    } catch {
      throw new PaymentServiceError(
        networkError("Payments server returned an invalid response."),
      );
    }

    if (!response.ok || !payload.clientSecret) {
      throw new PaymentServiceError(
        networkError(payload.message ?? `Payments server error (${response.status}).`),
      );
    }

    return {
      clientSecret: payload.clientSecret,
      paymentIntentId: payload.paymentIntentId ?? "",
    };
  },

  async createBookingPaymentIntent(bookingId: string): Promise<
    CreateIntentResponse & { amountCents: number; currency: string }
  > {
    if (!STRIPE_PUBLISHABLE_KEY || STRIPE_PUBLISHABLE_KEY.includes("REPLACE_ME")) {
      throw new PaymentServiceError(invalidConfigError());
    }

    try {
      const { data } = await apiClient.post<{
        clientSecret?: string;
        paymentIntentId?: string;
        amountCents?: number;
        currency?: string;
        error?: string;
      }>(`/api/welm/bookings/${bookingId}/payment-intent`);

      if (!data?.clientSecret || !data.paymentIntentId || !data.amountCents) {
        throw new PaymentServiceError(
          networkError("Tajeer Plus did not return a payment secret."),
        );
      }

      return {
        clientSecret: data.clientSecret,
        paymentIntentId: data.paymentIntentId,
        amountCents: data.amountCents,
        currency: data.currency ?? "sar",
      };
    } catch (error) {
      if (error instanceof PaymentServiceError) throw error;
      if (isAxiosError(error)) {
        const body = error.response?.data as { error?: string } | undefined;
        throw new PaymentServiceError(
          networkError(body?.error ?? "Could not reach Tajeer Plus to start the payment."),
        );
      }
      throw new PaymentServiceError(
        networkError("Could not reach Tajeer Plus to start the payment."),
      );
    }
  },

  async payWithApplePay(params: PayWithApplePayParams): Promise<PaymentResult> {
    const available = await PaymentService.isApplePayAvailable();
    if (!available) {
      return { status: "failure", error: unavailableError() };
    }

    let clientSecret: string;
    let paymentIntentId: string;
    let amountCents = params.amountCents;
    let currency = params.currency;
    try {
      if (params.bookingId) {
        const intent = await PaymentService.createBookingPaymentIntent(params.bookingId);
        clientSecret = intent.clientSecret;
        paymentIntentId = intent.paymentIntentId;
        amountCents = intent.amountCents;
        currency = asPaymentCurrency(intent.currency, params.currency);
      } else {
        const intent = await PaymentService.createPaymentIntent(
          params.amountCents,
          params.currency,
        );
        clientSecret = intent.clientSecret;
        paymentIntentId = intent.paymentIntentId;
      }
    } catch (error) {
      if (error instanceof PaymentServiceError) {
        return { status: "failure", error: error.paymentError };
      }
      return {
        status: "failure",
        error: networkError(error instanceof Error ? error.message : undefined),
      };
    }

    const lineItems: PlatformPay.CartSummaryItem[] = (params.cartItems ?? []).map(
      (item) => ({
        label: item.label,
        amount: formatAmountFromCents(params.bookingId ? amountCents : item.amountCents),
        paymentType: PlatformPay.PaymentType.Immediate as const,
      }),
    );

    const { error, paymentIntent } = await confirmPlatformPayPayment(clientSecret, {
      applePay: {
        cartItems: [
          ...lineItems,
          {
            label: params.merchantDisplayName,
            amount: formatAmountFromCents(amountCents),
            paymentType: PlatformPay.PaymentType.Immediate as const,
          },
        ],
        merchantCountryCode: params.merchantCountryCode,
        currencyCode: toApplePayCurrencyCode(currency),
      },
    });

    if (error) {
      if (error.code === "Canceled") {
        return { status: "canceled" };
      }
      return {
        status: "failure",
        error: declinedError(error.message),
      };
    }

    return {
      status: "success",
      paymentIntentId: paymentIntent?.id ?? paymentIntentId,
      amountCents,
      currency,
    };
  },
};
