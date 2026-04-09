import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "./theme";

type Props = {
  title: string;
  description: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  gradient: [string, string];
  onPress: () => void;
};

export default function CourseCard({
  title,
  description,
  progress,
  totalLessons,
  completedLessons,
  gradient,
  onPress,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}
    >
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.desc}>{description}</Text>
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>{progress}%</Text>
        </View>
      </LinearGradient>

      <View style={styles.body}>
        <View style={styles.progressRow}>
          <Text style={styles.smallMuted}>
            {completedLessons}/{totalLessons} Lessons
          </Text>
          <Text style={styles.smallMuted}>Continue</Text>
        </View>

        <View style={styles.barTrack}>
          <View
            style={[
              styles.barFill,
              { width: `${Math.max(0, Math.min(100, progress))}%` },
            ]}
          />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.r.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(51,65,85,0.55)",
    backgroundColor: "rgba(15,23,42,0.6)",
  },
  hero: {
    padding: theme.s(2.5),
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(2),
    minHeight: 96,
  },
  title: { color: "white", fontSize: 18, fontWeight: "800" },
  desc: { color: "rgba(255,255,255,0.85)", marginTop: 4, fontSize: 13 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.25)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  badgeText: { color: "white", fontWeight: "800", fontSize: 12 },
  body: { padding: theme.s(2.5), gap: theme.s(1.5) },
  progressRow: { flexDirection: "row", justifyContent: "space-between" },
  smallMuted: { color: theme.colors.muted, fontSize: 12, fontWeight: "600" },
  barTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: "rgba(148,163,184,0.15)",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.75)",
  },
});
