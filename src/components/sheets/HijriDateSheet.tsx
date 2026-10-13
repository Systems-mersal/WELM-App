import React, { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  clampHijriNotPast,
  clampHijriToToday,
  hijriMonthLength,
  hijriYearRange,
  isHijriFuture,
  isHijriPast,
  setHijriPart,
  todayHijri,
  toEasternDigits,
  type HijriYmd,
} from "../../lib/hijri";
import { AppText } from "../typography/AppText";

type Props = {
  visible: boolean;
  value: HijriYmd;
  onConfirm: (next: HijriYmd) => void;
  onClose: () => void;
  title?: string;
  confirmLabel?: string;
  closeLabel?: string;
  monthLabels?: Record<string, string>;
  yearColumnLabel?: string;
  monthColumnLabel?: string;
  dayColumnLabel?: string;
  /** Date of birth rejects future; license expiry rejects past. */
  bound?: "not-future" | "not-past";
  helperText?: string;
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

export function HijriDateSheet({
  visible,
  value,
  onConfirm,
  onClose,
  title,
  confirmLabel,
  closeLabel,
  monthLabels,
  yearColumnLabel,
  monthColumnLabel,
  dayColumnLabel,
  bound = "not-future",
  helperText,
}: Props) {
  const { t, i18n } = useTranslation("profile-gate");
  const insets = useSafeAreaInsets();
  const eastern = i18n.language.startsWith("ar");
  const [draft, setDraft] = useState(value);
  const clampDraft =
    bound === "not-past" ? clampHijriNotPast : clampHijriToToday;
  const invalid =
    bound === "not-past" ? isHijriPast(draft) : isHijriFuture(draft);

  useEffect(() => {
    if (visible) {
      setDraft(clampDraft(value));
    }
  }, [clampDraft, value, visible]);

  const years = useMemo(() => {
    if (bound === "not-past") {
      const current = todayHijri().year;
      return hijriYearRange(draft.year, {
        fromYear: current,
        toYear: current + 20,
      });
    }
    return hijriYearRange(draft.year);
  }, [bound, draft.year]);
  const monthItems = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => {
        const month = index + 1;
        return {
          key: String(month),
          label: monthLabels?.[String(month)] ?? t(`hijri-month.${month}`),
        };
      }),
    [monthLabels, t],
  );
  const dayCount = hijriMonthLength(draft.year, draft.month);
  const dayItems = useMemo(
    () =>
      Array.from({ length: dayCount }, (_, index) => {
        const day = index + 1;
        return {
          key: String(day),
          label: eastern ? toEasternDigits(day) : String(day),
        };
      }),
    [dayCount, eastern],
  );

  const setPart = (part: keyof HijriYmd, next: number) => {
    setDraft((current) => clampDraft(setHijriPart(current, part, next)));
  };

  const showHeaders = Boolean(
    yearColumnLabel || monthColumnLabel || dayColumnLabel,
  );

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
            {title ?? t("select-date")}
          </AppText>
          {showHeaders ? (
            <View className="mb-2 flex-row gap-2">
              <AppText variant="caption" muted className="flex-1 text-center">
                {yearColumnLabel}
              </AppText>
              <AppText variant="caption" muted className="flex-1 text-center">
                {monthColumnLabel}
              </AppText>
              <AppText variant="caption" muted className="flex-1 text-center">
                {dayColumnLabel}
              </AppText>
            </View>
          ) : null}
          <View className="h-56 flex-row gap-2">
            <Column
              items={years.map((year) => ({
                key: String(year),
                label: eastern ? toEasternDigits(year) : String(year),
              }))}
              selected={String(draft.year)}
              onSelect={(key) => setPart("year", Number(key))}
            />
            <Column
              items={monthItems}
              selected={String(draft.month)}
              onSelect={(key) => setPart("month", Number(key))}
            />
            <Column
              items={dayItems}
              selected={String(draft.day)}
              onSelect={(key) => setPart("day", Number(key))}
            />
          </View>
          {helperText ? (
            <AppText variant="caption" muted className="mt-3 text-start">
              {helperText}
            </AppText>
          ) : null}
          <Pressable
            accessibilityRole="button"
            disabled={invalid}
            onPress={() => {
              const next = clampDraft(draft);
              if (bound === "not-past" ? isHijriPast(next) : isHijriFuture(next)) {
                return;
              }
              onConfirm(next);
              onClose();
            }}
            className={`mt-4 h-14 items-center justify-center rounded-pill bg-primary ${
              invalid ? "opacity-50" : "active:opacity-90"
            }`}
          >
            <AppText variant="button" className="text-white">
              {confirmLabel ?? t("sheet-confirm")}
            </AppText>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={onClose}
            className="mt-2 h-12 items-center justify-center"
          >
            <AppText variant="body" className="text-textMuted">
              {closeLabel ?? t("sheet-close")}
            </AppText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
