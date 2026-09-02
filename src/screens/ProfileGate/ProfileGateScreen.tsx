import React, { useCallback, useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import { useTranslation } from "react-i18next";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { AppInput } from "../../components/forms/AppInput";
import { SelectField } from "../../components/forms/SelectField";
import { Screen } from "../../components/common/Screen";
import { AppIcon } from "../../components/icons/AppIcon";
import { StackScreenHeader } from "../../components/layout/StackScreenHeader";
import { HijriDateSheet } from "../../components/sheets/HijriDateSheet";
import { SelectSheet } from "../../components/sheets/SelectSheet";
import { AppText } from "../../components/typography/AppText";
import { SignupProgress } from "../../features/auth";
import {
  DEFAULT_NATIONALITY,
  LICENSE_TYPES,
  NATIONALITY_CODES,
  type LicenseType,
  type NationalityCode,
} from "../../features/auth/profile/lookups";
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

type Props = NativeStackScreenProps<RootStackParamList, "ProfileGate">;
type OpenSheet = "dob" | "licenseType" | "nationality" | null;

export function ProfileGateScreen({ navigation }: Props) {
  const { t } = useTranslation("profile-gate");
  const { chevronEnd } = useRtl();
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  const [name, setName] = useState(user?.name ?? "");
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
  const [submitted, setSubmitted] = useState(false);
  const [openSheet, setOpenSheet] = useState<OpenSheet>(null);

  const nameError = submitted && name.trim().length === 0;
  const idError = submitted && nationalId.trim().length === 0;
  const canSubmit = name.trim().length > 0 && nationalId.trim().length > 0;

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

  const dobLabel = hijriDob
    ? `${hijriDob.day} ${t(`hijri-month.${hijriDob.month}`)} ${hijriDob.year}`
    : undefined;

  const handleDone = useCallback(() => {
    setSubmitted(true);
    if (!canSubmit) {
      return;
    }

    const trimmedName = name.trim();

    updateUser({
      name: trimmedName,
      firstName: trimmedName.split(/\s+/)[0] || trimmedName,
      nationalId: nationalId.trim(),
      nationality,
      dateOfBirth: hijriDob ? hijriToGregorianIso(hijriDob) : undefined,
      dateOfBirthHijri: hijriDob ? formatHijriIso(hijriDob) : undefined,
      licenseType,
      licenseNumber: licenseNumber.trim() || undefined,
    });

    navigation.reset({
      index: 0,
      routes: [{ name: "MainTabs" }],
    });
  }, [
    canSubmit,
    hijriDob,
    licenseNumber,
    licenseType,
    name,
    nationalId,
    nationality,
    navigation,
    updateUser,
  ]);

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

      <View className="mt-8 gap-4">
        <AppInput
          label={t("name-label")}
          value={name}
          onChangeText={setName}
          placeholder={t("name-placeholder")}
          autoCapitalize="words"
          returnKeyType="next"
          error={nameError ? t("name-error") : undefined}
        />
        {user?.email ? (
          <View>
            <AppText variant="label" className="mb-2">
              {t("email-label")}
            </AppText>
            <View className="h-[52px] justify-center rounded-2xl border border-border bg-background px-4">
              <AppText variant="body" className="text-textMuted">
                {user.email}
              </AppText>
            </View>
          </View>
        ) : null}
        <AppInput
          label={t("id-label")}
          value={nationalId}
          onChangeText={setNationalId}
          placeholder={t("id-placeholder")}
          keyboardType="number-pad"
          returnKeyType="next"
          error={idError ? t("id-error") : undefined}
        />
        <SelectField
          label={t("nationality-label")}
          value={t(`nationality.${nationality}`)}
          placeholder={t("select-nationality")}
          onPress={() => setOpenSheet("nationality")}
        />
        <SelectField
          label={t("dob-label")}
          value={dobLabel}
          placeholder={t("select-date")}
          onPress={() => setOpenSheet("dob")}
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
          onChangeText={setLicenseNumber}
          placeholder={t("license-placeholder")}
          autoCapitalize="characters"
          returnKeyType="done"
          onSubmitEditing={handleDone}
        />
      </View>

      <View className="mt-8 mb-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("done")}
          onPress={handleDone}
          className={`h-14 flex-row items-center justify-center gap-2 rounded-pill ${
            canSubmit ? "bg-primary active:opacity-90" : "bg-border"
          }`}
          style={
            canSubmit
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
            className={`text-center ${canSubmit ? "text-white" : "text-textMuted"}`}
            style={{ includeFontPadding: false, lineHeight: 22 }}
          >
            {t("done")}
          </AppText>
          <AppIcon
            name={chevronEnd}
            size={20}
            color={canSubmit ? colors.white : colors.textMuted}
          />
        </Pressable>
      </View>

      <HijriDateSheet
        visible={openSheet === "dob"}
        value={hijriDob ?? defaultHijriDraft()}
        onConfirm={setHijriDob}
        onClose={() => setOpenSheet(null)}
      />
      <SelectSheet
        visible={openSheet === "nationality"}
        title={t("select-nationality")}
        options={nationalityOptions}
        selected={nationality}
        onSelect={(value) => setNationality(value as NationalityCode)}
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
