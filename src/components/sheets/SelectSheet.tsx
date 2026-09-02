import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "../../theme/colors";
import { AppIcon } from "../icons/AppIcon";
import { AppText } from "../typography/AppText";

export type SelectSheetOption = {
  value: string;
  label: string;
};

type Props = {
  visible: boolean;
  title: string;
  options: SelectSheetOption[];
  selected?: string;
  onSelect: (value: string) => void;
  onClose: () => void;
  closeLabel: string;
};

export function SelectSheet({
  visible,
  title,
  options,
  selected,
  onSelect,
  onClose,
  closeLabel,
}: Props) {
  const insets = useSafeAreaInsets();

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
          <View className="mb-4 flex-row items-center">
            <AppText variant="subtitle" className="flex-1 text-start text-text">
              {title}
            </AppText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={closeLabel}
              onPress={onClose}
              hitSlop={8}
              className="h-9 w-9 items-center justify-center rounded-full bg-background"
            >
              <AppIcon name="close" size={16} color={colors.textMuted} />
            </Pressable>
          </View>
          <ScrollView
            className="max-h-80"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {options.map((option) => {
              const isSelected = option.value === selected;
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="button"
                  onPress={() => {
                    onSelect(option.value);
                    onClose();
                  }}
                  className={`mb-2 flex-row items-center rounded-2xl border px-4 py-3.5 ${
                    isSelected
                      ? "border-primary bg-primaryMuted"
                      : "border-border bg-white"
                  }`}
                >
                  <AppText
                    variant="body"
                    className={`flex-1 text-start ${
                      isSelected ? "text-primary" : "text-text"
                    }`}
                  >
                    {option.label}
                  </AppText>
                  {isSelected ? (
                    <AppIcon name="check" size={18} color={colors.primary} />
                  ) : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
