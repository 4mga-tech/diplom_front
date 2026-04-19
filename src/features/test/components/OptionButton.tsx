import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";

type Props = {
  text: string;
  selected: boolean;
  onPress: () => void;
};

export default function OptionButton({ text, selected, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.button, selected && styles.buttonSelected]}
    >
      <Text style={[styles.text, selected && styles.textSelected]}>{text}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  buttonSelected: {
    backgroundColor: "rgba(139,92,246,0.18)",
    borderColor: "#8B5CF6",
  },
  text: {
    color: "#E2E8F0",
    fontSize: 15,
    fontWeight: "600",
  },
  textSelected: {
    color: "white",
  },
});
