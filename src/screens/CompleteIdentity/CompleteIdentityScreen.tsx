import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useTranslation } from "react-i18next";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { AppButton } from "../../components/buttons/AppButton";
import { InlineErrorBanner } from "../../components/common/InlineErrorBanner";
import { Screen } from "../../components/common/Screen";
import { CalendarToggle, type BirthCalendar } from "../../components/forms/CalendarToggle";
import { AppInput } from "../../components/forms/AppInput";
import { SaudiPhoneField } from "../../components/forms/SaudiPhoneField";
import { SelectField } from "../../components/forms/SelectField";
import { AppIcon } from "../../components/icons/AppIcon";
import { StackScreenHeader } from "../../components/layout/StackScreenHeader";
import {
  GregorianDateSheet,
  defaultGregorianDraftIso,
  formatGregorianSummary,
  todayGregorianIso,
} from "../../components/sheets/GregorianDateSheet";
import { HijriDateSheet } from "../../components/sheets/HijriDateSheet";
import { SearchSelectSheet } from "../../components/sheets/SearchSelectSheet";
import { SelectSheet } from "../../components/sheets/SelectSheet";
import { AppText } from "../../components/typography/AppText";
import {
  fetchWelmCompanies,
  patchWelmProfile,
  routeAfterIdentity,
  welmAuthUserMessage,
  welmCompanyDisplayName,
  type WelmCompanyOption,
} from "../../features/auth";
import {
  identityFieldError,
  isIdentityFormValid,
  type IdentityField,
  type IdentityUniquenessErrors,
  type IdentityValues,
} from "../../features/auth/profile/identity-validation";
import {
  DEFAULT_NATIONALITY,
  ID_DOCUMENT_TYPES,
  type IdDocumentType,
  type NationalityCode,
} from "../../features/auth/profile/lookups";
import {
  autofilledKeysFromFields,
  scanCustomerIdImage,
  type ScanTrackedKey,
} from "../../features/auth/profile/scan-id";
import { IdScanCameraSheet } from "../../features/auth/ui/IdScanCameraSheet";
import { IdScanCard } from "../../features/auth/ui/IdScanCard";
import {
  GCC_COUNTRIES,
  YAKEEN_CITIES,
  YAKEEN_NATIONALITIES,
  lookupLabel,
  lookupOptions,
} from "../../features/auth/profile/yakeen-lookups";
import {
  checkIdentityUniqueness,
  uniquenessFieldForIdType,
} from "../../features/auth/profile/uniqueness";
import {
  defaultHijriDraft,
  defaultHijriFutureDraft,
  formatHijriIso,
  formatHijriSummary,
  hijriFromStored,
  hijriToGregorianIso,
  type HijriYmd,
} from "../../lib/hijri";
import { useRtl } from "../../hooks/useRtl";
import type { RootStackParamList } from "../../navigation/types";
import { resolveSignInMethod, useAuthStore } from "../../stores/auth-store";
import { colors } from "../../theme/colors";
import { fontFamily, fontSize } from "../../theme/typography";
import {
  isValidSaudiMobile,
  normalizeSaudiMobile,
} from "../../utils/saudi-mobile";

type Props = NativeStackScreenProps<RootStackParamList, "CompleteIdentity">;
type OpenSheet =
  | "company"
  | "idType"
  | "nationality"
  | "dob"
  | "licenseExpiry"
  | "placeOfIssue"
  | null;
type Touched = Partial<Record<IdentityField, boolean>>;
type ScanBanner =
  | { kind: "success" | "partial"; filled: number; total: number }
  | { kind: "error"; message: string }
  | null;

function TwoSegmentProgress() {
  return (
    <View className="flex-row items-center gap-2" accessibilityRole="progressbar">
      <View className="h-1.5 flex-1 rounded-full bg-primary opacity-70" />
      <View className="h-1.5 flex-1 rounded-full bg-primary" />
    </View>
  );
}

export function CompleteIdentityScreen({ navigation, route }: Props) {
  const { t, i18n } = useTranslation(["complete-identity", "common"]);
  const { textAlign } = useRtl();
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const signedInWithPhone = resolveSignInMethod(user) === "phone";
  const phoneDigits = normalizeSaudiMobile(
    route.params?.phone || user?.phone || "",
  );
  const [mobile, setMobile] = useState(signedInWithPhone ? "" : phoneDigits);
  const [phoneTouched, setPhoneTouched] = useState(false);

  const [idType, setIdType] = useState<IdDocumentType>("national");
  const [name, setName] = useState(
    user?.name && user.name !== "User" ? user.name : "",
  );
  const [nationalId, setNationalId] = useState("");
  const [birthCalendar, setBirthCalendar] = useState<BirthCalendar>(
    user?.dateOfBirthCalendar === "gregorian" ? "gregorian" : "hijri",
  );
  const [hijriDob, setHijriDob] = useState<HijriYmd | null>(() =>
    user?.dateOfBirthCalendar === "gregorian"
      ? null
      : hijriFromStored(user?.dateOfBirthHijri, user?.dateOfBirth),
  );
  const [gregorianDob, setGregorianDob] = useState(
    user?.dateOfBirthCalendar === "gregorian" ? (user.dateOfBirth ?? "") : "",
  );
  const [idCopyNumber, setIdCopyNumber] = useState("");
  const [nationality, setNationality] = useState<NationalityCode | "">("");
  const [cameraOpen, setCameraOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [autofilled, setAutofilled] = useState<Set<ScanTrackedKey>>(
    () => new Set(),
  );
  const [scanBanner, setScanBanner] = useState<ScanBanner>(null);
  const [licenseNumber, setLicenseNumber] = useState("");
  const [hijriLicenseExpiry, setHijriLicenseExpiry] = useState<HijriYmd | null>(
    null,
  );
  const [placeOfIssue, setPlaceOfIssue] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [address, setAddress] = useState("");
  const [openSheet, setOpenSheet] = useState<OpenSheet>(null);
  const [companies, setCompanies] = useState<WelmCompanyOption[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyTouched, setCompanyTouched] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [touched, setTouched] = useState<Touched>({});
  const [uniqueness, setUniqueness] = useState<IdentityUniquenessErrors>({});

  const needsLicense = idType === "gcc" || idType === "visitor";
  const showCountry = idType === "gcc";
  const tenDigitId = idType === "national" || idType === "resident";
  const dateOfBirth =
    birthCalendar === "hijri"
      ? hijriDob
        ? hijriToGregorianIso(hijriDob)
        : ""
      : gregorianDob;
  const licenseExpiry = hijriLicenseExpiry
    ? hijriToGregorianIso(hijriLicenseExpiry)
    : "";
  const nationalityItems = showCountry ? GCC_COUNTRIES : YAKEEN_NATIONALITIES;

  const values: IdentityValues = useMemo(
    () => ({
      idType,
      name,
      nationalId,
      dateOfBirth,
      nationality,
      idCopyNumber,
      licenseNumber,
      licenseExpiry,
      placeOfIssue,
      email,
      address,
    }),
    [
      address,
      dateOfBirth,
      email,
      idCopyNumber,
      idType,
      licenseExpiry,
      licenseNumber,
      name,
      nationalId,
      nationality,
      placeOfIssue,
    ],
  );

  const nationalityOptions = useMemo(
    () => lookupOptions(nationalityItems, i18n.language),
    [i18n.language, nationalityItems],
  );
  const idTypeOptions = useMemo(
    () =>
      ID_DOCUMENT_TYPES.map((type) => ({
        value: type,
        label: t(`id-type-${type}`),
      })),
    [t],
  );
  const cityOptions = useMemo(
    () => lookupOptions(YAKEEN_CITIES, i18n.language),
    [i18n.language],
  );
  const hijriMonthLabels = useMemo(
    () =>
      Object.fromEntries(
        Array.from({ length: 12 }, (_, index) => {
          const month = String(index + 1);
          return [month, t(`hijri-month.${month}`)];
        }),
      ),
    [t],
  );
  const gregorianMonthLabels = useMemo(
    () =>
      Object.fromEntries(
        Array.from({ length: 12 }, (_, index) => {
          const month = String(index + 1);
          return [month, t(`gregorian-month.${month}`)];
        }),
      ),
    [t],
  );
  const weekdayLabels = t("weekday-sat-first", {
    returnObjects: true,
  }) as string[];
  const formatHijriField = useCallback(
    (value: HijriYmd | null) => {
      if (!value) {
        return undefined;
      }
      return formatHijriSummary(value, t(`hijri-month.${value.month}`), {
        eastern: i18n.language.startsWith("ar"),
        suffix: t("hijri-era"),
      });
    },
    [i18n.language, t],
  );
  const dobLabel =
    birthCalendar === "hijri"
      ? formatHijriField(hijriDob)
      : gregorianDob
        ? formatGregorianSummary(
            gregorianDob,
            gregorianMonthLabels[String(Number(gregorianDob.slice(5, 7)))] ??
              "",
            { eastern: i18n.language.startsWith("ar") },
          )
        : undefined;
  const licenseExpiryLabel = formatHijriField(hijriLicenseExpiry);
  const nationalityLabel = lookupLabel(
    nationalityItems,
    nationality,
    i18n.language,
  );
  const placeOfIssueLabel = lookupLabel(
    YAKEEN_CITIES,
    placeOfIssue,
    i18n.language,
  );
  const phoneEntryValid = signedInWithPhone || isValidSaudiMobile(mobile);
  const formValid =
    isIdentityFormValid(values, uniqueness) && phoneEntryValid && Boolean(companyId);

  const markTouched = useCallback((field: IdentityField) => {
    setTouched((current) => ({ ...current, [field]: true }));
  }, []);

  const visibleError = useCallback(
    (field: IdentityField, value = "") => {
      const key = identityFieldError(field, values, uniqueness);
      if (!key) {
        return undefined;
      }
      const uniquenessHit =
        (field === "nationalId" && uniqueness.nationalId) ||
        (field === "licenseNumber" && uniqueness.licenseNumber);
      if (uniquenessHit || touched[field]) {
        return t(key);
      }
      const immediate = [
        "validation.licenseNumberFormat",
        "validation.invalidEmailFormat",
        "validation.idNumberDigitsOnly",
        "validation.idCopyNumberMustBePositive",
        "validation.licenseNumberMaxLength",
        "validation.idNumberMaxLength",
        "validation.nameMaxLength",
        "validation.addressMaxLength",
      ];
      if (immediate.includes(key) && value.trim().length > 0) {
        return t(key);
      }
      return undefined;
    },
    [t, touched, uniqueness, values],
  );

  useEffect(() => {
    let cancelled = false;
    void fetchWelmCompanies()
      .then((list) => {
        if (cancelled) {
          return;
        }
        setCompanies(list);
        setCompanyId(list.length === 1 ? list[0]?.id ?? null : null);
      })
      .catch(() => {
        if (!cancelled) {
          setCompanies([]);
          setCompanyId(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setCompaniesLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const trimmed = nationalId.trim();
    if (!trimmed) {
      setUniqueness((current) => ({ ...current, nationalId: undefined }));
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      void checkIdentityUniqueness(
        uniquenessFieldForIdType(idType),
        trimmed,
      ).then((unique) => {
        if (cancelled) {
          return;
        }
        setUniqueness((current) => ({
          ...current,
          nationalId: unique
            ? undefined
            : idType === "visitor"
              ? "validation.passportNumberAlreadyExists"
              : "validation.idNumberAlreadyExists",
        }));
      });
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [idType, nationalId]);

  useEffect(() => {
    const trimmed = licenseNumber.trim();
    if (!needsLicense || !trimmed) {
      setUniqueness((current) => ({ ...current, licenseNumber: undefined }));
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      void checkIdentityUniqueness("license_number", trimmed).then((unique) => {
        if (cancelled) {
          return;
        }
        setUniqueness((current) => ({
          ...current,
          licenseNumber: unique
            ? undefined
            : "validation.licenseNumberAlreadyExists",
        }));
      });
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [licenseNumber, needsLicense]);

  const clearAutofill = useCallback((key: ScanTrackedKey) => {
    setAutofilled((current) => {
      if (!current.has(key)) {
        return current;
      }
      const next = new Set(current);
      next.delete(key);
      return next;
    });
  }, []);

  const clearIdentityFields = useCallback(() => {
    setNationalId("");
    setBirthCalendar("hijri");
    setHijriDob(null);
    setGregorianDob("");
    setIdCopyNumber("");
    setLicenseNumber("");
    setHijriLicenseExpiry(null);
    setPlaceOfIssue("");
    setAddress("");
    if (signedInWithPhone) {
      setEmail("");
    } else {
      setMobile("");
      setPhoneTouched(false);
    }
    setTouched({});
    setUniqueness({});
    setAutofilled(new Set());
  }, [signedInWithPhone]);

  const handleSelectIdType = useCallback(
    (next: IdDocumentType) => {
      if (next === idType) {
        return;
      }
      setIdType(next);
      clearIdentityFields();
      setNationality(
        next === "national" || next === "gcc" ? DEFAULT_NATIONALITY : "",
      );
    },
    [clearIdentityFields, idType],
  );

  const applyScanResult = useCallback(
    async (uri: string) => {
      setScanning(true);
      setScanBanner(null);
      try {
        const result = await scanCustomerIdImage(uri);
        if (!result.ok) {
          setScanBanner({ kind: "error", message: t("scan-error") });
          return;
        }

        const { fields, meta } = result;
        setAutofilled(autofilledKeysFromFields(fields));
        const nextType = fields.idType ?? idType;
        if (fields.idType) {
          setIdType(fields.idType);
        }
        if (fields.name) {
          setName(fields.name);
        }
        if (fields.nationalId) {
          const digitsOnly = nextType === "national" || nextType === "resident";
          setNationalId(
            digitsOnly
              ? fields.nationalId.replace(/\D/g, "").slice(0, 10)
              : fields.nationalId,
          );
        }
        if (fields.nationality) {
          setNationality(fields.nationality);
        } else if (nextType === "national" || nextType === "gcc") {
          setNationality(DEFAULT_NATIONALITY);
        }
        if (fields.birthDate) {
          if (birthCalendar === "gregorian") {
            setGregorianDob(fields.birthDate);
            setHijriDob(null);
          } else {
            setHijriDob(hijriFromStored(undefined, fields.birthDate));
            setGregorianDob("");
          }
        }
        if (fields.licenseNumber) {
          setLicenseNumber(fields.licenseNumber);
        }
        if (fields.licenseExpiry) {
          setHijriLicenseExpiry(hijriFromStored(undefined, fields.licenseExpiry));
        }
        if (fields.placeOfIssue) {
          const city = YAKEEN_CITIES.find(
            (item) =>
              item.code === fields.placeOfIssue ||
              item.en === fields.placeOfIssue ||
              item.ar === fields.placeOfIssue,
          );
          if (city) {
            setPlaceOfIssue(city.code);
          }
        }

        setScanBanner({
          kind: meta.filledFields >= meta.totalFields ? "success" : "partial",
          filled: meta.filledFields,
          total: meta.totalFields,
        });
        setCameraOpen(false);
      } finally {
        setScanning(false);
      }
    },
    [birthCalendar, idType, t],
  );

  const pickFromGallery = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setScanBanner({ kind: "error", message: t("scan-gallery-denied") });
      return;
    }
    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.85,
    });
    if (picked.canceled || !picked.assets[0]?.uri) {
      return;
    }
    await applyScanResult(picked.assets[0].uri);
  }, [applyScanResult, t]);

  const pickFromNativeCamera = useCallback(async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setScanBanner({ kind: "error", message: t("scan-permission-denied") });
      void pickFromGallery();
      return;
    }
    const shot = await ImagePicker.launchCameraAsync({ quality: 0.85 });
    if (shot.canceled || !shot.assets[0]?.uri) {
      return;
    }
    await applyScanResult(shot.assets[0].uri);
  }, [applyScanResult, pickFromGallery, t]);

  const handleSave = useCallback(async () => {
    setSaveError(null);
    setCompanyTouched(true);
    setTouched({
      name: true,
      nationalId: true,
      dateOfBirth: true,
      nationality: true,
      idCopyNumber: true,
      licenseNumber: true,
      licenseExpiry: true,
      placeOfIssue: true,
      email: true,
      address: true,
    });
    if (!formValid || saveBusy) {
      return;
    }

    setSaveBusy(true);
    try {
      const ownerId = companyId;
      if (!ownerId) {
        setSaveError(t("validation.companyRequired"));
        return;
      }

      const storedNationality: NationalityCode =
        idType === "national" ? DEFAULT_NATIONALITY : (nationality as NationalityCode);
      const saved = await patchWelmProfile({
        companyId: ownerId,
        name: name.trim(),
        idDocumentType: idType,
        nationalId: nationalId.trim(),
        nationality: storedNationality,
        dateOfBirth,
        address: address.trim(),
        email: email.trim(),
        phone: signedInWithPhone
          ? undefined
          : `+966${normalizeSaudiMobile(mobile)}`,
        licenseNumber: needsLicense ? licenseNumber.trim() : undefined,
        licenseExpiry: needsLicense ? licenseExpiry.trim() : undefined,
        placeOfIssue: needsLicense ? placeOfIssue.trim() : undefined,
        passportNumber: idType === "visitor" ? nationalId.trim() : undefined,
        idCopyNumber: needsLicense ? idCopyNumber.trim() : undefined,
      });

      updateUser({
        customerId: saved.customerId,
        name: saved.user.name || name.trim(),
        firstName: saved.user.firstName || name.trim().split(/\s+/)[0],
        companyId: ownerId,
        companyName: companies.find((company) => company.id === ownerId)?.name,
        avatarUrl: saved.user.avatarUrl ?? undefined,
        email: email.trim(),
        phone: signedInWithPhone
          ? user?.phone || route.params?.phone
          : `+966${normalizeSaudiMobile(mobile)}`,
        idDocumentType: saved.user.idDocumentType ?? idType,
        nationalId: saved.user.nationalId ?? nationalId.trim(),
        nationality: storedNationality,
        dateOfBirth,
        dateOfBirthHijri:
          birthCalendar === "hijri" && hijriDob
            ? formatHijriIso(hijriDob)
            : undefined,
        dateOfBirthCalendar: birthCalendar,
        licenseNumber: needsLicense ? licenseNumber.trim() : undefined,
        licenseExpiry: needsLicense ? licenseExpiry.trim() : undefined,
        placeOfIssue: needsLicense ? placeOfIssue.trim() : undefined,
      });

      routeAfterIdentity(navigation);
    } catch (error) {
      setSaveError(
        welmAuthUserMessage(error, {
          unavailable: t("common:auth.api-unavailable"),
          fallback: t("save-error"),
        }),
      );
    } finally {
      setSaveBusy(false);
    }
  }, [
    address,
    birthCalendar,
    companies,
    companyId,
    dateOfBirth,
    email,
    formValid,
    hijriDob,
    idCopyNumber,
    idType,
    licenseExpiry,
    licenseNumber,
    mobile,
    name,
    nationalId,
    nationality,
    navigation,
    needsLicense,
    placeOfIssue,
    route.params?.phone,
    saveBusy,
    signedInWithPhone,
    t,
    updateUser,
    user?.phone,
  ]);

  const inputClass = "h-[56px]";
  const fallbackHijri = useMemo(() => defaultHijriDraft(), []);
  const fallbackHijriExpiry = useMemo(() => defaultHijriFutureDraft(), []);
  const autoLabel = t("scan-auto-filled");
  const bannerMessage =
    scanBanner?.kind === "error"
      ? scanBanner.message
      : scanBanner
        ? t(scanBanner.kind === "success" ? "scan-success" : "scan-partial", {
            filled: scanBanner.filled,
            total: scanBanner.total,
          })
        : null;

  return (
    <View className="flex-1">
      <Screen
        scrollable={false}
        edges={["bottom"]}
        className="bg-white"
        contentClassName="flex-1"
        header={
          <StackScreenHeader
            title={t("header")}
            onBack={() => navigation.goBack()}
          />
        }
      >
        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerClassName="pb-4"
        >
          <View className="mt-4">
            <TwoSegmentProgress />
          </View>

          <View className="mt-8 items-start gap-3">
            <AppText
              className="text-start text-text"
              style={{
                fontFamily: fontFamily.bold,
                fontSize: fontSize.xxl,
                lineHeight: 32,
              }}
            >
              {t("title")}
            </AppText>
            <AppText
              className="text-start text-textMuted"
              style={{
                fontFamily: fontFamily.regular,
                fontSize: fontSize.label,
                lineHeight: 22,
              }}
            >
              {t("subtitle")}
            </AppText>
          </View>

          <View className="mt-6">
            <IdScanCard
              title={t("scan-title")}
              description={t("scan-description")}
              cameraLabel={t("scan-camera")}
              uploadLabel={t("scan-upload")}
              scanning={scanning}
              onCamera={() => setCameraOpen(true)}
              onUpload={() => {
                void pickFromGallery();
              }}
            />
          </View>

          {saveError ? (
            <View className="mt-4">
              <InlineErrorBanner
                message={saveError}
                onDismiss={() => setSaveError(null)}
                dismissAccessibilityLabel={t("sheet-close")}
              />
            </View>
          ) : null}

          {bannerMessage ? (
            <View className="mt-4">
              {scanBanner?.kind === "error" ? (
                <InlineErrorBanner
                  message={bannerMessage}
                  onDismiss={() => setScanBanner(null)}
                  dismissAccessibilityLabel={t("sheet-close")}
                />
              ) : (
                <View
                  className={`rounded-2xl border px-4 py-3 ${
                    scanBanner?.kind === "success"
                      ? "border-primarySoft bg-primaryMuted"
                      : "border-border bg-backgroundWarm"
                  }`}
                >
                  <AppText
                    className="text-start text-text"
                    style={{
                      fontFamily: fontFamily.regular,
                      fontSize: fontSize.caption,
                      lineHeight: 20,
                    }}
                  >
                    {bannerMessage}
                  </AppText>
                </View>
              )}
            </View>
          ) : null}

          <View className="mt-6 gap-4">
            <SelectField
              label={t("company-label")}
              value={
                companyId
                  ? welmCompanyDisplayName(
                      companies.find((company) => company.id === companyId)
                        ?.name,
                      t("company-unnamed"),
                    )
                  : undefined
              }
              placeholder={
                companiesLoading ? t("company-loading") : t("select-company")
              }
              required
              onPress={() => {
                setCompanyTouched(true);
                if (!companiesLoading && companies.length > 0) {
                  setOpenSheet("company");
                }
              }}
              error={
                companies.length === 0 && !companiesLoading
                  ? t("company-empty")
                  : companyTouched && !companyId
                    ? t("validation.companyRequired")
                    : undefined
              }
              inputClassName={inputClass}
            />
            <SelectField
              label={t("id-type-label")}
              value={t(`id-type-${idType}`)}
              placeholder={t("select-id-type")}
              required
              onPress={() => setOpenSheet("idType")}
              autoFilled={autofilled.has("idType")}
              autoFilledLabel={autoLabel}
              inputClassName={inputClass}
            />
            <AppInput
              label={t("name-label")}
              value={name}
              required
              onChangeText={(value) => {
                clearAutofill("name");
                setName(value);
              }}
              onBlur={() => markTouched("name")}
              placeholder={t("name-placeholder")}
              autoCapitalize="words"
              maxLength={100}
              error={visibleError("name", name)}
              autoFilled={autofilled.has("name")}
              autoFilledLabel={autoLabel}
              inputClassName={inputClass}
            />
            {signedInWithPhone ? (
              <View>
                <AppText variant="label" className="mb-2">
                  {t("phone-label")}
                  <AppText className="text-danger"> *</AppText>
                </AppText>
                <View className="h-[56px] flex-row items-center rounded-2xl border border-border bg-background px-4">
                  <View className="flex-row items-center gap-2">
                    <Text
                      accessibilityLabel={t("common:a11y.country-sa")}
                      style={{ fontSize: 18, lineHeight: 20 }}
                    >
                      🇸🇦
                    </Text>
                    <AppText variant="body" className="text-text">
                      +966
                    </AppText>
                  </View>
                  <View className="mx-3 h-6 w-px bg-border" />
                  <AppText
                    variant="body"
                    className="flex-1 text-textMuted"
                    style={{ textAlign, writingDirection: "ltr" }}
                  >
                    {phoneDigits || "—"}
                  </AppText>
                  <AppIcon name="lock" size={18} color={colors.textMuted} />
                </View>
                <AppText variant="caption" muted className="mt-1 text-start">
                  {t("phone-locked")}
                </AppText>
              </View>
            ) : (
              <>
                <SaudiPhoneField
                  label={t("phone-label")}
                  required
                  value={mobile}
                  onChangeText={(next) => {
                    setPhoneTouched(true);
                    setMobile(next.replace(/\D/g, "").slice(0, 9));
                  }}
                  onBlur={() => setPhoneTouched(true)}
                  placeholder={t("phone-placeholder")}
                />
                {phoneTouched && !isValidSaudiMobile(mobile) ? (
                  <AppText variant="caption" className="mt-1 text-start text-danger">
                    {t("phone-invalid")}
                  </AppText>
                ) : null}
              </>
            )}
            {showCountry ? (
              <SelectField
                label={t("country-label")}
                value={nationalityLabel}
                placeholder={t("select-country")}
                required
                onPress={() => {
                  clearAutofill("nationality");
                  markTouched("nationality");
                  setOpenSheet("nationality");
                }}
                error={visibleError("nationality")}
                autoFilled={autofilled.has("nationality")}
                autoFilledLabel={autoLabel}
                inputClassName={inputClass}
              />
            ) : null}
            {idType === "visitor" ? (
              <SelectField
                label={t("nationality-label")}
                value={nationalityLabel}
                placeholder={t("select-nationality")}
                required
                onPress={() => {
                  clearAutofill("nationality");
                  markTouched("nationality");
                  setOpenSheet("nationality");
                }}
                error={visibleError("nationality")}
                autoFilled={autofilled.has("nationality")}
                autoFilledLabel={autoLabel}
                inputClassName={inputClass}
              />
            ) : null}
            <AppInput
              label={t(`id-label-${idType}`)}
              value={nationalId}
              required
              onChangeText={(value) => {
                clearAutofill("nationalId");
                setNationalId(
                  tenDigitId ? value.replace(/\D/g, "").slice(0, 10) : value,
                );
              }}
              onBlur={() => markTouched("nationalId")}
              placeholder={
                idType === "visitor"
                  ? t("id-placeholder-visitor")
                  : t("id-placeholder")
              }
              keyboardType={tenDigitId ? "number-pad" : "default"}
              maxLength={tenDigitId ? 10 : 50}
              error={visibleError("nationalId", nationalId)}
              autoFilled={autofilled.has("nationalId")}
              autoFilledLabel={autoLabel}
              inputClassName={inputClass}
              rightElement={
                tenDigitId ? (
                  <AppText variant="caption" muted>
                    {t("id-counter", { count: nationalId.length })}
                  </AppText>
                ) : undefined
              }
            />
            <View>
              <CalendarToggle
                value={birthCalendar}
                hijriLabel={t("calendar-hijri")}
                gregorianLabel={t("calendar-gregorian")}
                onChange={(next) => {
                  if (next === birthCalendar) {
                    return;
                  }
                  setBirthCalendar(next);
                  setHijriDob(null);
                  setGregorianDob("");
                  clearAutofill("birthDate");
                }}
              />
              <SelectField
                label={
                  birthCalendar === "hijri"
                    ? t("dob-label-hijri")
                    : t("dob-label-gregorian")
                }
                value={dobLabel}
                placeholder={t("select-date")}
                required
                onPress={() => {
                  clearAutofill("birthDate");
                  markTouched("dateOfBirth");
                  setOpenSheet("dob");
                }}
                error={visibleError("dateOfBirth", dateOfBirth)}
                autoFilled={autofilled.has("birthDate")}
                autoFilledLabel={autoLabel}
                inputClassName={inputClass}
              />
            </View>
            {needsLicense ? (
              <AppInput
                label={t("id-copy-label")}
                value={idCopyNumber}
                required
                onChangeText={(value) =>
                  setIdCopyNumber(value.replace(/\D/g, ""))
                }
                onBlur={() => markTouched("idCopyNumber")}
                placeholder={t("id-copy-placeholder")}
                keyboardType="number-pad"
                error={visibleError("idCopyNumber", idCopyNumber)}
                inputClassName={inputClass}
              />
            ) : null}
            {idType === "resident" ? (
              <SelectField
                label={t("nationality-label")}
                value={nationalityLabel}
                placeholder={t("select-nationality")}
                required
                onPress={() => {
                  clearAutofill("nationality");
                  markTouched("nationality");
                  setOpenSheet("nationality");
                }}
                error={visibleError("nationality")}
                autoFilled={autofilled.has("nationality")}
                autoFilledLabel={autoLabel}
                inputClassName={inputClass}
              />
            ) : null}
            {needsLicense ? (
              <>
                <AppInput
                  label={t("license-number-label")}
                  value={licenseNumber}
                  required
                  onChangeText={(value) => {
                    clearAutofill("licenseNumber");
                    setLicenseNumber(value);
                  }}
                  onBlur={() => markTouched("licenseNumber")}
                  placeholder={t("license-number-placeholder")}
                  keyboardType="numbers-and-punctuation"
                  maxLength={50}
                  error={visibleError("licenseNumber", licenseNumber)}
                  autoFilled={autofilled.has("licenseNumber")}
                  autoFilledLabel={autoLabel}
                  inputClassName={inputClass}
                />
                <SelectField
                  label={t("license-expiry-label")}
                  value={licenseExpiryLabel}
                  placeholder={t("license-expiry-placeholder")}
                  required
                  onPress={() => {
                    clearAutofill("licenseExpiry");
                    markTouched("licenseExpiry");
                    setOpenSheet("licenseExpiry");
                  }}
                  error={visibleError("licenseExpiry", licenseExpiry)}
                  autoFilled={autofilled.has("licenseExpiry")}
                  autoFilledLabel={autoLabel}
                  inputClassName={inputClass}
                />
                <SelectField
                  label={t("place-of-issue-label")}
                  value={placeOfIssueLabel}
                  placeholder={t("select-place-of-issue")}
                  required
                  onPress={() => {
                    clearAutofill("placeOfIssue");
                    markTouched("placeOfIssue");
                    setOpenSheet("placeOfIssue");
                  }}
                  error={visibleError("placeOfIssue", placeOfIssue)}
                  autoFilled={autofilled.has("placeOfIssue")}
                  autoFilledLabel={autoLabel}
                  inputClassName={inputClass}
                />
              </>
            ) : null}
            <AppInput
              label={t("address-label")}
              value={address}
              required
              onChangeText={setAddress}
              onBlur={() => markTouched("address")}
              placeholder={t("address-placeholder")}
              maxLength={500}
              error={visibleError("address", address)}
              inputClassName={inputClass}
            />
            {signedInWithPhone ? (
              <AppInput
                label={t("email-label")}
                value={email}
                required
                onChangeText={setEmail}
                onBlur={() => markTouched("email")}
                placeholder={t("email-placeholder")}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                error={visibleError("email", email)}
                inputClassName={inputClass}
              />
            ) : (
              <View>
                <AppText variant="label" className="mb-2">
                  {t("email-label")}
                  <AppText className="text-danger"> *</AppText>
                </AppText>
                <View className="h-[56px] flex-row items-center rounded-2xl border border-border bg-background px-4">
                  <AppText
                    variant="body"
                    className="flex-1 text-textMuted"
                    style={{ textAlign, writingDirection: "ltr" }}
                  >
                    {email.trim() || "—"}
                  </AppText>
                  <AppIcon name="lock" size={18} color={colors.textMuted} />
                </View>
                <AppText variant="caption" muted className="mt-1 text-start">
                  {t("email-locked")}
                </AppText>
              </View>
            )}
          </View>
        </ScrollView>

        <View className="pb-2 pt-3">
          {!formValid ? (
            <AppText variant="caption" muted className="mb-2 text-center">
              {t("save-disabled-hint")}
            </AppText>
          ) : null}
          <AppButton
            label={t("save")}
            onPress={() => {
              void handleSave();
            }}
            loading={saveBusy}
            variant={formValid ? "primary" : "muted"}
            disabled={!formValid}
          />
        </View>
      </Screen>

      <SearchSelectSheet
        visible={openSheet === "nationality"}
        title={showCountry ? t("select-country") : t("select-nationality")}
        options={nationalityOptions}
        selected={nationality}
        searchPlaceholder={t("search-placeholder")}
        confirmLabel={t("sheet-confirm")}
        closeLabel={t("sheet-close")}
        onConfirm={(value) => {
          clearAutofill("nationality");
          setNationality(value as NationalityCode);
        }}
        onClose={() => setOpenSheet(null)}
      />
      <SearchSelectSheet
        visible={openSheet === "company"}
        title={t("select-company")}
        options={companies.map((company) => ({
          value: company.id,
          label: welmCompanyDisplayName(company.name, t("company-unnamed")),
        }))}
        selected={companyId ?? undefined}
        searchPlaceholder={t("search-placeholder")}
        confirmLabel={t("sheet-confirm")}
        closeLabel={t("sheet-close")}
        onConfirm={setCompanyId}
        onClose={() => setOpenSheet(null)}
      />
      <SelectSheet
        visible={openSheet === "idType"}
        title={t("select-id-type")}
        options={idTypeOptions}
        selected={idType}
        onSelect={(value) => handleSelectIdType(value as IdDocumentType)}
        onClose={() => setOpenSheet(null)}
        closeLabel={t("sheet-close")}
      />
      <IdScanCameraSheet
        visible={cameraOpen}
        frameHint={t("scan-frame-hint")}
        statusReady={t("scan-status-ready")}
        statusScanning={t("scan-status-scanning")}
        captureLabel={t("scan-capture")}
        galleryLabel={t("scan-gallery")}
        cancelLabel={t("scan-cancel")}
        permissionDenied={t("scan-permission-denied")}
        scanning={scanning}
        onCapture={() => {
          void pickFromNativeCamera();
        }}
        onGallery={() => {
          void pickFromGallery();
        }}
        onCancel={() => setCameraOpen(false)}
      />
      <SearchSelectSheet
        visible={openSheet === "placeOfIssue"}
        title={t("select-place-of-issue")}
        options={cityOptions}
        selected={placeOfIssue}
        searchPlaceholder={t("search-placeholder")}
        confirmLabel={t("sheet-confirm")}
        closeLabel={t("sheet-close")}
        onConfirm={setPlaceOfIssue}
        onClose={() => setOpenSheet(null)}
      />
      <HijriDateSheet
        visible={openSheet === "dob" && birthCalendar === "hijri"}
        value={hijriDob ?? fallbackHijri}
        title={t("select-date")}
        confirmLabel={t("sheet-confirm")}
        closeLabel={t("sheet-close")}
        monthLabels={hijriMonthLabels}
        yearColumnLabel={t("hijri-year-column")}
        monthColumnLabel={t("hijri-month-column")}
        dayColumnLabel={t("hijri-day-column")}
        bound="not-future"
        onConfirm={(value) => {
          setHijriDob(value);
          setGregorianDob("");
        }}
        onClose={() => setOpenSheet(null)}
      />
      <GregorianDateSheet
        visible={openSheet === "dob" && birthCalendar === "gregorian"}
        title={t("select-date")}
        value={gregorianDob}
        fallback={defaultGregorianDraftIso()}
        max={todayGregorianIso()}
        monthLabels={gregorianMonthLabels}
        weekdayLabels={weekdayLabels}
        confirmLabel={t("sheet-confirm")}
        closeLabel={t("sheet-close")}
        onConfirm={(iso) => {
          setGregorianDob(iso);
          setHijriDob(null);
        }}
        onClose={() => setOpenSheet(null)}
      />
      <HijriDateSheet
        visible={openSheet === "licenseExpiry"}
        value={hijriLicenseExpiry ?? fallbackHijriExpiry}
        title={t("select-date")}
        confirmLabel={t("sheet-confirm")}
        closeLabel={t("sheet-close")}
        monthLabels={hijriMonthLabels}
        yearColumnLabel={t("hijri-year-column")}
        monthColumnLabel={t("hijri-month-column")}
        dayColumnLabel={t("hijri-day-column")}
        bound="not-past"
        helperText={t("license-expiry-helper")}
        onConfirm={setHijriLicenseExpiry}
        onClose={() => setOpenSheet(null)}
      />
    </View>
  );
}
