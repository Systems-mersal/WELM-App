import React, { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  constrainHijri,
  hijriMonthLength,
  hijriYearRange,
  setHijriPart,
  type HijriYmd,
} from "../../lib/hijri";
import { AppText } from "../typography/AppText";

type Props = {
  visible: boolean;
  value: HijriYmd;
  onConfirm: (next: HijriYmd) => void;
  onClose: () => void;
};

function Column({
  items,
  selected,
  onSelect,
}: {
  items: { key: string; label: string }[];
  selected: string;
  onSelect: (key: string) => void;
}) {
  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerClassName="pb-3"
    >
      {items.map((item) => {
        const isSelected = item.key === selected;
        return (
          <Pressable
            key={item.key}
            onPress={() => onSelect(item.key)}
            className={`mb-1 items-center rounded-xl px-1 py-2.5 ${
              isSelected ? "bg-primaryMuted" : "bg-transparent"
            }`}
          >
            <AppText
              variant="caption"
              className={`text-center ${isSelected ? "text-primary" : "text-text"}`}
            >
              {item.label}
            </AppText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export function HijriDateSheet({ visible, value, onConfirm, onClose }: Props) {
  const { t } = useTranslation("profile-gate");
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (visible) {
      setDraft(value);
    }
  }, [visible, value]);

  const years = useMemo(() => hijriYearRange(draft.year), [draft.year]);
  const monthItems = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => {
        const month = index + 1;
        return {
          key: String(month),
          label: t(`hijri-month.${month}`),
        };
      }),
    [t],
  );
  const dayCount = hijriMonthLength(draft.year, draft.month);
  const dayItems = useMemo(
    () =>
      Array.from({ length: dayCount }, (_, index) => {
        const day = index + 1;
        return { key: String(day), label: String(day) };
      }),
    [dayCount],
  );

  const setPart = (part: keyof HijriYmd, next: number) => {
    setDraft((current) => setHijriPart(current, part, next));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/40">
        <Pressable className="flex-1" onPress={onClose} />
        <View
          className="rounded-t-3xl bg-white px-6 pt-4"
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
          <AppText variant="subtitle" className="mb-4 text-start text-text">
            {t("select-date")}
          </AppText>
          <View className="h-56 flex-row gap-2">
            <Column
              items={dayItems}
              selected={String(draft.day)}
              onSelect={(key) => setPart("day", Number(key))}
            />
            <Column
              items={monthItems}
              selected={String(draft.month)}
              onSelect={(key) => setPart("month", Number(key))}
            />
            <Column
              items={years.map((year) => ({
                key: String(year),
                label: String(year),
              }))}
              selected={String(draft.year)}
              onSelect={(key) => setPart("year", Number(key))}
            />
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              onConfirm(constrainHijri(draft));
              onClose();
            }}
            className="mt-4 h-14 items-center justify-center rounded-pill bg-primary active:opacity-90"
          >
            <AppText variant="button" className="text-white">
              {t("sheet-confirm")}
            </AppText>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={onClose}
            className="mt-2 h-12 items-center justify-center"
          >
            <AppText variant="body" className="text-textMuted">
              {t("sheet-close")}
            </AppText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
