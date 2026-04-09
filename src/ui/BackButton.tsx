import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet } from "react-native";

type Props = {
  onPress?: () => void;
};

export function BackButton({ onPress }: Props) {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) onPress();
    else router.back();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [styles.btn, pressed && { opacity: 0.75 }]}
    >
      <Ionicons name="arrow-back" size={22} color="rgba(148,163,184,1)" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    padding: 8,
    borderRadius: 14,
    marginLeft: -8,
  },
});
