import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { AppTheme, useAppTheme, useThemedStyles } from "./theme";

type Props = {
  onPress?: () => void;
};

export function BackButton({ onPress }: Props) {
  const router = useRouter();
  const { theme } = useAppTheme();
  const styles = useThemedStyles(createStyles);

  const handlePress = () => {
    if (onPress) onPress();
    else router.back();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [styles.btn, pressed && { opacity: 0.75 }]}
    >
      <Ionicons name="arrow-back" size={22} color={theme.colors.icon} />
    </Pressable>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
  btn: {
    padding: 8,
    borderRadius: 14,
    marginLeft: -8,
    backgroundColor: theme.mode === "dark" ? "transparent" : theme.colors.card,
  },
  });
