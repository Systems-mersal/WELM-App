import React, { memo } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useTranslation } from "react-i18next";
import type { Vehicle } from "../../types";
import { colors } from "../../theme/colors";
import { AppIcon } from "../icons/AppIcon";
import { AppText } from "../typography/AppText";

export interface CategoryChipsProps {
  categories: Array<{ key: string; label: string }>;
  selectedKey: string;
  onSelect: (key: string) => void;
  className?: string;
}

export const CategoryChips = memo(function CategoryChips({
  categories,
  selectedKey,
  onSelect,
  className = "",
}: CategoryChipsProps) {
  return (
    <View className={`flex-row flex-wrap gap-2 ${className}`}>
      {categories.map((category) => {
        const selected = category.key === selectedKey;
        return (
          <Pressable
            key={category.key}
            onPress={() => onSelect(category.key)}
            className={`items-center justify-center rounded-full px-4 py-2 ${
              selected ? "bg-primary" : "border border-border bg-white"
            }`}
          >
            <AppText
              variant="caption"
              className={selected ? "text-white" : "text-text"}
            >
              {category.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
});

export interface HorizontalCategoryChipsProps extends CategoryChipsProps {
  variant?: "default" | "onDark";
}

export const HorizontalCategoryChips = memo(function HorizontalCategoryChips({
  variant = "default",
  ...props
}: HorizontalCategoryChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="items-center gap-2 px-6"
      className="-mx-6"
      style={{ flexGrow: 0 }}
    >
      {props.categories.map((category) => {
          const selected = category.key === props.selectedKey;
          const onDark = variant === "onDark";

          return (
            <Pressable
              key={category.key}
              onPress={() => props.onSelect(category.key)}
              className={`items-center justify-center rounded-full px-4 py-2 ${
                onDark
                  ? selected
                    ? "bg-white"
                    : "bg-white/15"
                  : selected
                    ? "bg-primary"
                    : "border border-border bg-white"
              }`}
            >
              <AppText
                variant="caption"
                className={
                  onDark
                    ? selected
                      ? "text-primary"
                      : "text-white"
                    : selected
                      ? "text-white"
                      : "text-text"
                }
              >
                {category.label}
              </AppText>
            </Pressable>
          );
        })}
    </ScrollView>
  );
});

export function useVehicleLabel(vehicle: Vehicle) {
  const { t } = useTranslation("vehicles");
  const name = t(vehicle.nameKey);
  const location = vehicle.locationKey
    ? t(`locations.${vehicle.locationKey}`)
    : undefined;
  return { name, location };
}

export function VehiclePriceRow({
  price,
  rating,
  location,
}: {
  price: number;
  rating: number;
  location?: string;
}) {
  const { t } = useTranslation(["common", "home"]);

  return (
    <View className="gap-1">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-baseline">
          <AppText variant="label" className="text-primary">
            {price}
          </AppText>
          <AppText variant="caption" muted className="ms-1">
            {t("common:currency")}
            {t("home:per-day")}
          </AppText>
        </View>
        <View className="flex-row items-center gap-1">
          <AppIcon name="star" size={14} color={colors.primary} />
          <AppText variant="caption">{rating}</AppText>
        </View>
      </View>
      {location ? (
        <View className="flex-row items-center gap-1">
          <AppIcon name="map-pin" size={12} color={colors.textMuted} />
          <AppText variant="caption" muted>
            {location}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}
