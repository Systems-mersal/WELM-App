import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useTranslation } from "react-i18next";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { AppInput } from "../../components/forms/AppInput";
import { SaudiPhoneField } from "../../components/forms/SaudiPhoneField";
import { SelectField } from "../../components/forms/SelectField";
import { InlineErrorBanner } from "../../components/common/InlineErrorBanner";
import { Screen } from "../../components/common/Screen";
import { AppIcon } from "../../components/icons/AppIcon";
import { StackScreenHeader } from "../../components/layout/StackScreenHeader";
import { HijriDateSheet } from "../../components/sheets/HijriDateSheet";
import { SelectSheet } from "../../components/sheets/SelectSheet";
import { AppText } from "../../components/typography/AppText";
import {
  SignupProgress,
  fetchWelmCompanies,
  patchWelmProfile,
  routeAfterIdentity,
  welmAuthUserMessage,
} from "../../features/auth";
import {
  PROFILE_GATE_ID_TYPES,
  DEFAULT_NATIONALITY,
  LICENSE_TYPES,
  NATIONALITY_CODES,
  type IdDocumentType,
  type LicenseType,
  type NationalityCode,
} from "../../features/auth/profile/lookups";
import {
  autofilledKeysFromFields,
  scanCustomerIdImage,
  type ScanTrackedKey,
} from "../../features/auth/profile/scan-id";
import { IdScanCameraSheet } from "../../features/auth/ui/IdScanCameraSheet";
import { IdScanCard } from "../../features/auth/ui/IdScanCard";
import { useRtl } from "../../hooks/useRtl";
import {
  defaultHijriDraft,
  formatHijriIso,
  hijriFromStored,
  hijriToGregorianIso,
  type HijriYmd,
} from "../../lib/hijri";
import type { RootStackParamList } from "../../navigation/types";
import { useAuthStore } from "../../stores/auth-store";
import { colors } from "../../theme/colors";
import { fontFamily, fontSize } from "../../theme/typography";
import { normalizeSaudiMobile } from "../../utils/saudi-mobile";

type Props = NativeStackScreenProps<RootStackParamList, "ProfileGate">;
type OpenSheet = "dob" | "licenseType" | "nationality" | "idType" | null;
type ScanBanner =
  | { kind: "success" | "partial"; filled: number; total: number }
  | { kind: "error"; message: string }
  | null;

function isValidEmail(value: string): boolean {
  const trimmed = value.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

export function ProfileGateScreen({ navigation }: Props) {
  const { t } = useTranslation(["profile-gate", "common"]);
  const { chevronEnd } = useRtl();
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const [providerName] = useState(user?.name?.trim() ?? "");
  const [providerEmail] = useState(user?.email?.trim() ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [saveBusy, setSaveBusy] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);

  const [name, setName] = useState(user?.name ?? "");
  const [idType, setIdType] = useState<IdDocumentType | undefined>(
    user?.idDocumentType,
  );
  const [nationalId, setNationalId] = useState(user?.nationalId ?? "");
  const [nationality, setNationality] = useState<NationalityCode>(
    user?.nationality ?? DEFAULT_NATIONALITY,
  );
  const [hijriDob, setHijriDob] = useState<HijriYmd | null>(() =>
    hijriFromStored(user?.dateOfBirthHijri, user?.dateOfBirth),
  );
  const [licenseType, setLicenseType] = useState<LicenseType | undefined>(
    user?.licenseType,
  );
  const [licenseNumber, setLicenseNumber] = useState(user?.licenseNumber ?? "");
  const [licenseExpiry, setLicenseExpiry] = useState(user?.licenseExpiry ?? "");
  const [placeOfIssue, setPlaceOfIssue] = useState(user?.placeOfIssue ?? "");
  const [submitted, setSubmitted] = useState(false);
  const [openSheet, setOpenSheet] = useState<OpenSheet>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [autofilled, setAutofilled] = useState<Set<ScanTrackedKey>>(
    () => new Set(),
  );
  const [scanBanner, setScanBanner] = useState<ScanBanner>(null);

  const nameError = submitted && name.trim().length === 0;
  const emailError =
    submitted && email.trim().length > 0 && !isValidEmail(email);
  const idError = submitted && nationalId.trim().length === 0;
  const canSubmit =
    name.trim().length > 0 &&
    nationalId.trim().length > 0 &&
    (email.trim().length === 0 || isValidEmail(email));
  const autoLabel = t("scan-auto-filled");
  const lockedPhone = user?.phone?.trim()
    ? normalizeSaudiMobile(user.phone)
    : "";

  const providerPill = useMemo(() => {
    if (user?.provider === "google") {
      return t("from-provider", { provider: t("provider-google") });
    }
    if (user?.provider === "apple") {
      return t("from-provider", { provider: t("provider-apple") });
    }
    return undefined;
  }, [t, user?.provider]);

  const nameFromProvider = Boolean(
    providerPill && providerName && name.trim() === providerName,
  );
  const emailFromProvider = Boolean(
    providerPill && providerEmail && email.trim() === providerEmail,
  );

  useEffect(() => {
    let cancelled = false;
    void fetchWelmCompanies()
      .then((companies) => {
        if (!cancelled) {
          setCompanyId(companies[0]?.id ?? null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCompanyId(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const nationalityOptions = useMemo(
    () =>
      NATIONALITY_CODES.map((code) => ({
        value: code,
        label: t(`nationality.${code}`),
      })),
    [t],
  );
  const licenseTypeOptions = useMemo(
    () =>
      LICENSE_TYPES.map((type) => ({
        value: type,
        label: t(`license-type.${type}`),
      })),
    [t],
  );
  const idTypeOptions = useMemo(
    () =>
      PROFILE_GATE_ID_TYPES.map((type) => ({
        value: type,
        label: t(`id-type-${type}`),
      })),
    [t],
  );

  const dobLabel = hijriDob
    ? `${hijriDob.day} ${t(`hijri-month.${hijriDob.month}`)} ${hijriDob.year}`
    : undefined;

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

  const applyScanResult = useCallback(
    async (uri: string) => {
      setScanning(true);
      setScanBanner(null);
      try {
        const result = await scanCustomerIdImage(uri);
        if (!result.ok) {
          setScanBanner({
            kind: "error",
            message: t("scan-error"),
          });
          return;
        }

        const { fields, meta } = result;
        const applied = autofilledKeysFromFields(fields);
        setAutofilled(applied);

        if (fields.name) {
          setName(fields.name);
        }
        if (fields.idType) {
          setIdType(fields.idType);
        }
        if (fields.nationalId) {
          setNationalId(fields.nationalId);
        }
        if (fields.nationality) {
          setNationality(fields.nationality);
        }
        if (fields.birthDate) {
          setHijriDob(hijriFromStored(undefined, fields.birthDate));
        }
        if (fields.licenseNumber) {
          setLicenseNumber(fields.licenseNumber);
        }
        if (fields.licenseType) {
          setLicenseType(fields.licenseType);
        }
        if (fields.licenseExpiry) {
          setLicenseExpiry(fields.licenseExpiry);
        }
        if (fields.placeOfIssue) {
          setPlaceOfIssue(fields.placeOfIssue);
        }

        const filled = meta.filledFields;
        const total = meta.totalFields;
        setScanBanner({
          kind: filled >= total ? "success" : "partial",
          filled,
          total,
        });
        setCameraOpen(false);
      } finally {
        setScanning(false);
      }
    },
    [t],
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

  const handleDone = useCallback(async () => {
    setSubmitted(true);
    setSaveError(null);
    if (!canSubmit || saveBusy) {
      return;
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedId = nationalId.trim();

    setSaveBusy(true);
    try {
      let ownerId = companyId;
      if (!ownerId) {
        const companies = await fetchWelmCompanies();
        ownerId = companies[0]?.id ?? null;
        setCompanyId(ownerId);
      }
      if (!ownerId) {
        setSaveError(t("company-required"));
        return;
      }

      const saved = await patchWelmProfile({
        companyId: ownerId,
        name: trimmedName,
        idDocumentType: idType,
        nationalId: trimmedId,
        nationality,
        dateOfBirth: hijriDob ? hijriToGregorianIso(hijriDob) : undefined,
        licenseType,
        licenseNumber: licenseNumber.trim() || undefined,
        licenseExpiry: licenseExpiry.trim() || undefined,
        placeOfIssue: placeOfIssue.trim() || undefined,
      });

      updateUser({
        name: saved.user.name || trimmedName,
        firstName:
          saved.user.firstName ||
          trimmedName.split(/\s+/)[0] ||
          trimmedName,
        email: trimmedEmail || undefined,
        idDocumentType: saved.user.idDocumentType ?? idType,
        nationalId: saved.user.nationalId ?? trimmedId,
        nationality,
        dateOfBirth: hijriDob ? hijriToGregorianIso(hijriDob) : undefined,
        dateOfBirthHijri: hijriDob ? formatHijriIso(hijriDob) : undefined,
        licenseType,
        licenseNumber: licenseNumber.trim() || undefined,
        licenseExpiry: licenseExpiry.trim() || undefined,
        placeOfIssue: placeOfIssue.trim() || undefined,
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
    canSubmit,
    companyId,
    email,
    hijriDob,
    idType,
    licenseExpiry,
    licenseNumber,
    licenseType,
    name,
    nationalId,
    nationality,
    navigation,
    placeOfIssue,
    saveBusy,
    t,
    updateUser,
  ]);

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
    <Screen
      keyboard
      edges={["bottom"]}
      className="bg-white"
      header={<StackScreenHeader title={t("header")} />}
    >
      <View className="mt-4">
        <SignupProgress current="profile" />
      </View>

      <View className="mt-8 items-start gap-3">
        <AppText
          className="text-start text-text"
          style={{ fontFamily: fontFamily.bold, fontSize: fontSize.xxl, lineHeight: 32 }}
        >
          {t("title")}
        </AppText>
        <AppText
          className="text-start text-textMuted"
          style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.label, lineHeight: 22 }}
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
                style={{ fontFamily: fontFamily.regular, fontSize: fontSize.caption, lineHeight: 20 }}
              >
                {bannerMessage}
              </AppText>
            </View>
          )}
        </View>
      ) : null}

      <View className="mt-8 gap-4">
        <SelectField
          label={t("id-type-label")}
          value={idType ? t(`id-type-${idType}`) : undefined}
          placeholder={t("select-id-type")}
          onPress={() => setOpenSheet("idType")}
          autoFilled={autofilled.has("idType")}
          autoFilledLabel={autoLabel}
        />
        <AppInput
          label={t("name-label")}
          value={name}
          onChangeText={(value) => {
            clearAutofill("name");
            setName(value);
          }}
          placeholder={t("name-placeholder")}
          autoCapitalize="words"
          returnKeyType="next"
          error={nameError ? t("name-error") : undefined}
          autoFilled={autofilled.has("name") || nameFromProvider}
          autoFilledLabel={
            autofilled.has("name") ? autoLabel : providerPill
          }
        />
        <AppInput
          label={t("email-label")}
          value={email}
          onChangeText={setEmail}
          placeholder={t("email-placeholder")}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          error={emailError ? t("email-invalid") : undefined}
          autoFilled={emailFromProvider}
          autoFilledLabel={providerPill}
        />
        {lockedPhone ? (
          <SaudiPhoneField
            label={t("phone-label")}
            value={lockedPhone}
            onChangeText={() => undefined}
            editable={false}
          />
        ) : null}
        <AppInput
          label={t("id-label")}
          value={nationalId}
          onChangeText={(value) => {
            clearAutofill("nationalId");
            setNationalId(value);
          }}
          placeholder={t("id-placeholder")}
          keyboardType="number-pad"
          returnKeyType="next"
          error={idError ? t("id-error") : undefined}
          autoFilled={autofilled.has("nationalId")}
          autoFilledLabel={autoLabel}
        />
        <SelectField
          label={t("nationality-label")}
          value={t(`nationality.${nationality}`)}
          placeholder={t("select-nationality")}
          onPress={() => setOpenSheet("nationality")}
          autoFilled={autofilled.has("nationality")}
          autoFilledLabel={autoLabel}
        />
        <SelectField
          label={t("dob-label")}
          value={dobLabel}
          placeholder={t("select-date")}
          onPress={() => setOpenSheet("dob")}
          autoFilled={autofilled.has("birthDate")}
          autoFilledLabel={autoLabel}
        />
        <SelectField
          label={t("license-type-label")}
          value={licenseType ? t(`license-type.${licenseType}`) : undefined}
          placeholder={t("select-license-type")}
          onPress={() => setOpenSheet("licenseType")}
        />
        <AppInput
          label={t("license-label")}
          value={licenseNumber}
          onChangeText={(value) => {
            clearAutofill("licenseNumber");
            setLicenseNumber(value);
          }}
          placeholder={t("license-placeholder")}
          autoCapitalize="characters"
          returnKeyType="next"
          autoFilled={autofilled.has("licenseNumber")}
          autoFilledLabel={autoLabel}
        />
        <AppInput
          label={t("license-expiry-label")}
          value={licenseExpiry}
          onChangeText={(value) => {
            clearAutofill("licenseExpiry");
            setLicenseExpiry(value);
          }}
          placeholder={t("license-expiry-placeholder")}
          autoCapitalize="none"
          returnKeyType="next"
          autoFilled={autofilled.has("licenseExpiry")}
          autoFilledLabel={autoLabel}
        />
        <AppInput
          label={t("place-of-issue-label")}
          value={placeOfIssue}
          onChangeText={(value) => {
            clearAutofill("placeOfIssue");
            setPlaceOfIssue(value);
          }}
          placeholder={t("place-of-issue-placeholder")}
          returnKeyType="done"
          onSubmitEditing={() => {
            void handleDone();
          }}
          autoFilled={autofilled.has("placeOfIssue")}
          autoFilledLabel={autoLabel}
        />
      </View>

      <View className="mt-8 mb-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("done")}
          onPress={() => {
            void handleDone();
          }}
          disabled={saveBusy}
          className={`h-14 flex-row items-center justify-center gap-2 rounded-pill ${
            canSubmit && !saveBusy ? "bg-primary active:opacity-90" : "bg-border"
          }`}
          style={
            canSubmit && !saveBusy
              ? {
                  shadowColor: colors.primaryDark,
                  shadowOffset: { width: 0, height: 10 },
                  shadowOpacity: 0.25,
                  shadowRadius: 16,
                  elevation: 8,
                }
              : undefined
          }
        >
          <AppText
            variant="button"
            className={`text-center ${
              canSubmit && !saveBusy ? "text-white" : "text-textMuted"
            }`}
            style={{ includeFontPadding: false, lineHeight: 22 }}
          >
            {t("done")}
          </AppText>
          <AppIcon
            name={chevronEnd}
            size={20}
            color={canSubmit && !saveBusy ? colors.white : colors.textMuted}
          />
        </Pressable>
      </View>

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

      <HijriDateSheet
        visible={openSheet === "dob"}
        value={hijriDob ?? defaultHijriDraft()}
        onConfirm={(value) => {
          clearAutofill("birthDate");
          setHijriDob(value);
        }}
        onClose={() => setOpenSheet(null)}
      />
      <SelectSheet
        visible={openSheet === "idType"}
        title={t("select-id-type")}
        options={idTypeOptions}
        selected={idType}
        onSelect={(value) => {
          clearAutofill("idType");
          setIdType(value as IdDocumentType);
        }}
        onClose={() => setOpenSheet(null)}
        closeLabel={t("sheet-close")}
      />
      <SelectSheet
        visible={openSheet === "nationality"}
        title={t("select-nationality")}
        options={nationalityOptions}
        selected={nationality}
        onSelect={(value) => {
          clearAutofill("nationality");
          setNationality(value as NationalityCode);
        }}
        onClose={() => setOpenSheet(null)}
        closeLabel={t("sheet-close")}
      />
      <SelectSheet
        visible={openSheet === "licenseType"}
        title={t("select-license-type")}
        options={licenseTypeOptions}
        selected={licenseType}
        onSelect={(value) => setLicenseType(value as LicenseType)}
        onClose={() => setOpenSheet(null)}
        closeLabel={t("sheet-close")}
      />
    </Screen>
  );
}
