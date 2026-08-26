import Stripe from "stripe";
import { env } from "../config/env";

/** In-memory store so a real DB/schema can replace this later without changing the controller. */
const paymentIntentStore = new Map<string, Stripe.PaymentIntent>();

const stripe = new Stripe(env.stripeSecretKey, {
  apiVersion: "2025-02-24.acacia",
});

export interface CreatePaymentIntentInput {
  /** Amount in the smallest currency unit (e.g. halalas for SAR, cents for USD). */
  amount: number;
  currency: string;
}

export async function createPaymentIntent(
  input: CreatePaymentIntentInput,
): Promise<{ clientSecret: string; paymentIntentId: string }> {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: input.amount,
    currency: input.currency.toLowerCase(),
    // Apple Pay confirms on-device; card is fine as a fallback method type.
    automatic_payment_methods: { enabled: true },
    metadata: {
      source: "welm-local-dev",
    },
  });

  if (!paymentIntent.client_secret) {
    throw new Error("Stripe did not return a client_secret for the PaymentIntent.");
  }

  paymentIntentStore.set(paymentIntent.id, paymentIntent);

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  };
}

export function getStoredPaymentIntent(id: string): Stripe.PaymentIntent | undefined {
  return paymentIntentStore.get(id);
}
