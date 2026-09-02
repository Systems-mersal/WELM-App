import React from "react";
import { Pressable, View } from "react-native";
import { useTranslation } from "react-i18next";

import { SEARCH_CITIES, type CityKey } from "../../constants/search-cities";
import { SelectSheet } from "../sheets/SelectSheet";
import { AppIcon } from "../icons/AppIcon";
import { AppText } from "../typography/AppText";
import { colors } from "../../theme/colors";

type Props = {
  visible: boolean;
  selected?: CityKey | null;
  onSelect: (cityKey: CityKey) => void;
  onClose: () => void;
};

export function CityPickerSheet({
  visible,
  selected,
  onSelect,
  onClose,
}: Props) {
  const { t } = useTranslation(["home", "vehicles"]);
  const options = SEARCH_CITIES.map((city) => ({
    value: city.cityKey,
    label: t(`vehicles:locations.${city.cityKey}`),
  }));

  return (
    <SelectSheet
      visible={visible}
      title={t("home:select-city")}
      options={options}
      selected={selected ?? undefined}
      onSelect={(value) => onSelect(value as CityKey)}
      onClose={onClose}
      closeLabel={t("home:sheet-close")}
    />
  );
}

type PromptProps = {
  onChooseCity: () => void;
};

/** Shown after Later / deny / unavailable until a city is chosen. */
export function SelectCityCard({ onChooseCity }: PromptProps) {
  const { t } = useTranslation("home");

  return (
    <View className="rounded-2xl border border-border bg-white p-4">
      <View className="flex-row items-start gap-3">
        <View className="h-11 w-11 items-center justify-center rounded-full bg-primaryMuted">
          <AppIcon name="map-pin" size={20} color={colors.primary} />
        </View>
        <View className="flex-1 items-start gap-1">
          <AppText variant="subtitle" className="text-start text-text">
            {t("select-city")}
          </AppText>
          <AppText variant="caption" className="text-start text-textMuted">
            {t("select-city-subtitle")}
          </AppText>
        </View>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("select-city")}
        onPress={onChooseCity}
        className="mt-4 h-12 items-center justify-center rounded-pill bg-primary active:opacity-90"
      >
        <AppText variant="button" className="text-white">
          {t("select-city")}
        </AppText>
      </Pressable>
    </View>
  );
}
