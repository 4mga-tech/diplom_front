import { LessonStyles } from "@/src/features/lesson/lesson.styles";
import { useAppTheme } from "@/src/ui/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Pressable, Text, View } from "react-native";

type Props = {
  label: string;
  onPress: () => void;
  styles: LessonStyles;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  icon?: keyof typeof Ionicons.glyphMap;
};

export default function LessonActionButton({
  label,
  onPress,
  styles,
  disabled = false,
  variant = "secondary",
  icon,
}: Props) {
  const { theme } = useAppTheme();

  const content = (
    <>
      {icon ? <Ionicons name={icon} size={16} color={theme.colors.text} /> : null}
      <Text
        style={
          variant === "primary"
            ? styles.primaryButtonText
            : styles.secondaryButtonText
        }
      >
        {label}
      </Text>
    </>
  );

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        pressed && !disabled ? styles.actionButtonPressed : null,
        disabled ? styles.actionButtonDisabled : null,
      ]}
    >
      {variant === "primary" ? (
        <LinearGradient
          colors={theme.colors.primaryGradient}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[styles.primaryButtonInner, { flexDirection: "row", gap: 8 }]}
        >
          {content}
        </LinearGradient>
      ) : (
        <View
          style={[styles.secondaryButtonInner, { flexDirection: "row", gap: 8 }]}
        >
          {content}
        </View>
      )}
    </Pressable>
  );
}
