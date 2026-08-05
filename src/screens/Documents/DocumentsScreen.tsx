import React from "react";
import { Pressable, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Screen } from "../../components/common/Screen";
import { AppIcon } from "../../components/icons/AppIcon";
import { StackScreenHeader } from "../../components/layout/StackScreenHeader";
import { AppText } from "../../components/typography/AppText";
import type { RootStackParamList } from "../../navigation/types";
import { colors } from "../../theme/colors";
import { alertComingSoon } from "../../utils/comingSoon";
import { DocumentCard } from "./components/DocumentCard";

type Props = NativeStackScreenProps<RootStackParamList, "Documents">;

export function DocumentsScreen({ navigation }: Props) {
  const { t } = useTranslation(["documents", "common"]);
  const insets = useSafeAreaInsets();

  return (
    <Screen
      edges={[]}
      className="bg-background"
      contentClassName="pt-2"
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      header={
        <StackScreenHeader
          title={t("title")}
          onBack={() => navigation.goBack()}
          leading={
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("common:a11y.notifications")}
              onPress={() => navigation.navigate("Notifications")}
              className="h-11 w-11 items-center justify-center rounded-full bg-background active:opacity-70"
            >
              <AppIcon name="bell" size={20} color={colors.text} />
            </Pressable>
          }
        />
      }
    >
      <DocumentCard
        title={t("driving-license")}
        status="verified"
        statusLabel={t("verified")}
        uploadedAt={t("uploaded-at", { date: t("dates.license") })}
        numberLabel={t("license-number", { number: t("masked-numbers.license") })}
        updateLabel={t("update")}
      />
      <DocumentCard
        title={t("id-card")}
        status="verified"
        statusLabel={t("verified")}
        uploadedAt={t("uploaded-at", { date: t("dates.id") })}
        numberLabel={t("id-number", { number: t("masked-numbers.id") })}
        updateLabel={t("update")}
      />
      <DocumentCard
        title={t("passport")}
        status="pending"
        statusLabel={t("pending")}
        uploadedAt={t("uploaded-at", { date: t("dates.passport") })}
        numberLabel={t("passport-number", { number: t("masked-numbers.passport") })}
        updateLabel={t("update")}
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("upload-new")}
        onPress={alertComingSoon}
        className="mt-1 h-[54px] flex-row items-center justify-center rounded-pill border border-dashed border-primary bg-primary/5 active:opacity-80"
      >
        <AppText variant="label" className="text-primary">
          {t("upload-new")}
        </AppText>
        <View className="ms-2">
          <AppIcon name="plus" size={16} color={colors.primary} />
        </View>
      </Pressable>
    </Screen>
  );
}
