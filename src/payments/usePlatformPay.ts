import { useCallback, useEffect, useState } from "react";
import { SAMPLE_TOP_UP } from "./constants";
import { PaymentService } from "./PaymentService";
import type { PaymentError, PaymentResult, PayWithApplePayParams } from "./types";

export interface UsePlatformPayResult {
  isAvailable: boolean;
  isCheckingAvailability: boolean;
  isPaying: boolean;
  lastError: PaymentError | null;
  pay: (params?: Partial<PayWithApplePayParams>) => Promise<PaymentResult>;
  refreshAvailability: () => Promise<void>;
}

/**
 * React hook around PaymentService — owns loading / availability / error state.
 * Screens should not call the Stripe SDK directly.
 */
export function usePlatformPay(): UsePlatformPayResult {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [lastError, setLastError] = useState<PaymentError | null>(null);

  const refreshAvailability = useCallback(async () => {
    setIsCheckingAvailability(true);
    try {
      const supported = await PaymentService.isApplePayAvailable();
      setIsAvailable(supported);
    } catch {
      setIsAvailable(false);
    } finally {
      setIsCheckingAvailability(false);
    }
  }, []);

  useEffect(() => {
    void refreshAvailability();
  }, [refreshAvailability]);

  const pay = useCallback(
    async (overrides: Partial<PayWithApplePayParams> = {}): Promise<PaymentResult> => {
      setLastError(null);
      setIsPaying(true);

      const params: PayWithApplePayParams = {
        amountCents: overrides.amountCents ?? SAMPLE_TOP_UP.amountCents,
        currency: overrides.currency ?? SAMPLE_TOP_UP.currency,
        merchantCountryCode:
          overrides.merchantCountryCode ?? SAMPLE_TOP_UP.merchantCountryCode,
        merchantDisplayName:
          overrides.merchantDisplayName ?? SAMPLE_TOP_UP.merchantDisplayName,
        cartItems: overrides.cartItems ?? [
          {
            label: SAMPLE_TOP_UP.cartLabel,
            amountCents: overrides.amountCents ?? SAMPLE_TOP_UP.amountCents,
          },
        ],
      };

      try {
        const result = await PaymentService.payWithApplePay(params);
        if (result.status === "failure") {
          setLastError(result.error);
        }
        return result;
      } finally {
        setIsPaying(false);
      }
    },
    [],
  );

  return {
    isAvailable,
    isCheckingAvailability,
    isPaying,
    lastError,
    pay,
    refreshAvailability,
  };
}
