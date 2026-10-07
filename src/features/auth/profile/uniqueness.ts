/**
 * Identity uniqueness (national / resident / GCC ID, license, passport).
 * Stub until WELM exposes Tajeer `POST /api/customers/check-uniqueness`.
 * Always unique so save is not blocked; wire the return so under-field
 * copy can show when a later API reports a duplicate.
 */
export type IdentityUniquenessField =
  | "national_id_number"
  | "resident_id_number"
  | "gcc_id_number"
  | "license_number"
  | "passport_number";

export async function checkIdentityUniqueness(
  _field: IdentityUniquenessField,
  value: string,
): Promise<boolean> {
  if (!value.trim()) {
    return true;
  }
  return true;
}

export function uniquenessFieldForIdType(
  idType: "national" | "resident" | "gcc" | "visitor",
): IdentityUniquenessField {
  if (idType === "resident") {
    return "resident_id_number";
  }
  if (idType === "gcc") {
    return "gcc_id_number";
  }
  if (idType === "visitor") {
    return "passport_number";
  }
  return "national_id_number";
}
