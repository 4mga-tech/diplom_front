import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { theme } from "./theme";

export function GradientButton({
  title,
  onPress,
  disabled,
  style,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.wrap,
        style,
        (pressed || disabled) && { opacity: disabled ? 0.55 : 0.92 },
      ]}
    >
      <LinearGradient
        colors={[theme.colors.blue, "#7C3AED"]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.btn}
      >
        <Text style={styles.text}>{title}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: theme.r.xl, overflow: "hidden" },
  btn: {
    paddingVertical: theme.s(2),
    alignItems: "center",
    borderRadius: theme.r.xl,
  },
  text: { color: "white", fontSize: 16, fontWeight: "800" },
});
