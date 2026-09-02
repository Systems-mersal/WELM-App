export const LICENSE_TYPES = [
  "private",
  "public",
  "motorcycle",
  "heavy",
] as const;

export type LicenseType = (typeof LICENSE_TYPES)[number];

export const NATIONALITY_CODES = [
  "SA",
  "AE",
  "KW",
  "QA",
  "BH",
  "OM",
  "EG",
  "JO",
  "YE",
  "SD",
  "PS",
  "LB",
  "SY",
  "IQ",
  "MA",
  "TN",
  "DZ",
  "LY",
  "TR",
  "PK",
  "IN",
  "ID",
  "PH",
  "BD",
  "GB",
  "US",
] as const;

export type NationalityCode = (typeof NATIONALITY_CODES)[number];

export const DEFAULT_NATIONALITY: NationalityCode = "SA";

export function isLicenseType(value: unknown): value is LicenseType {
  return (
    typeof value === "string" &&
    (LICENSE_TYPES as readonly string[]).includes(value)
  );
}

export function isNationalityCode(value: unknown): value is NationalityCode {
  return (
    typeof value === "string" &&
    (NATIONALITY_CODES as readonly string[]).includes(value)
  );
}
