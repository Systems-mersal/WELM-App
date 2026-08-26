import React from "react";
import { StripeProvider } from "@stripe/stripe-react-native";
import { APPLE_MERCHANT_ID, STRIPE_PUBLISHABLE_KEY } from "./constants";

interface PaymentProviderProps {
  children: React.ReactElement | React.ReactElement[];
}

/**
 * App-root Stripe wrapper.
 *
 * TODO — plug in real credentials:
 * - EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY (pk_test_… / pk_live_…)
 * - EXPO_PUBLIC_APPLE_MERCHANT_ID (merchant.com.… from Apple Developer)
 *
 * Apple Pay: test on a physical device (not the simulator). Upload a Stripe
 * Apple Pay certificate in the Stripe Dashboard and link it to the merchant ID.
 */
export function PaymentProvider({ children }: PaymentProviderProps) {
  return (
    <StripeProvider
      publishableKey={STRIPE_PUBLISHABLE_KEY}
      merchantIdentifier={APPLE_MERCHANT_ID}
    >
      {children}
    </StripeProvider>
  );
}
