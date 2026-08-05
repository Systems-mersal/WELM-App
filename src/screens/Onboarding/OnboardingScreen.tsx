import React, { useState } from "react";
import { Dimensions, Image, Pressable, View } from "react-native";
import { useTranslation } from "react-i18next";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { AppButton } from "../../components/buttons/AppButton";
import { Screen } from "../../components/common/Screen";
import { AppText } from "../../components/typography/AppText";
import { setHasSeenOnboarding } from "../../lib/onboarding-storage";
import type { RootStackParamList } from "../../navigation/types";
import { fontFamily, fontSize } from "../../theme/typography";
import { LAST_STEP_INDEX, STEPS } from "./constants";

type Props = NativeStackScreenProps<RootStackParamList, "Onboarding">;

const SCREEN_HEIGHT = Dimensions.get("window").height;
const IMAGE_HEIGHT = Math.min(380, Math.round(SCREEN_HEIGHT * 0.42));

export function OnboardingScreen({ navigation }: Props) {
  const { t } = useTranslation("onboarding");
  const [step, setStep] = useState(0);

  const currentStep = STEPS[step] ?? STEPS[0];
  const isLastStep = step === LAST_STEP_INDEX;
  const title = t(currentStep.titleKey);
  const description = t(currentStep.descKey);
  const buttonLabel = isLastStep ? t("get-started") : t("next");

  const goToLogin = async () => {
    await setHasSeenOnboarding();
    navigation.replace("Login");
  };

  const handleNext = () => {
    const nextStep = step + 1;
    if (nextStep >= STEPS.length) {
      void goToLogin();
      return;
    }
    setStep(nextStep);
  };

  return (
    <Screen
      scrollable={false}
      edges={["top", "bottom"]}
      className="bg-white"
      contentClassName="flex-1"
    >
      <View className="h-12 justify-center">
        {!isLastStep ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("skip")}
            onPress={() => {
              void goToLogin();
            }}
            className="self-start active:opacity-70"
            hitSlop={8}
          >
            <AppText variant="body" className="text-textMuted">
              {t("skip")}
            </AppText>
          </Pressable>
        ) : (
          <View className="h-6" />
        )}
      </View>

      <View className="mt-2 w-full overflow-hidden rounded-xl" style={{ height: IMAGE_HEIGHT }}>
        <Image
          source={currentStep.image}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
          accessibilityLabel={title}
          accessibilityIgnoresInvertColors
        />
      </View>

      <View className="mt-6 items-center gap-3 px-2">
        <AppText
          className="text-center text-text"
          style={{ fontFamily: fontFamily.bold, fontSize: fontSize.xxl, lineHeight: 32 }}
        >
          {title}
        </AppText>
        <AppText
          className="text-center text-textMuted"
          style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.label, lineHeight: 22 }}
        >
          {description}
        </AppText>
      </View>

      <View
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={`${step + 1} / ${STEPS.length}`}
        className="mt-6 flex-row items-center justify-center gap-2"
      >
        {STEPS.map((item, index) => (
          <View
            key={item.key}
            className={
              index === step
                ? "h-2 w-6 rounded-sm bg-primary"
                : "h-2 w-2 rounded-sm bg-border"
            }
          />
        ))}
      </View>

      <View className="mt-auto pb-6">
        <AppButton label={buttonLabel} onPress={handleNext} />
      </View>
    </Screen>
  );
}
