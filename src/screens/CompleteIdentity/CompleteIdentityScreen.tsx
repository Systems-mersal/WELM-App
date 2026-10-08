import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { AppButton } from "../../components/buttons/AppButton";
import { InlineErrorBanner } from "../../components/common/InlineErrorBanner";
import { Screen } from "../../components/common/Screen";
import { AppInput } from "../../components/forms/AppInput";
import { SaudiPhoneField } from "../../components/forms/SaudiPhoneField";
import { SelectField } from "../../components/forms/SelectField";
import { AppIcon } from "../../components/icons/AppIcon";
import { StackScreenHeader } from "../../components/layout/StackScreenHeader";
import { HijriDateSheet } from "../../components/sheets/HijriDateSheet";
import { SearchSelectSheet } from "../../components/sheets/SearchSelectSheet";
import { AppText } from "../../components/typography/AppText";
import {
  fetchWelmCompanies,
  patchWelmProfile,
  routeAfterIdentity,
  welmAuthUserMessage,
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
  | "nationality"
  | "dob"
  | "licenseExpiry"
  | "placeOfIssue"
  | null;
type Touched = Partial<Record<IdentityField, boolean>>;

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
  const [hijriDob, setHijriDob] = useState<HijriYmd | null>(null);
  const [idCopyNumber, setIdCopyNumber] = useState("");
  const [nationality, setNationality] = useState<NationalityCode>(
    DEFAULT_NATIONALITY,
  );
  const [licenseNumber, setLicenseNumber] = useState("");
  const [hijriLicenseExpiry, setHijriLicenseExpiry] = useState<HijriYmd | null>(
    null,
  );
  const [placeOfIssue, setPlaceOfIssue] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [address, setAddress] = useState("");
  const [openSheet, setOpenSheet] = useState<OpenSheet>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [saveBusy, setSaveBusy] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [touched, setTouched] = useState<Touched>({});
  const [uniqueness, setUniqueness] = useState<IdentityUniquenessErrors>({});

  const needsLicense = idType === "gcc" || idType === "visitor";
  const showCountry = idType === "gcc";
  const showNationality = idType === "resident" || idType === "visitor";
  const tenDigitId = idType === "national" || idType === "resident";
  const dateOfBirth = hijriDob ? hijriToGregorianIso(hijriDob) : "";
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
  const dobLabel = formatHijriField(hijriDob);
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
  const formValid = isIdentityFormValid(values, uniqueness) && phoneEntryValid;

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

  const clearIdentityFields = useCallback(() => {
    setNationalId("");
    setHijriDob(null);
    setIdCopyNumber("");
    setNationality(DEFAULT_NATIONALITY);
    setLicenseNumber("");
    setHijriLicenseExpiry(null);
    setPlaceOfIssue("");
    setTouched({});
    setUniqueness({});
  }, []);

  const handleSelectIdType = useCallback(
    (next: IdDocumentType) => {
      if (next === idType) {
        return;
      }
      setIdType(next);
      clearIdentityFields();
      setNationality(next === "gcc" ? "AE" : DEFAULT_NATIONALITY);
    },
    [clearIdentityFields, idType],
  );

  const handleSave = useCallback(async () => {
    setSaveError(null);
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

      const storedNationality = idType === "national" ? "SA" : nationality;
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
        name: saved.user.name || name.trim(),
        firstName: saved.user.firstName || name.trim().split(/\s+/)[0],
        email: email.trim(),
        phone: signedInWithPhone
          ? user?.phone || route.params?.phone
          : `+966${normalizeSaudiMobile(mobile)}`,
        idDocumentType: saved.user.idDocumentType ?? idType,
        nationalId: saved.user.nationalId ?? nationalId.trim(),
        nationality: storedNationality,
        dateOfBirth,
        dateOfBirthHijri: hijriDob ? formatHijriIso(hijriDob) : undefined,
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

          <View className="mt-6 flex-row flex-wrap gap-3">
            {ID_DOCUMENT_TYPES.map((type) => {
              const selected = type === idType;
              return (
                <Pressable
                  key={type}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => handleSelectIdType(type)}
                  className={`h-14 w-[47%] items-center justify-center rounded-2xl border px-2 ${
                    selected
                      ? "border-primary bg-primaryMuted"
                      : "border-border bg-white"
                  }`}
                >
                  <AppText
                    className={`text-center ${
                      selected ? "text-primary" : "text-text"
                    }`}
                    style={{
                      fontFamily: selected
                        ? fontFamily.semibold
                        : fontFamily.regular,
                      fontSize: fontSize.caption,
                    }}
                  >
                    {t(`id-type-${type}`)}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
          <AppText variant="caption" muted className="mt-3 text-start">
            {t("id-type-reset")}
          </AppText>

          <View className="mt-6">
            {signedInWithPhone ? (
              <>
                <AppText variant="label" className="mb-2">
                  {t("phone-label")}
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
              </>
            ) : (
              <>
                <SaudiPhoneField
                  label={t("phone-label")}
                  value={mobile}
                  onChangeText={(next) => {
                    setPhoneTouched(true);
                    setMobile(next.replace(/\D/g, "").slice(0, 9));
                  }}
                  onBlur={() => setPhoneTouched(true)}
                  placeholder="5XXXXXXXX"
                />
                {phoneTouched && !isValidSaudiMobile(mobile) ? (
                  <AppText variant="caption" className="mt-1 text-start text-danger">
                    {t("phone-invalid")}
                  </AppText>
                ) : null}
              </>
            )}
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

          <AppText
            className="mb-3 mt-8 text-start text-text"
            style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.label }}
          >
            {t("section-personal")}
          </AppText>
          <View className="gap-4">
            <AppInput
              label={t("name-label")}
              value={name}
              onChangeText={setName}
              onBlur={() => markTouched("name")}
              placeholder={t("name-placeholder")}
              autoCapitalize="words"
              maxLength={100}
              error={visibleError("name", name)}
              inputClassName={inputClass}
            />
            <AppInput
              label={t(`id-label-${idType}`)}
              value={nationalId}
              onChangeText={(value) =>
                setNationalId(tenDigitId ? value.replace(/\D/g, "").slice(0, 10) : value)
              }
              onBlur={() => markTouched("nationalId")}
              placeholder={t("id-placeholder")}
              keyboardType={idType === "visitor" ? "default" : "number-pad"}
              maxLength={tenDigitId ? 10 : 50}
              error={visibleError("nationalId", nationalId)}
              inputClassName={inputClass}
              rightElement={
                tenDigitId ? (
                  <AppText variant="caption" muted>
                    {t("id-counter", { count: nationalId.length })}
                  </AppText>
                ) : undefined
              }
            />
            <SelectField
              label={t("dob-label")}
              value={dobLabel}
              placeholder={t("select-date")}
              onPress={() => {
                markTouched("dateOfBirth");
                setOpenSheet("dob");
              }}
              error={visibleError("dateOfBirth", dateOfBirth)}
              inputClassName={inputClass}
            />
            {needsLicense ? (
              <AppInput
                label={t("id-copy-label")}
                value={idCopyNumber}
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
            {showCountry ? (
              <SelectField
                label={t("country-label")}
                value={nationalityLabel}
                placeholder={t("select-country")}
                onPress={() => {
                  markTouched("nationality");
                  setOpenSheet("nationality");
                }}
                error={visibleError("nationality")}
                inputClassName={inputClass}
              />
            ) : null}
            {showNationality ? (
              <SelectField
                label={t("nationality-label")}
                value={nationalityLabel}
                placeholder={t("select-nationality")}
                onPress={() => {
                  markTouched("nationality");
                  setOpenSheet("nationality");
                }}
                error={visibleError("nationality")}
                inputClassName={inputClass}
              />
            ) : null}
          </View>

          {needsLicense ? (
            <>
              <AppText
                className="mb-3 mt-8 text-start text-text"
                style={{
                  fontFamily: fontFamily.semibold,
                  fontSize: fontSize.label,
                }}
              >
                {t("section-license")}
              </AppText>
              <View className="gap-4">
                <AppInput
                  label={t("license-number-label")}
                  value={licenseNumber}
                  onChangeText={setLicenseNumber}
                  onBlur={() => markTouched("licenseNumber")}
                  placeholder={t("id-placeholder")}
                  keyboardType="numbers-and-punctuation"
                  maxLength={50}
                  error={visibleError("licenseNumber", licenseNumber)}
                  inputClassName={inputClass}
                />
                <SelectField
                  label={t("license-expiry-label")}
                  value={licenseExpiryLabel}
                  placeholder={t("select-date")}
                  onPress={() => {
                    markTouched("licenseExpiry");
                    setOpenSheet("licenseExpiry");
                  }}
                  error={visibleError("licenseExpiry", licenseExpiry)}
                  inputClassName={inputClass}
                />
                <SelectField
                  label={t("place-of-issue-label")}
                  value={placeOfIssueLabel}
                  placeholder={t("select-place-of-issue")}
                  onPress={() => {
                    markTouched("placeOfIssue");
                    setOpenSheet("placeOfIssue");
                  }}
                  error={visibleError("placeOfIssue", placeOfIssue)}
                  inputClassName={inputClass}
                />
              </View>
            </>
          ) : null}

          <AppText
            className="mb-3 mt-8 text-start text-text"
            style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.label }}
          >
            {t("section-contact")}
          </AppText>
          <View className="gap-4">
            {signedInWithPhone ? (
              <AppInput
                label={t("email-label")}
                value={email}
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
            <AppInput
              label={t("address-label")}
              value={address}
              onChangeText={setAddress}
              onBlur={() => markTouched("address")}
              placeholder={t("address-placeholder")}
              maxLength={500}
              error={visibleError("address", address)}
              inputClassName={inputClass}
            />
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
        onConfirm={(value) => setNationality(value as NationalityCode)}
        onClose={() => setOpenSheet(null)}
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
        visible={openSheet === "dob"}
        value={hijriDob ?? fallbackHijri}
        title={t("select-date")}
        confirmLabel={t("sheet-confirm")}
        closeLabel={t("sheet-close")}
        monthLabels={hijriMonthLabels}
        yearColumnLabel={t("hijri-year-column")}
        monthColumnLabel={t("hijri-month-column")}
        dayColumnLabel={t("hijri-day-column")}
        onConfirm={setHijriDob}
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
