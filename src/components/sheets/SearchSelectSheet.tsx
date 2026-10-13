import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "../../theme/colors";
import { fontFamily } from "../../theme/typography";
import { AppText } from "../typography/AppText";

export type SearchSelectOption = {
  value: string;
  label: string;
};

type Props = {
  visible: boolean;
  title: string;
  options: SearchSelectOption[];
  selected?: string;
  searchPlaceholder: string;
  confirmLabel: string;
  closeLabel: string;
  onConfirm: (value: string) => void;
  onClose: () => void;
};

export function SearchSelectSheet({
  visible,
  title,
  options,
  selected,
  searchPlaceholder,
  confirmLabel,
  closeLabel,
  onConfirm,
  onClose,
}: Props) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState(selected);

  useEffect(() => {
    if (visible) {
      setQuery("");
      setDraft(selected);
    }
  }, [selected, visible]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return options;
    }
    return options.filter((option) =>
      option.label.toLowerCase().includes(needle),
    );
  }, [options, query]);

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
          <AppText variant="subtitle" className="mb-3 text-start text-text">
            {title}
          </AppText>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={searchPlaceholder}
            placeholderTextColor={colors.textMuted}
            className="mb-3 h-12 rounded-2xl border border-border bg-background px-4 text-text"
            style={{ fontFamily: fontFamily.regular, fontSize: 16 }}
          />
          <ScrollView
            className="max-h-80"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {filtered.map((option) => {
              const isSelected = option.value === draft;
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => setDraft(option.value)}
                  className="mb-1 flex-row items-center gap-3 rounded-2xl px-2 py-3"
                >
                  <View
                    className={`h-5 w-5 items-center justify-center rounded-full border ${
                      isSelected ? "border-primary" : "border-border"
                    }`}
                  >
                    {isSelected ? (
                      <View className="h-2.5 w-2.5 rounded-full bg-primary" />
                    ) : null}
                  </View>
                  <AppText
                    variant="body"
                    className={`flex-1 text-start ${
                      isSelected ? "text-primary" : "text-text"
                    }`}
                  >
                    {option.label}
                  </AppText>
                </Pressable>
              );
            })}
          </ScrollView>
          <Pressable
            accessibilityRole="button"
            disabled={!draft}
            onPress={() => {
              if (!draft) {
                return;
              }
              onConfirm(draft);
              onClose();
            }}
            className={`mt-4 h-14 items-center justify-center rounded-pill bg-primary ${
              draft ? "active:opacity-90" : "opacity-50"
            }`}
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
