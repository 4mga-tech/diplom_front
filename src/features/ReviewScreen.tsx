import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    withTiming,
} from "react-native-reanimated";
import { theme } from "../ui/theme";

const WORDS = [
  { mn: "Сайн байна уу", en: "Hello" },
  { mn: "Баярлалаа", en: "Thank you" },
  { mn: "Үгүй", en: "No" },
  { mn: "Тийм", en: "Yes" },
];

export default function ReviewScreen() {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const current = WORDS[index];
  const isLast = index === WORDS.length - 1;

  const progress = ((index + 1) / WORDS.length) * 100;

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { rotateY: withTiming(flipped ? "180deg" : "0deg", { duration: 260 }) },
    ],
  }));

  const frontStyle = useAnimatedStyle(() => ({
    opacity: withTiming(flipped ? 0 : 1, { duration: 180 }),
  }));

  const backStyle = useAnimatedStyle(() => ({
    opacity: withTiming(flipped ? 1 : 0, { duration: 180 }),
    transform: [{ rotateY: "180deg" }],
  }));

  const next = () => {
    if (isLast) {
      // router.push("/courses");
      router.push("/");
      return;
    }
    setFlipped(false);
    setIndex((i) => i + 1);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* <Pressable onPress={() => router.push("/courses")}> */}
        <Pressable onPress={() => router.push("/")}>
          <Ionicons name="close" size={22} color={theme.colors.muted} />
        </Pressable>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>

        <View style={{ width: 22 }} />
      </View>

      <View style={styles.center}>
        <Pressable onPress={() => setFlipped((f) => !f)}>
          <Animated.View style={[styles.card, cardStyle]}>
            <Animated.View style={[styles.face, frontStyle]}>
              <Text style={styles.mn}>{current.mn}</Text>
              <Text style={styles.hint}>Tap to see the translation</Text>
            </Animated.View>

            <Animated.View style={[styles.face, styles.back, backStyle]}>
              <Text style={styles.en}>{current.en}</Text>
            </Animated.View>
          </Animated.View>
        </Pressable>
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.wrongBtn} onPress={next}>
          <Ionicons name="close" size={20} color="#F87171" />
          <Text style={styles.wrongText}>wrong</Text>
        </Pressable>

        <Pressable style={styles.rightBtn} onPress={next}>
          <Ionicons name="checkmark" size={22} color="white" />
          <Text style={styles.rightText}>correct</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    paddingTop: theme.s(6),
    paddingHorizontal: theme.s(3),
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(2),
  },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    backgroundColor: "rgba(30,41,59,0.75)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.85)",
  },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  card: {
    width: 300,
    height: 200,
    borderRadius: 26,
    backgroundColor: "rgba(15,23,42,0.8)",
    borderWidth: 1,
    borderColor: "rgba(51,65,85,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  face: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backfaceVisibility: "hidden",
    padding: theme.s(3),
  },
  back: { transform: [{ rotateY: "180deg" }] },

  mn: { color: "white", fontSize: 28, fontWeight: "900", textAlign: "center" },
  en: {
    color: "#60A5FA",
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
  },
  hint: { color: theme.colors.muted, marginTop: theme.s(1), fontSize: 12 },

  actions: {
    flexDirection: "row",
    gap: theme.s(2),
    marginBottom: theme.s(4),
  },
  wrongBtn: {
    flex: 1,
    paddingVertical: theme.s(2),
    borderRadius: theme.r.xl,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: theme.s(1),
    backgroundColor: "rgba(127,29,29,0.22)",
    borderWidth: 1,
    borderColor: "rgba(153,27,27,0.55)",
  },
  wrongText: { color: "#F87171", fontWeight: "900" },

  rightBtn: {
    flex: 1,
    paddingVertical: theme.s(2),
    borderRadius: theme.r.xl,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: theme.s(1),
    backgroundColor: "rgba(34,197,94,0.35)",
    borderWidth: 1,
    borderColor: "rgba(22,163,74,0.55)",
  },
  rightText: { color: "white", fontWeight: "900" },
});
