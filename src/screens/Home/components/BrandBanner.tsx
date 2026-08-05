import React from "react";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { splashLogoMarkXml } from "../../../assets/figma/splash/logoMarkXml";
import { LocalSvg } from "../../../components/icons/LocalSvg";
import { AppText } from "../../../components/typography/AppText";
import { colors } from "../../../theme/colors";
import { fontFamily } from "../../../theme/typography";

export function BrandBanner() {
  const { t } = useTranslation(["home", "splash"]);

  return (
    <View className="h-[90px] overflow-hidden rounded-[20px] bg-primaryDark px-5">
      <View className="h-full flex-row items-center justify-between">
        <View className="items-start">
          <AppText
            className="text-[28px]"
            style={{ fontFamily: fontFamily.bold, lineHeight: 34, color: colors.primarySoft }}
          >
            {t("splash:brand-welm")}
          </AppText>
          <AppText
            className="text-[18px] tracking-[2px] text-white"
            style={{ fontFamily: fontFamily.bold, lineHeight: 22 }}
          >
            {t("splash:brand-welm-en")}
          </AppText>
          <AppText
            className="mt-1 text-[11px] text-white opacity-80"
            style={{ fontFamily: fontFamily.regular }}
          >
            {t("home:banner-tagline")}
          </AppText>
        </View>
        <LocalSvg xml={splashLogoMarkXml} width={56} height={62} />
      </View>
    </View>
  );
}
