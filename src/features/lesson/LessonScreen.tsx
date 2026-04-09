import { theme } from "@/src/ui/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
    FadeIn,
    SlideInLeft,
    SlideInRight,
    SlideOutLeft,
    SlideOutRight,
    useAnimatedStyle,
    withTiming,
} from "react-native-reanimated";
import { getVocabularyByLevel } from "../../data/vocabulary";

function PrimaryButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.92 }]}
    >
      <LinearGradient
        colors={["#2563EB", "#7C3AED"]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.primaryGrad}
      >
        <Text style={styles.primaryText}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

function SecondaryButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.secondaryBtn,
        pressed && { opacity: 0.92 },
      ]}
    >
      <Text style={styles.secondaryText}>{label}</Text>
    </Pressable>
  );
}

export default function LessonScreen() {
  const { levelId, letter } = useLocalSearchParams<{
    levelId?: string;
    letter?: string;
  }>();
  const safeLevelId = levelId ?? "M1";
  const raw = getVocabularyByLevel(levelId ?? "M1");
  const group = raw.find((g: any) => g.letter === letter);

  const vocabulary = group?.words ?? [];
  const LESSONS = useMemo(() => {
    return vocabulary.map((w: any) => ({
      mongolian: w.word,
      transliteration: "",
      english: w.translation,
    }));
  }, [vocabulary]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  const current = LESSONS[currentIndex];
  const isLast = currentIndex === LESSONS.length - 1;

  const progressPct =
    LESSONS.length > 0 ? ((currentIndex + 1) / LESSONS.length) * 100 : 0;
  const progressStyle = useAnimatedStyle(() => ({
    width: withTiming(`${progressPct}%`, { duration: 280 }),
  }));

  const goNext = () => {
    if (isLast) {
      // router.push("/courses");
      router.push("/");
      return;
    }
    setDirection(1);
    setCurrentIndex((p) => p + 1);
  };

  const goPrev = () => {
    if (currentIndex <= 0) return;
    setDirection(-1);
    setCurrentIndex((p) => p - 1);
  };

  const playAudio = () => {
    console.log("Play audio:", current.mongolian);
  };

  const entering =
    direction > 0 ? SlideInRight.duration(280) : SlideInLeft.duration(280);
  const exiting =
    direction > 0 ? SlideOutLeft.duration(220) : SlideOutRight.duration(220);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          // onPress={() => router.push("/courses")}
          onPress={() => router.push("/")}
          style={({ pressed }) => [
            styles.headerBtn,
            pressed && { opacity: 0.75 },
          ]}
        >
          <Ionicons name="chevron-back" size={22} color={theme.colors.muted} />
        </Pressable>

        <View style={styles.progressWrap}>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, progressStyle]} />
          </View>
        </View>

        <Pressable
          // onPress={() => router.push("/courses")}
          onPress={() => router.push("/")}
          style={({ pressed }) => [
            styles.headerBtn,
            pressed && { opacity: 0.75 },
          ]}
        >
          <Ionicons name="close" size={22} color={theme.colors.muted} />
        </Pressable>
      </View>

      <Animated.View entering={FadeIn.duration(250)} style={styles.counter}>
        <Text style={styles.counterText}>
          Lesson {currentIndex + 1} / {LESSONS.length}
        </Text>
      </Animated.View>

      <View style={styles.center}>
        <Animated.View
          key={currentIndex}
          entering={entering}
          exiting={exiting}
          style={styles.card}
        >
          <LinearGradient
            colors={["rgba(37,99,235,0.25)", "rgba(124,58,237,0.22)"]}
            style={styles.glow}
          />

          <View style={styles.cardInner}>
            <View style={styles.block}>
              <Text style={styles.label}>mongolian</Text>
              <Text style={styles.mn}>{current.mongolian}</Text>
            </View>

            <View style={styles.block}>
              <Text style={styles.label}>pronunciation</Text>
              <Text style={styles.translit}>/{current.transliteration}/</Text>
            </View>

            <View style={styles.block}>
              <Text style={styles.label}>tranlation</Text>
              <Text style={styles.en}>{current.english}</Text>
            </View>

            {/* Audio  */}
            <Pressable
              onPress={playAudio}
              style={({ pressed }) => [
                styles.audioBtnWrap,
                pressed && { transform: [{ scale: 0.97 }] },
              ]}
            >
              <LinearGradient
                colors={["#2563EB", "#7C3AED"]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.audioBtn}
              >
                <Ionicons name="volume-high" size={28} color="white" />
              </LinearGradient>
            </Pressable>
          </View>
        </Animated.View>
      </View>

      <Animated.View entering={FadeIn.duration(300)} style={styles.bottom}>
        {currentIndex > 0 && (
          <SecondaryButton label="Previous" onPress={goPrev} />
        )}

        <PrimaryButton label={isLast ? "End" : "Next"} onPress={goNext} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    paddingHorizontal: theme.s(3),
    paddingTop: theme.s(6),
    paddingBottom: theme.s(4),
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(1.5),
    marginBottom: theme.s(2),
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  progressWrap: { flex: 1 },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: "rgba(30,41,59,0.75)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.85)",
  },

  counter: { alignItems: "center", marginBottom: theme.s(2) },
  counterText: { color: theme.colors.muted, fontSize: 12, fontWeight: "700" },

  center: { flex: 1, justifyContent: "center" },

  card: {
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "rgba(51,65,85,0.55)",
    backgroundColor: "rgba(15,23,42,0.65)",
    overflow: "hidden",
  },
  glow: {
    position: "absolute",
    top: -30,
    right: -30,
    width: 220,
    height: 220,
    borderRadius: 999,
    transform: [{ rotate: "12deg" }],
  },
  cardInner: {
    padding: theme.s(4),
    gap: theme.s(3),
    alignItems: "center",
  },
  block: { alignItems: "center", gap: 8 },
  label: {
    color: "rgba(148,163,184,0.65)",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  mn: { color: "white", fontSize: 36, fontWeight: "800", textAlign: "center" },
  translit: {
    color: "#60A5FA",
    fontSize: 20,
    fontStyle: "italic",
    fontWeight: "700",
  },
  en: {
    color: "rgba(226,232,240,0.9)",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },

  audioBtnWrap: { marginTop: theme.s(1) },
  audioBtn: {
    width: 76,
    height: 76,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2563EB",
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 10,
  },

  bottom: { gap: theme.s(1.5), marginTop: theme.s(2) },

  primaryBtn: { borderRadius: theme.r.xl, overflow: "hidden" },
  primaryGrad: {
    paddingVertical: theme.s(2),
    alignItems: "center",
    borderRadius: theme.r.xl,
  },
  primaryText: { color: "white", fontSize: 16, fontWeight: "900" },

  secondaryBtn: {
    paddingVertical: theme.s(2),
    alignItems: "center",
    borderRadius: theme.r.xl,
    borderWidth: 1,
    borderColor: "rgba(51,65,85,0.6)",
    backgroundColor: "rgba(30,41,59,0.45)",
  },
  secondaryText: { color: theme.colors.text, fontSize: 15, fontWeight: "800" },
});
