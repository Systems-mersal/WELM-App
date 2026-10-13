export const LICENSE_TYPES = [
  "private",
  "public",
  "motorcycle",
  "heavy",
] as const;

export type LicenseType = (typeof LICENSE_TYPES)[number];

export const ID_DOCUMENT_TYPES = [
  "national",
  "resident",
  "gcc",
  "visitor",
] as const;

export const PROFILE_GATE_ID_TYPES = ["national", "resident"] as const;

export type IdDocumentType = (typeof ID_DOCUMENT_TYPES)[number];

export const GCC_NATIONALITY_CODES = [
  "SA",
  "AE",
  "KW",
  "QA",
  "BH",
  "OM",
] as const;

export function isIdDocumentType(value: unknown): value is IdDocumentType {
  return (
    typeof value === "string" &&
    (ID_DOCUMENT_TYPES as readonly string[]).includes(value)
  );
}

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
  "FR",
  "DE",
  "CN",
  "ET",
  "ER",
  "SO",
  "NP",
  "LK",
  "KE",
  "NG",
  "IT",
  "ES",
  "CA",
  "AU",
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
