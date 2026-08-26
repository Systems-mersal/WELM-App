const SAUDI_MOBILE = /^5\d{8}$/;

export function normalizeSaudiMobile(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("966") && digits.length >= 12) {
    return digits.slice(3);
  }
  if (digits.startsWith("0") && digits.length === 10) {
    return digits.slice(1);
  }
  return digits;
}

export function isValidSaudiMobile(value: string): boolean {
  return SAUDI_MOBILE.test(normalizeSaudiMobile(value));
}
