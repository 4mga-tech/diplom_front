import {
  completeLesson,
  fetchLessonDetail,
  LessonContentItem,
  LessonDetail,
} from "@/lib/learning";
import { theme } from "@/src/ui/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
} from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

function PrimaryButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryBtn,
        pressed && !disabled && { opacity: 0.92 },
        disabled && { opacity: 0.55 },
      ]}
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
  const { lessonId, levelId, unitId } = useLocalSearchParams<{
    lessonId?: string;
    levelId?: string;
    unitId?: string;
  }>();
  const navigation = useNavigation();
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completionMessage, setCompletionMessage] = useState<string | null>(
    null,
  );

  const loadLesson = useCallback(async () => {
    if (!lessonId) {
      setLoading(false);
      setError("Lesson not found.");
      return;
    }

    setLoading(true);
    try {
      const data = await fetchLessonDetail(lessonId);
      setLesson(data);
      setError(data ? null : "Lesson not found.");
    } catch (loadError) {
      console.log("Error loading lesson:", loadError);
      setError("We could not load this lesson right now.");
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useFocusEffect(
    useCallback(() => {
      void loadLesson();
    }, [loadLesson]),
  );

  const goBackToLessons = () => {
    if (navigation.canGoBack()) {
      router.back();
      return;
    }

    if (levelId && unitId) {
      router.replace({
        pathname: "/units/[levelId]/[unitId]",
        params: { levelId, unitId },
      });
      return;
    }

    router.replace("/");
  };

  const handleCompleteLesson = async () => {
    if (!lessonId || !lesson || lesson.isCompleted) return;

    setSubmitting(true);
    setCompletionMessage(null);

    try {
      const result = await completeLesson(lessonId);
      const xpGained = Number(result?.xpGained ?? lesson.xpReward ?? 0);

      setLesson((current) =>
        current
          ? {
              ...current,
              isCompleted: true,
            }
          : current,
      );
      setCompletionMessage(
        xpGained > 0
          ? `Lesson complete. You earned ${xpGained} XP.`
          : "Lesson complete.",
      );
    } catch (submitError) {
      console.log("Error completing lesson:", submitError);
      setCompletionMessage("We could not complete the lesson right now.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderContent = (item: LessonContentItem) => {
    if (item.type === "video") {
      return (
        <View key={item.id} style={styles.contentCard}>
          <Text style={styles.contentLabel}>Video</Text>
          <Text style={styles.contentTitle}>{item.title || "Lesson video"}</Text>
          <Text style={styles.contentBody}>
            {item.content.videoUrl || "Video URL will be provided by the backend."}
          </Text>
        </View>
      );
    }

    if (item.type === "quiz") {
      return (
        <View key={item.id} style={styles.contentCard}>
          <Text style={styles.contentLabel}>Quiz</Text>
          <Text style={styles.contentTitle}>{item.title || "Lesson quiz"}</Text>
          <Text style={styles.contentBody}>
            Finish the lesson, then open the quiz flow once your backend quiz endpoint is ready.
          </Text>
        </View>
      );
    }

    return (
      <View key={item.id} style={styles.contentCard}>
        <Text style={styles.contentLabel}>Reading</Text>
        <Text style={styles.contentTitle}>{item.title || "Lesson notes"}</Text>
        <Text style={styles.contentBody}>
          {item.content.text || "Lesson text will appear here."}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.centerState}>
          <ActivityIndicator color="white" />
          <Text style={styles.stateText}>Loading lesson...</Text>
        </View>
      </View>
    );
  }

  if (!lesson) {
    return (
      <View style={styles.container}>
        <View style={styles.centerState}>
          <Text style={styles.stateText}>{error || "Lesson not found."}</Text>
          <SecondaryButton label="Back" onPress={goBackToLessons} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={goBackToLessons}
          style={({ pressed }) => [
            styles.headerBtn,
            pressed && { opacity: 0.75 },
          ]}
        >
          <Ionicons name="chevron-back" size={22} color={theme.colors.muted} />
        </Pressable>

        <View style={styles.progressWrap} />

        <Pressable
          onPress={goBackToLessons}
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
          {lesson.isCompleted ? "Completed lesson" : "Ready to learn"}
        </Text>
      </Animated.View>

      <ScrollView
        style={styles.center}
        contentContainerStyle={{ paddingBottom: theme.s(2) }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.duration(280)} style={styles.card}>
          <LinearGradient
            colors={["rgba(37,99,235,0.25)", "rgba(124,58,237,0.22)"]}
            style={styles.glow}
          />

          <View style={styles.cardInner}>
            <View style={styles.block}>
              <Text style={styles.label}>Lesson title</Text>
              <Text style={styles.mn}>{lesson.title}</Text>
            </View>

            <View style={styles.block}>
              <Text style={styles.label}>Lesson goal</Text>
              <Text style={styles.translit}>
                {lesson.subtitle || "Work through the lesson content below."}
              </Text>
            </View>

            <View style={styles.metaRow}>
              <View style={styles.metaPill}>
                <Ionicons name="flash" size={14} color="#FACC15" />
                <Text style={styles.metaText}>{lesson.xpReward} XP</Text>
              </View>
              <View style={styles.metaPill}>
                <Ionicons
                  name={lesson.isCompleted ? "checkmark-circle" : "lock-open-outline"}
                  size={14}
                  color={lesson.isCompleted ? "#4ADE80" : "#93C5FD"}
                />
                <Text style={styles.metaText}>
                  {lesson.isCompleted ? "Completed" : "Unlocked"}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lesson content</Text>
          {lesson.contents.map(renderContent)}
        </View>

        {completionMessage ? (
          <View
            style={[
              styles.feedbackCard,
              completionMessage.includes("could not")
                ? styles.feedbackError
                : styles.feedbackSuccess,
            ]}
          >
            <Text style={styles.feedbackText}>{completionMessage}</Text>
          </View>
        ) : null}
      </ScrollView>

      <Animated.View entering={FadeIn.duration(300)} style={styles.bottom}>
        <SecondaryButton label="Back to lessons" onPress={goBackToLessons} />
        <PrimaryButton
          label={lesson.isCompleted ? "Completed" : "Complete lesson"}
          onPress={handleCompleteLesson}
          disabled={submitting || lesson.isCompleted}
        />
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
  counter: { alignItems: "center", marginBottom: theme.s(2) },
  counterText: { color: theme.colors.muted, fontSize: 12, fontWeight: "700" },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.s(1.5),
  },
  stateText: {
    color: theme.colors.muted,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  center: { flex: 1 },
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
    alignItems: "flex-start",
  },
  block: { gap: 8, width: "100%" },
  label: {
    color: "rgba(148,163,184,0.65)",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  mn: { color: "white", fontSize: 30, fontWeight: "800" },
  translit: {
    color: "rgba(226,232,240,0.9)",
    fontSize: 16,
    fontWeight: "600",
  },
  metaRow: {
    flexDirection: "row",
    gap: theme.s(1),
    flexWrap: "wrap",
  },
  metaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(15,23,42,0.55)",
    borderWidth: 1,
    borderColor: "rgba(51,65,85,0.55)",
  },
  metaText: { color: "white", fontSize: 12, fontWeight: "800" },
  section: { marginTop: theme.s(3), gap: theme.s(1.5) },
  sectionTitle: { color: "white", fontSize: 17, fontWeight: "900" },
  contentCard: {
    borderRadius: theme.r.xl,
    borderWidth: 1,
    borderColor: "rgba(51,65,85,0.55)",
    backgroundColor: "rgba(15,23,42,0.65)",
    padding: theme.s(2),
    gap: 8,
  },
  contentLabel: {
    color: "rgba(148,163,184,0.7)",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  contentTitle: { color: "white", fontSize: 15, fontWeight: "800" },
  contentBody: {
    color: "rgba(226,232,240,0.9)",
    fontSize: 14,
    lineHeight: 21,
  },
  feedbackCard: {
    marginTop: theme.s(2),
    padding: theme.s(2),
    borderRadius: theme.r.xl,
    borderWidth: 1,
  },
  feedbackSuccess: {
    backgroundColor: "rgba(20,83,45,0.25)",
    borderColor: "rgba(34,197,94,0.35)",
  },
  feedbackError: {
    backgroundColor: "rgba(127,29,29,0.2)",
    borderColor: "rgba(248,113,113,0.28)",
  },
  feedbackText: {
    color: "white",
    fontSize: 13,
    fontWeight: "700",
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
