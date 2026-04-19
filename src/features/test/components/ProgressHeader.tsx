import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  title: string;
  current: number;
  total: number;
  progress: number;
  onQuit: () => void;
};

export default function ProgressHeader({
  title,
  current,
  total,
  progress,
  onQuit,
}: Props) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.topRow}>
        <Pressable onPress={onQuit}>
          <Text style={styles.quitText}>Quit</Text>
        </Pressable>

        <Text style={styles.title}>{title}</Text>

        <View style={styles.placeholder} />
      </View>

      <View style={styles.progressWrap}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <Text style={styles.counter}>
        Question {current} / {total}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 18,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  quitText: {
    color: "#FCA5A5",
    fontSize: 15,
    fontWeight: "700",
  },
  title: {
    color: "white",
    fontSize: 16,
    fontWeight: "800",
    textTransform: "capitalize",
  },
  placeholder: {
    width: 40,
  },
  progressWrap: {
    height: 10,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 10,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#8B5CF6",
    borderRadius: 999,
  },
  counter: {
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "600",
  },
});
