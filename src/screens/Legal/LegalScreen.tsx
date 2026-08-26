import React from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";

import { Screen } from "../../components/common/Screen";
import { StackScreenHeader } from "../../components/layout/StackScreenHeader";
import { AppText } from "../../components/typography/AppText";
import type { RootStackParamList } from "../../navigation/types";
import { fontSize } from "../../theme/typography";

type Props = NativeStackScreenProps<RootStackParamList, "Legal">;

export function LegalScreen({ navigation, route }: Props) {
  const { t } = useTranslation("legal");
  const title =
    route.params.kind === "privacy" ? t("privacy-title") : t("terms-title");

  return (
    <Screen
      edges={["bottom"]}
      className="bg-white"
      header={
        <StackScreenHeader title={title} onBack={() => navigation.goBack()} />
      }
    >
      <AppText
        variant="body"
        muted
        className="mt-6 text-start"
        style={{ fontSize: fontSize.body, lineHeight: 24 }}
      >
        {t("placeholder")}
      </AppText>
    </Screen>
  );
}
