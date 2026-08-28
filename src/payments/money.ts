/** Format smallest-unit amount for Apple Pay / display (e.g. 10000 → "100.00"). */
export function formatAmountFromCents(amountCents: number): string {
  return (amountCents / 100).toFixed(2);
}

/** Uppercase ISO currency for Apple Pay sheet. */
export function toApplePayCurrencyCode(currency: string): string {
  return currency.toUpperCase();
}
