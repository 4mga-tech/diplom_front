import { normalizeTestLevelId } from "@/src/features/test/constants/testLevels";
import { testService } from "@/src/features/test/services/test.service";
import {
  TestType,
  TestTypeAvailability,
} from "@/src/features/test/types/test.types";
import { AppTheme, useAppTheme, useThemedStyles } from "@/src/ui/theme";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type TestTypeItem = {
  id: TestType;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone: string;
  availability: "available" | "coming_soon";
  availabilityLabel: string;
  questionCount: number;
};

export default function TestTypeSelectScreen() {
  const { theme } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const router = useRouter();
  const { levelId } = useLocalSearchParams<{ levelId?: string }>();

  const safeLevel = normalizeTestLevelId(levelId) ?? "M1";
  const [testTypes, setTestTypes] = useState<TestTypeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const toneByType: Record<TestType, string> = {
      vocabulary: "#1D4ED8",
      grammar: "#0F766E",
      listening: "#B45309",
      speaking: "#BE123C",
    };

    const iconByType: Record<TestType, keyof typeof Ionicons.glyphMap> = {
      vocabulary: "library-outline",
      grammar: "document-text-outline",
      listening: "headset-outline",
      speaking: "mic-outline",
    };

    function buildSubtitle(type: TestTypeAvailability) {
      if (type.testType === "vocabulary") {
        return "Meaning, translation, and usage across the full level.";
      }

      if (type.testType === "grammar") {
        return "Structure, patterns, and sentence control for this level.";
      }

      if (type.testType === "listening") {
        return "Audio-based listening checks will arrive in a later release.";
      }

      return "Recorded speaking prompts and scoring are planned for later.";
    }

    async function loadTypes() {
      try {
        setLoading(true);
        setError(null);
        const response = await testService.getTypes(safeLevel);

        if (!mounted) {
          return;
        }

        setTestTypes(
          response.types.map((type) => ({
            id: type.testType,
            title: type.title,
            subtitle: buildSubtitle(type),
            icon: iconByType[type.testType],
            tone: toneByType[type.testType],
            availability: type.status,
            availabilityLabel:
              type.status === "available" ? "Available now" : "Coming soon",
            questionCount: type.questionCount,
          })),
        );
      } catch (loadError) {
        console.log("Test types load failed:", loadError);

        if (!mounted) {
          return;
        }

        setError("We could not load exam tracks for this level right now.");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadTypes();

    return () => {
      mounted = false;
    };
  }, [safeLevel]);

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.topBar}>
          <Pressable style={styles.iconBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color={theme.colors.text} />
          </Pressable>

          <View style={styles.topBarCenter}>
            <Text style={styles.topBarTitle}>Level Assessment</Text>
            <Text style={styles.topBarSub}>{safeLevel} exam center</Text>
          </View>

          <View style={styles.iconBtnPlaceholder} />
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <Ionicons name="shield-checkmark-outline" size={14} color="#F59E0B" />
            <Text style={styles.heroBadgeText}>Assessment</Text>
          </View>

          <Text style={styles.heroTitle}>Choose a {safeLevel} exam</Text>
          <Text style={styles.heroDesc}>
            Each level includes backend-backed vocabulary and grammar exams.
            Listening and speaking remain visible here as upcoming tracks.
          </Text>
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Assessment tracks</Text>
          <Text style={styles.sectionCaption}>
            {loading
              ? "Loading..."
              : `${testTypes.filter((item) => item.availability === "available").length} live`}
          </Text>
        </View>

        {loading ? (
          <View style={styles.inlineState}>
            <ActivityIndicator color={theme.colors.text} />
            <Text style={styles.inlineStateText}>Loading exam tracks</Text>
          </View>
        ) : null}

        {error ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle-outline" size={16} color="#FCA5A5" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {testTypes.map((item) => (
          <Pressable
            key={item.id}
            disabled={item.availability !== "available"}
            style={({ pressed }) => [
              styles.cardWrap,
              item.availability !== "available" && styles.cardWrapDisabled,
              pressed && item.availability === "available" && styles.cardPressed,
            ]}
            onPress={() => {
              if (item.availability !== "available") {
                return;
              }

              router.push({
                pathname: "/test/session/[levelId]" as any,
                params: {
                  levelId: safeLevel,
                  testType: item.id,
                },
              });
            }}
          >
            <View
              style={[
                styles.card,
                item.availability !== "available" && styles.cardDisabled,
              ]}
            >
              <View style={[styles.iconWrap, { backgroundColor: `${item.tone}18` }]}>
                <Ionicons name={item.icon} size={20} color={item.tone} />
              </View>

              <View style={styles.cardBody}>
                <Text style={styles.cardEyebrow}>
                  {item.availabilityLabel}
                </Text>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                <Text style={styles.cardMeta}>
                  {item.availability === "available"
                    ? `${item.questionCount} questions`
                    : "Not released yet"}
                </Text>
              </View>

              <Ionicons
                name={
                  item.availability === "available"
                    ? "arrow-forward"
                    : "time-outline"
                }
                size={18}
                color={theme.colors.muted}
              />
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.bg,
    },
    content: {
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 28,
    },
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    iconBtn: {
      width: 42,
      height: 42,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        theme.mode === "dark" ? "rgba(255,255,255,0.06)" : "#FFFFFF",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(255,255,255,0.08)"
          : "rgba(148,163,184,0.16)",
    },
    iconBtnPlaceholder: {
      width: 42,
      height: 42,
    },
    topBarCenter: {
      alignItems: "center",
    },
    topBarTitle: {
      color: theme.colors.text,
      fontSize: 18,
      fontWeight: "800",
    },
    topBarSub: {
      color: theme.colors.muted,
      fontSize: 11,
      fontWeight: "600",
      marginTop: 2,
    },
    heroCard: {
      borderRadius: 22,
      padding: 18,
      marginBottom: 20,
      backgroundColor:
        theme.mode === "dark" ? "rgba(255,255,255,0.05)" : "#FFFFFF",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(245,158,11,0.16)"
          : "rgba(245,158,11,0.16)",
    },
    heroBadge: {
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor:
        theme.mode === "dark" ? "rgba(245,158,11,0.12)" : "rgba(245,158,11,0.1)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(245,158,11,0.2)"
          : "rgba(245,158,11,0.16)",
      marginBottom: 12,
    },
    heroBadgeText: {
      color: theme.mode === "dark" ? "#FCD34D" : "#B45309",
      fontSize: 11,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    heroTitle: {
      color: theme.colors.text,
      fontSize: 24,
      fontWeight: "900",
    },
    heroDesc: {
      color: theme.colors.muted,
      fontSize: 13,
      lineHeight: 19,
      marginTop: 8,
      fontWeight: "500",
    },
    sectionRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
      paddingHorizontal: 2,
    },
    sectionTitle: {
      color: theme.colors.text,
      fontSize: 17,
      fontWeight: "800",
    },
    sectionCaption: {
      color: theme.colors.muted,
      fontSize: 11,
      fontWeight: "700",
    },
    inlineState: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 18,
    },
    inlineStateText: {
      color: theme.colors.muted,
      fontSize: 12,
      fontWeight: "700",
    },
    errorBanner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 14,
      backgroundColor:
        theme.mode === "dark" ? "rgba(127,29,29,0.28)" : "rgba(254,226,226,1)",
      borderWidth: 1,
      borderColor: "rgba(248,113,113,0.24)",
    },
    errorText: {
      flex: 1,
      color: theme.mode === "dark" ? "#FECACA" : "#991B1B",
      fontSize: 12,
      fontWeight: "600",
    },
    cardWrap: {
      marginBottom: 12,
    },
    cardWrapDisabled: {
      opacity: 0.82,
    },
    cardPressed: {
      transform: [{ scale: 0.988 }],
      opacity: 0.96,
    },
    card: {
      minHeight: 94,
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 14,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        theme.mode === "dark" ? "rgba(255,255,255,0.04)" : "#FFFFFF",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(255,255,255,0.08)"
          : "rgba(148,163,184,0.14)",
    },
    cardDisabled: {
      backgroundColor:
        theme.mode === "dark" ? "rgba(255,255,255,0.025)" : "#F8FAFC",
    },
    iconWrap: {
      width: 48,
      height: 48,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    cardBody: {
      flex: 1,
      paddingRight: 10,
      gap: 3,
    },
    cardEyebrow: {
      color: "#F59E0B",
      fontSize: 10,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.45,
    },
    cardTitle: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: "800",
    },
    cardSubtitle: {
      color: theme.colors.muted,
      fontSize: 12,
      lineHeight: 17,
      fontWeight: "500",
    },
    cardMeta: {
      color: theme.colors.muted,
      fontSize: 11,
      fontWeight: "700",
      marginTop: 4,
    },
  });
