import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  type ScrollViewProps,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export interface ScreenProps extends Omit<ScrollViewProps, "className"> {
  children: React.ReactNode;
  scrollable?: boolean;
  /** Wrap body in KeyboardAvoidingView (auth forms). */
  keyboard?: boolean;
  /** Optional header rendered above the scroll/body (outside scroll). */
  header?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  edges?: ("top" | "bottom" | "left" | "right")[];
}

export function Screen({
  children,
  scrollable = true,
  keyboard = false,
  header,
  className = "",
  contentClassName = "",
  edges = ["left", "right", "bottom"],
  ...scrollProps
}: ScreenProps) {
  const body = scrollable ? (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps={keyboard ? "handled" : undefined}
      contentContainerClassName={`flex-grow px-6 pb-6 ${contentClassName}`}
      {...scrollProps}
    >
      {children}
    </ScrollView>
  ) : (
    <View className={`flex-1 px-6 ${contentClassName}`}>{children}</View>
  );

  const content = keyboard ? (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {body}
    </KeyboardAvoidingView>
  ) : (
    body
  );

  return (
    <SafeAreaView edges={edges} className={`flex-1 bg-background ${className}`}>
      {header}
      {content}
    </SafeAreaView>
  );
}
