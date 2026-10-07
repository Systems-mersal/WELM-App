import React, { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useRtl } from "../../hooks/useRtl";
import { colors } from "../../theme/colors";
import { AppIcon } from "../icons/AppIcon";
import { AppText } from "../typography/AppText";

export type GregorianYmd = {
  year: number;
  month: number;
  day: number;
};

type Props = {
  visible: boolean;
  title: string;
  value: string;
  fallback?: string;
  min?: string;
  max?: string;
  monthLabels: Record<string, string>;
  weekdayLabels?: string[];
  helperText?: string;
  confirmLabel: string;
  closeLabel: string;
  onConfirm: (iso: string) => void;
  onClose: () => void;
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

export function isoFromYmd({ year, month, day }: GregorianYmd): string {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

export function parseIsoDate(value: string): GregorianYmd | null {
  if (!ISO_DATE.test(value)) {
    return null;
  }
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(year, month - 1, day);
  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }
  return { year, month, day };
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function todayYmd(): GregorianYmd {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  };
}

function constrainYmd(
  value: GregorianYmd,
  min?: GregorianYmd | null,
  max?: GregorianYmd | null,
): GregorianYmd {
  const day = Math.min(value.day, daysInMonth(value.year, value.month));
  let next = { ...value, day };
  if (min && isoFromYmd(next) < isoFromYmd(min)) {
    next = { ...min };
  }
  if (max && isoFromYmd(next) > isoFromYmd(max)) {
    next = { ...max };
  }
  return {
    ...next,
    day: Math.min(next.day, daysInMonth(next.year, next.month)),
  };
}

/** Saturday-first index for Saudi calendars (JS Sunday = 0). */
function saturdayFirstIndex(jsWeekday: number): number {
  return (jsWeekday + 1) % 7;
}

export function GregorianDateSheet({
  visible,
  title,
  value,
  fallback,
  min,
  max,
  monthLabels,
  weekdayLabels,
  helperText,
  confirmLabel,
  closeLabel,
  onConfirm,
  onClose,
}: Props) {
  const insets = useSafeAreaInsets();
  const { chevronStart, chevronEnd } = useRtl();
  const minYmd = min ? parseIsoDate(min) : null;
  const maxYmd = max ? parseIsoDate(max) : null;
  const initial = constrainYmd(
    parseIsoDate(value) ?? parseIsoDate(fallback ?? "") ?? todayYmd(),
    minYmd,
    maxYmd,
  );
  const [cursor, setCursor] = useState({
    year: initial.year,
    month: initial.month,
  });
  const [draft, setDraft] = useState(initial);

  useEffect(() => {
    if (!visible) {
      return;
    }
    const next = constrainYmd(
      parseIsoDate(value) ?? parseIsoDate(fallback ?? "") ?? todayYmd(),
      minYmd,
      maxYmd,
    );
    setDraft(next);
    setCursor({ year: next.year, month: next.month });
  }, [fallback, max, min, value, visible]);

  const cells = useMemo(() => {
    const first = new Date(cursor.year, cursor.month - 1, 1);
    const leading = saturdayFirstIndex(first.getDay());
    const count = daysInMonth(cursor.year, cursor.month);
    const slots: Array<{ day: number | null; iso: string | null }> = [];
    for (let i = 0; i < leading; i += 1) {
      slots.push({ day: null, iso: null });
    }
    for (let day = 1; day <= count; day += 1) {
      slots.push({
        day,
        iso: isoFromYmd({ year: cursor.year, month: cursor.month, day }),
      });
    }
    while (slots.length % 7 !== 0) {
      slots.push({ day: null, iso: null });
    }
    return slots;
  }, [cursor.month, cursor.year]);

  const canGoPrev = useMemo(() => {
    if (!minYmd) {
      return true;
    }
    const prevMonth = cursor.month === 1 ? 12 : cursor.month - 1;
    const prevYear = cursor.month === 1 ? cursor.year - 1 : cursor.year;
    return (
      isoFromYmd({
        year: prevYear,
        month: prevMonth,
        day: daysInMonth(prevYear, prevMonth),
      }) >= isoFromYmd(minYmd)
    );
  }, [cursor.month, cursor.year, minYmd]);

  const canGoNext = useMemo(() => {
    if (!maxYmd) {
      return true;
    }
    const nextMonth = cursor.month === 12 ? 1 : cursor.month + 1;
    const nextYear = cursor.month === 12 ? cursor.year + 1 : cursor.year;
    return (
      isoFromYmd({ year: nextYear, month: nextMonth, day: 1 }) <=
      isoFromYmd(maxYmd)
    );
  }, [cursor.month, cursor.year, maxYmd]);

  const shiftMonth = (delta: number) => {
    const date = new Date(cursor.year, cursor.month - 1 + delta, 1);
    setCursor({ year: date.getFullYear(), month: date.getMonth() + 1 });
  };

  const labels: string[] =
    weekdayLabels?.length === 7
      ? weekdayLabels
      : ["س", "ح", "ن", "ث", "ر", "خ", "ج"];

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
            {title}
          </AppText>
          <View className="mb-3 flex-row items-center justify-between">
            <Pressable
              accessibilityRole="button"
              disabled={!canGoPrev}
              onPress={() => shiftMonth(-1)}
              className={`h-10 w-10 items-center justify-center rounded-full bg-background ${
                canGoPrev ? "active:opacity-70" : "opacity-30"
              }`}
            >
              <AppIcon name={chevronStart} size={18} color={colors.text} />
            </Pressable>
            <AppText variant="body" className="text-text">
              {monthLabels[String(cursor.month)]} {cursor.year}
            </AppText>
            <Pressable
              accessibilityRole="button"
              disabled={!canGoNext}
              onPress={() => shiftMonth(1)}
              className={`h-10 w-10 items-center justify-center rounded-full bg-background ${
                canGoNext ? "active:opacity-70" : "opacity-30"
              }`}
            >
              <AppIcon name={chevronEnd} size={18} color={colors.text} />
            </Pressable>
          </View>
          <View className="mb-1 flex-row">
            {labels.map((label, index) => (
              <AppText
                key={`${label}-${index}`}
                variant="caption"
                muted
                className="flex-1 text-center"
              >
                {label}
              </AppText>
            ))}
          </View>
          {Array.from({ length: cells.length / 7 }, (_, row) => (
            <View key={`week-${row}`} className="flex-row">
              {cells.slice(row * 7, row * 7 + 7).map((cell, index) => {
                if (cell.day == null || cell.iso == null) {
                  return (
                    <View key={`empty-${row}-${index}`} className="h-10 flex-1" />
                  );
                }
                const beforeMin = Boolean(minYmd && cell.iso < isoFromYmd(minYmd));
                const afterMax = Boolean(maxYmd && cell.iso > isoFromYmd(maxYmd));
                const disabled = beforeMin || afterMax;
                const selected = cell.iso === isoFromYmd(draft);
                return (
                  <Pressable
                    key={cell.iso}
                    accessibilityRole="button"
                    disabled={disabled}
                    onPress={() =>
                      setDraft({
                        year: cursor.year,
                        month: cursor.month,
                        day: cell.day as number,
                      })
                    }
                    className={`h-10 flex-1 items-center justify-center rounded-full ${
                      selected ? "bg-primary" : "bg-transparent"
                    } ${disabled ? "opacity-30" : "active:opacity-80"}`}
                  >
                    <AppText
                      variant="caption"
                      className={selected ? "text-white" : "text-text"}
                    >
                      {cell.day}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          ))}
          {helperText ? (
            <AppText variant="caption" muted className="mt-3 text-start">
              {helperText}
            </AppText>
          ) : null}
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              onConfirm(isoFromYmd(constrainYmd(draft, minYmd, maxYmd)));
              onClose();
            }}
            className="mt-4 h-14 items-center justify-center rounded-pill bg-primary active:opacity-90"
          >
            <AppText variant="button" className="text-white">
              {confirmLabel}
            </AppText>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={onClose}
            className="mt-2 h-12 items-center justify-center"
          >
            <AppText variant="body" className="text-textMuted">
              {closeLabel}
            </AppText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
