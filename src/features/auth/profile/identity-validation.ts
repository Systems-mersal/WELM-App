import type { IdDocumentType } from "./lookups";
import { GCC_NATIONALITY_CODES } from "./lookups";
import { YAKEEN_CITIES, YAKEEN_NATIONALITIES } from "./yakeen-lookups";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LICENSE = /^[0-9/]+$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export type IdentityValues = {
  idType: IdDocumentType;
  name: string;
  nationalId: string;
  dateOfBirth: string;
  nationality: string;
  idCopyNumber: string;
  licenseNumber: string;
  licenseExpiry: string;
  placeOfIssue: string;
  email: string;
  address: string;
};

export type IdentityField =
  | "name"
  | "nationalId"
  | "dateOfBirth"
  | "nationality"
  | "idCopyNumber"
  | "licenseNumber"
  | "licenseExpiry"
  | "placeOfIssue"
  | "email"
  | "address";

export type IdentityUniquenessErrors = Partial<
  Record<"nationalId" | "licenseNumber", string>
>;

function isPastOrToday(value: string): boolean {
  if (!ISO_DATE.test(value)) {
    return false;
  }
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return false;
  }
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return parsed <= today;
}

function isTodayOrFuture(value: string): boolean {
  if (!ISO_DATE.test(value)) {
    return false;
  }
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return false;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return parsed >= today;
}

function needsLicense(idType: IdDocumentType): boolean {
  return idType === "gcc" || idType === "visitor";
}

export function identityFieldError(
  field: IdentityField,
  values: IdentityValues,
  uniqueness: IdentityUniquenessErrors,
): string | undefined {
  const name = values.name.trim();
  const nationalId = values.nationalId.trim();
  const email = values.email.trim();
  const address = values.address.trim();
  const licenseNumber = values.licenseNumber.trim();
  const placeOfIssue = values.placeOfIssue.trim();
  const idCopyNumber = values.idCopyNumber.trim();

  switch (field) {
    case "name":
      if (!name) {
        return "validation.nameRequired";
      }
      if (name.length < 2) {
        return "validation.nameMinLength";
      }
      if (name.length > 100) {
        return "validation.nameMaxLength";
      }
      return undefined;
    case "nationalId":
      if (uniqueness.nationalId) {
        return uniqueness.nationalId;
      }
      if (values.idType === "national" || values.idType === "resident") {
        if (!nationalId) {
          return "validation.nationalResidentIdRequired";
        }
        if (!/^\d+$/.test(nationalId)) {
          return "validation.idNumberDigitsOnly";
        }
        if (nationalId.length !== 10) {
          return "validation.idNumberMustBeTenDigits";
        }
        return undefined;
      }
      if (values.idType === "gcc") {
        if (!nationalId) {
          return "validation.nationalGccIdRequired";
        }
        if (nationalId.length > 50) {
          return "validation.idNumberMaxLength";
        }
        return undefined;
      }
      if (!nationalId) {
        return "validation.passportNumberRequired";
      }
      if (nationalId.length > 50) {
        return "validation.idNumberMaxLength";
      }
      return undefined;
    case "dateOfBirth":
      if (!values.dateOfBirth) {
        return "validation.birthDateRequired";
      }
      if (!isPastOrToday(values.dateOfBirth)) {
        return "validation.birthDateCannotBeFuture";
      }
      return undefined;
    case "nationality":
      if (values.idType === "national") {
        return undefined;
      }
      if (values.idType === "gcc") {
        return (GCC_NATIONALITY_CODES as readonly string[]).includes(
          values.nationality,
        )
          ? undefined
          : "validation.countryRequired";
      }
      if (!values.nationality) {
        return "validation.nationalityRequired";
      }
      return YAKEEN_NATIONALITIES.some((item) => item.code === values.nationality)
        ? undefined
        : "validation.nationalityRequired";
    case "idCopyNumber":
      if (!needsLicense(values.idType)) {
        return undefined;
      }
      if (!idCopyNumber) {
        return "validation.idCopyNumberRequired";
      }
      if (
        !/^\d+$/.test(idCopyNumber) ||
        Number(idCopyNumber) <= 0 ||
        !Number.isInteger(Number(idCopyNumber))
      ) {
        return "validation.idCopyNumberMustBePositive";
      }
      return undefined;
    case "licenseNumber":
      if (!needsLicense(values.idType)) {
        return undefined;
      }
      if (uniqueness.licenseNumber) {
        return uniqueness.licenseNumber;
      }
      if (!licenseNumber) {
        return "validation.licenseNumberRequired";
      }
      if (licenseNumber.length > 50) {
        return "validation.licenseNumberMaxLength";
      }
      if (!LICENSE.test(licenseNumber)) {
        return "validation.licenseNumberFormat";
      }
      return undefined;
    case "licenseExpiry":
      if (!needsLicense(values.idType)) {
        return undefined;
      }
      if (!values.licenseExpiry) {
        return "validation.licenseExpiryDateRequired";
      }
      if (!isTodayOrFuture(values.licenseExpiry)) {
        return "validation.licenseExpiryDateMustBeFuture";
      }
      return undefined;
    case "placeOfIssue":
      if (!needsLicense(values.idType)) {
        return undefined;
      }
      if (!placeOfIssue) {
        return "validation.placeOfIdIssueRequired";
      }
      return YAKEEN_CITIES.some((item) => item.code === placeOfIssue)
        ? undefined
        : "validation.placeOfIdIssueRequired";
    case "email":
      if (!email) {
        return "validation.emailRequired";
      }
      if (!EMAIL.test(email)) {
        return "validation.invalidEmailFormat";
      }
      return undefined;
    case "address":
      if (!address) {
        return "validation.addressRequired";
      }
      if (address.length < 4) {
        return "validation.addressMinLength";
      }
      if (address.length > 500) {
        return "validation.addressMaxLength";
      }
      return undefined;
    default:
      return undefined;
  }
}

const ALL_FIELDS: IdentityField[] = [
  "name",
  "nationalId",
  "dateOfBirth",
  "nationality",
  "idCopyNumber",
  "licenseNumber",
  "licenseExpiry",
  "placeOfIssue",
  "email",
  "address",
];

export function isIdentityFormValid(
  values: IdentityValues,
  uniqueness: IdentityUniquenessErrors,
): boolean {
  return ALL_FIELDS.every(
    (field) => identityFieldError(field, values, uniqueness) === undefined,
  );
}
