import {
  confirmPlatformPayPayment,
  isPlatformPaySupported,
  PlatformPay,
} from "@stripe/stripe-react-native";
import { PAYMENTS_API_BASE_URL, STRIPE_PUBLISHABLE_KEY } from "./constants";
import { formatAmountFromCents, toApplePayCurrencyCode } from "./money";
import type {
  CreateIntentResponse,
  PayWithApplePayParams,
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
      "Could not reach the payments server. Check that it is running and EXPO_PUBLIC_PAYMENTS_API_URL is correct.",

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

/**
 * Framework-agnostic payments API.
 * Talks to our Express stub for client secrets, then to Stripe Platform Pay.
 * Never receives or uses a Stripe secret key.
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

  async payWithApplePay(params: PayWithApplePayParams): Promise<PaymentResult> {
    const available = await PaymentService.isApplePayAvailable();
    if (!available) {
      return { status: "failure", error: unavailableError() };
    }

    let clientSecret: string;
    let paymentIntentId: string;
    try {
      const intent = await PaymentService.createPaymentIntent(
        params.amountCents,
        params.currency,
      );
      clientSecret = intent.clientSecret;
      paymentIntentId = intent.paymentIntentId;
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
        amount: formatAmountFromCents(item.amountCents),
        paymentType: PlatformPay.PaymentType.Immediate as const,
      }),
    );

    const { error, paymentIntent } = await confirmPlatformPayPayment(clientSecret, {
      applePay: {
        cartItems: [
          ...lineItems,
          {
            label: params.merchantDisplayName,
            amount: formatAmountFromCents(params.amountCents),
            paymentType: PlatformPay.PaymentType.Immediate as const,
          },
        ],
        merchantCountryCode: params.merchantCountryCode,
        currencyCode: toApplePayCurrencyCode(params.currency),
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
    };
  },
};
