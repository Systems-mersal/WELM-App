import React, { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppButton } from "../../components/buttons/AppButton";
import { Avatar } from "../../components/common/Avatar";
import { InlineErrorBanner } from "../../components/common/InlineErrorBanner";
import { Screen } from "../../components/common/Screen";
import { AppInput } from "../../components/forms/AppInput";
import { SaudiPhoneField } from "../../components/forms/SaudiPhoneField";
import { SelectField } from "../../components/forms/SelectField";
import { AppIcon } from "../../components/icons/AppIcon";
import { StackScreenHeader } from "../../components/layout/StackScreenHeader";
import { SearchSelectSheet } from "../../components/sheets/SearchSelectSheet";
import { AppText } from "../../components/typography/AppText";
import {
  fetchWelmCompanies,
  submitPersonalDetails,
  welmAuthUserMessage,
  welmCompanyDisplayName,
  type WelmCompanyOption,
} from "../../features/auth";
import {
  pickIdImageFromCamera,
  pickIdImageFromLibrary,
} from "../../features/auth/profile/pick-id-image";
import type { RootStackParamList } from "../../navigation/types";
import { useAuthStore } from "../../stores/auth-store";
import { colors } from "../../theme/colors";
import {
  isValidSaudiMobile,
  normalizeSaudiMobile,
} from "../../utils/saudi-mobile";

type Props = NativeStackScreenProps<RootStackParamList, "EditPersonalInfo">;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function toLocalPhone(value: string | undefined): string {
  return normalizeSaudiMobile(value ?? "");
}

export function EditPersonalInfoScreen({ navigation }: Props) {
  const { t } = useTranslation(["profile", "complete-identity", "common"]);
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);

  const [name, setName] = useState(user?.name && user.name !== "User" ? user.name : "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [mobile, setMobile] = useState(toLocalPhone(user?.phone));
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [companies, setCompanies] = useState<WelmCompanyOption[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(user?.companyId ?? null);
  const [companyOpen, setCompanyOpen] = useState(false);
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    phone: false,
    company: false,
  });
  const [saveBusy, setSaveBusy] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchWelmCompanies()
      .then((list) => {
        if (cancelled) {
          return;
        }
        setCompanies(list);
        setCompanyId((current) => {
          if (current && list.some((company) => company.id === current)) {
            return current;
          }
          const stored = user?.companyId;
          if (stored && list.some((company) => company.id === stored)) {
            return stored;
          }
          return list.length === 1 ? (list[0]?.id ?? null) : current;
        });
      })
      .catch(() => {
        if (!cancelled) {
          setCompanies([]);
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
  }, [user?.companyId]);

  const trimmedName = name.trim();
  const trimmedEmail = email.trim().toLowerCase();
  const phoneE164 = isValidSaudiMobile(mobile)
    ? `+966${normalizeSaudiMobile(mobile)}`
    : "";
  const nameError =
    touched.name && trimmedName.length < 2 ? t("edit.name-error") : undefined;
  const emailLooksValid =
    EMAIL_PATTERN.test(trimmedEmail) &&
    !trimmedEmail.endsWith("@consumers.welm");
  const emailError =
    touched.email && !emailLooksValid ? t("edit.email-error") : undefined;
  const phoneError =
    touched.phone && !isValidSaudiMobile(mobile) ? t("edit.phone-error") : undefined;
  const companyEmpty = !companiesLoading && companies.length === 0;
  const companyError = companyEmpty
    ? t("complete-identity:company-empty")
    : touched.company && !companyId
      ? t("complete-identity:validation.companyRequired")
      : undefined;
  const formValid =
    trimmedName.length >= 2 &&
    emailLooksValid &&
    isValidSaudiMobile(mobile) &&
    Boolean(companyId) &&
    !companyEmpty;

  const selectedCompany = companies.find((company) => company.id === companyId);
  const companyName = companyId
    ? welmCompanyDisplayName(
        selectedCompany ? selectedCompany.name : user?.companyName,
        t("complete-identity:company-unnamed"),
      )
    : undefined;
  const previewSource = photoUri
    ? { uri: photoUri }
    : user?.avatarUrl
      ? { uri: user.avatarUrl }
      : undefined;

  const applyPickedPhoto = useCallback(
    async (from: "camera" | "library") => {
      const picked =
        from === "camera"
          ? await pickIdImageFromCamera()
          : await pickIdImageFromLibrary();
      if (picked.ok) {
        setPhotoUri(picked.uri);
        setSaveError(null);
        return;
      }
      if (picked.reason === "denied") {
        setSaveError(
          from === "camera" ? t("edit.photo-camera-denied") : t("edit.photo-library-denied"),
        );
      } else if (picked.reason === "unavailable") {
        setSaveError(t("edit.photo-unavailable"));
      }
    },
    [t],
  );

  const handleChangePhoto = useCallback(() => {
    Alert.alert(t("edit.photo-title"), t("edit.photo-subtitle"), [
      {
        text: t("edit.photo-camera"),
        onPress: () => {
          void applyPickedPhoto("camera");
        },
      },
      {
        text: t("edit.photo-library"),
        onPress: () => {
          void applyPickedPhoto("library");
        },
      },
      { text: t("common:cancel"), style: "cancel" },
    ]);
  }, [applyPickedPhoto, t]);

  const handleSave = useCallback(async () => {
    setTouched({ name: true, email: true, phone: true, company: true });
    setSaveError(null);
    if (!formValid || saveBusy || !companyId) {
      return;
    }

    setSaveBusy(true);
    try {
      const result = await submitPersonalDetails({
        name: trimmedName,
        email: trimmedEmail,
        phone: phoneE164,
        companyId,
        companyName: companyName ?? "",
        photoUri,
      });

      if (result.status === "saved") {
        Alert.alert(t("edit.save-success-title"), t("edit.save-success"));
        navigation.goBack();
        return;
      }
      if (result.status === "verify-email") {
        navigation.navigate("Otp", {
          email: result.email,
          intent: "profile-email",
          debugCode: result.debugCode,
          resendIn: result.resendIn,
          sendFailed: result.sendFailed,
        });
        return;
      }
      navigation.navigate("Otp", {
        phone: result.phone,
        intent: "profile-phone",
        debugCode: result.debugCode,
      });
    } catch (error) {
      setSaveError(
        welmAuthUserMessage(error, {
          unavailable: t("common:auth.api-unavailable"),
          fallback: t("edit.save-error"),
        }),
      );
    } finally {
      setSaveBusy(false);
    }
  }, [
    companyId,
    companyName,
    formValid,
    navigation,
    phoneE164,
    photoUri,
    saveBusy,
    t,
    trimmedEmail,
    trimmedName,
  ]);

  const handleCancel = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <Screen
      keyboard
      edges={[]}
      className="bg-background"
      contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      header={
        <StackScreenHeader
          title={t("edit.title")}
          onBack={handleCancel}
        />
      }
    >
      <View className="mt-6 items-center">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("edit.photo-title")}
          onPress={handleChangePhoto}
          className="items-center active:opacity-80"
        >
          <View className="relative">
            <Avatar
              source={previewSource}
              name={trimmedName || t("user-name")}
              size={96}
            />
            <View className="absolute bottom-0 end-0 h-8 w-8 items-center justify-center rounded-full bg-primary">
              <AppIcon name="camera" size={16} color={colors.white} />
            </View>
          </View>
          <AppText variant="label" className="mt-3 text-primary">
            {t("edit.change-photo")}
          </AppText>
        </Pressable>
      </View>

      {saveError ? (
        <InlineErrorBanner
          message={saveError}
          onDismiss={() => setSaveError(null)}
          dismissAccessibilityLabel={t("complete-identity:sheet-close")}
        />
      ) : null}

      <AppInput
        label={t("edit.name-label")}
        value={name}
        onChangeText={setName}
        onBlur={() => setTouched((current) => ({ ...current, name: true }))}
        placeholder={t("edit.name-placeholder")}
        required
        error={nameError}
        containerClassName="mt-6"
        autoCapitalize="words"
      />

      <AppInput
        label={t("edit.email-label")}
        value={email}
        onChangeText={setEmail}
        onBlur={() => setTouched((current) => ({ ...current, email: true }))}
        placeholder={t("edit.email-placeholder")}
        required
        error={emailError}
        containerClassName="mt-4"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <View className="mt-4">
        <SaudiPhoneField
          label={t("edit.phone-label")}
          value={mobile}
          onChangeText={setMobile}
          onBlur={() => setTouched((current) => ({ ...current, phone: true }))}
          placeholder={t("edit.phone-placeholder")}
          required
          error={phoneError}
        />
      </View>

      <View className="mt-4">
        <SelectField
          label={t("complete-identity:company-label")}
          value={companyName}
          placeholder={
            companiesLoading
              ? t("complete-identity:company-loading")
              : t("complete-identity:select-company")
          }
          required
          error={companyError}
          onPress={() => {
            setTouched((current) => ({ ...current, company: true }));
            if (!companiesLoading && companies.length > 0) {
              setCompanyOpen(true);
            }
          }}
        />
      </View>

      <AppButton
        label={t("common:save")}
        className="mt-8"
        loading={saveBusy}
        disabled={!formValid || saveBusy}
        onPress={() => {
          void handleSave();
        }}
      />
      <AppButton
        label={t("common:cancel")}
        variant="outline"
        className="mt-3"
        disabled={saveBusy}
        onPress={handleCancel}
      />

      <SearchSelectSheet
        visible={companyOpen}
        title={t("complete-identity:select-company")}
        options={companies.map((company) => ({
          value: company.id,
          label: welmCompanyDisplayName(
            company.name,
            t("complete-identity:company-unnamed"),
          ),
        }))}
        selected={companyId ?? undefined}
        searchPlaceholder={t("complete-identity:search-placeholder")}
        confirmLabel={t("complete-identity:sheet-confirm")}
        closeLabel={t("complete-identity:sheet-close")}
        onConfirm={(value) => {
          setCompanyId(value);
          setCompanyOpen(false);
        }}
        onClose={() => setCompanyOpen(false)}
      />
    </Screen>
  );
}
