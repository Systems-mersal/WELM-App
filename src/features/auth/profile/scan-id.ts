import axios from "axios";

import { getApiBaseUrl } from "../../../lib/api-base-url";
import { apiClient } from "../../../lib/api-client";
import { useAuthStore } from "../../../stores/auth-store";
import type { IdDocumentType } from "./lookups";
import {
  isLicenseType,
  isNationalityCode,
  type LicenseType,
  type NationalityCode,
} from "./lookups";

export type ScanIdFields = {
  idType?: IdDocumentType;
  name?: string;
  nationalId?: string;
  birthDate?: string;
  nationality?: NationalityCode;
  licenseNumber?: string;
  licenseType?: LicenseType;
  licenseExpiry?: string;
  placeOfIssue?: string;
};

export type ScanIdMeta = {
  filledFields: number;
  totalFields: number;
  provider: "google-vision" | "mock";
};

export type ScanIdSuccess = {
  ok: true;
  fields: ScanIdFields;
  meta: ScanIdMeta;
};

export type ScanIdFailure = {
  ok: false;
  error: string;
};

export type ScanIdResult = ScanIdSuccess | ScanIdFailure;

const SCAN_PATH = "/api/customers/scan-id";

/** Form fields we try to fill from a scan (Y in “X of Y”). */
export const SCAN_TRACKED_KEYS = [
  "idType",
  "name",
  "nationalId",
  "birthDate",
  "nationality",
  "licenseNumber",
  "licenseExpiry",
  "placeOfIssue",
] as const;

export type ScanTrackedKey = (typeof SCAN_TRACKED_KEYS)[number];

function countFilled(fields: ScanIdFields): number {
  return SCAN_TRACKED_KEYS.filter((key) => {
    const value = fields[key];
    return typeof value === "string" && value.trim().length > 0;
  }).length;
}

/** Dev / first-PR mock when Tajeer OCR is unavailable. */
export function mockExtractIdScan(): ScanIdSuccess {
  const fields: ScanIdFields = {
    idType: "national",
    name: "خالد عبدالله محمد",
    nationalId: "1098765432",
    birthDate: "1992-05-14",
    nationality: "SA",
    licenseNumber: "2400123456",
    licenseType: "private",
    licenseExpiry: "2028-11-01",
    placeOfIssue: "الرياض",
  };
  return {
    ok: true,
    fields,
    meta: {
      filledFields: countFilled(fields),
      totalFields: SCAN_TRACKED_KEYS.length,
      provider: "mock",
    },
  };
}

function mapApiFields(raw: Record<string, unknown>): ScanIdFields {
  const idTypeKey =
    raw.idTypeKey === "resident" || raw.idTypeKey === "national"
      ? raw.idTypeKey
      : undefined;
  const nationalityRaw =
    typeof raw.nationality === "string" ? raw.nationality : undefined;
  const nationality =
    nationalityRaw && isNationalityCode(nationalityRaw)
      ? nationalityRaw
      : idTypeKey === "national"
        ? "SA"
        : undefined;

  const licenseTypeRaw =
    typeof raw.licenseType === "string" ? raw.licenseType : undefined;

  return {
    idType: idTypeKey,
    name: typeof raw.name === "string" ? raw.name : undefined,
    nationalId:
      typeof raw.nationalOrResidentIdNumber === "string"
        ? raw.nationalOrResidentIdNumber
        : typeof raw.nationalId === "string"
          ? raw.nationalId
          : undefined,
    birthDate: typeof raw.birthDate === "string" ? raw.birthDate : undefined,
    nationality,
    licenseNumber:
      typeof raw.licenseNumber === "string" ? raw.licenseNumber : undefined,
    licenseType: isLicenseType(licenseTypeRaw) ? licenseTypeRaw : undefined,
    licenseExpiry:
      typeof raw.licenseExpiry === "string" ? raw.licenseExpiry : undefined,
    placeOfIssue:
      typeof raw.placeOfIssue === "string" ? raw.placeOfIssue : undefined,
  };
}

/**
 * POST image to Tajeer `/api/customers/scan-id`.
 * Falls back to mock extraction when the API is missing / unauthorized / OCR off.
 */
export async function scanCustomerIdImage(uri: string): Promise<ScanIdResult> {
  const token = useAuthStore.getState().accessToken;
  const form = new FormData();
  const fileName = uri.split("/").pop() || "id-scan.jpg";
  form.append("file", {
    uri,
    name: fileName,
    type: "image/jpeg",
  } as unknown as Blob);

  try {
    const { data } = await apiClient.post<{
      success?: boolean;
      fields?: Record<string, unknown>;
      meta?: { filledFields?: number; totalFields?: number; provider?: string };
      error?: string;
    }>(SCAN_PATH, form, {
      headers: {
        "Content-Type": "multipart/form-data",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      timeout: 60_000,
    });

    if (!data?.success || !data.fields) {
      return {
        ok: false,
        error:
          data?.error ||
          "Could not extract customer ID details from this image. Try a clearer photo.",
      };
    }

    const fields = mapApiFields(data.fields);
    const filled = data.meta?.filledFields ?? countFilled(fields);
    const total = data.meta?.totalFields ?? SCAN_TRACKED_KEYS.length;

    return {
      ok: true,
      fields,
      meta: {
        filledFields: filled,
        totalFields: total,
        provider: "google-vision",
      },
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message =
        (typeof error.response?.data?.error === "string" &&
          error.response.data.error) ||
        error.message;

      // Staff-only / undeployed / OCR not configured → mock for first PR.
      if (
        status === 401 ||
        status === 404 ||
        status === 501 ||
        status === 502 ||
        status === 503 ||
        error.code === "ECONNREFUSED" ||
        error.code === "ERR_NETWORK"
      ) {
        if (__DEV__) {
          console.info(
            "[welm] scan-id API unavailable; using mock extraction",
            { status, base: getApiBaseUrl(), message },
          );
        }
        return mockExtractIdScan();
      }

      return { ok: false, error: message };
    }

    if (__DEV__) {
      console.info("[welm] scan-id failed; using mock extraction", error);
    }
    return mockExtractIdScan();
  }
}

export function autofilledKeysFromFields(
  fields: ScanIdFields,
): Set<ScanTrackedKey> {
  const keys = new Set<ScanTrackedKey>();
  for (const key of SCAN_TRACKED_KEYS) {
    const value = fields[key];
    if (typeof value === "string" && value.trim().length > 0) {
      keys.add(key);
    }
  }
  return keys;
}
