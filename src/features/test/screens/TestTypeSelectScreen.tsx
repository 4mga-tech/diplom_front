import { AppTheme, useAppTheme, useThemedStyles } from "@/src/ui/theme";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type TestTypeItem = {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  colors: [string, string];
};

export default function TestTypeSelectScreen() {
  const { theme } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const router = useRouter();
  const { levelId } = useLocalSearchParams<{ levelId?: string }>();

  const safeLevel = levelId ?? "M1";

  const testTypes: TestTypeItem[] = [
    {
      id: "vocabulary",
      title: "Vocabulary",
      subtitle: "Word meaning, translation, and usage.",
      icon: "library-outline",
      colors: ["#6366F1", "#7C3AED"],
    },
    {
      id: "grammar",
      title: "Grammar",
      subtitle: "Sentence rules and structure practice.",
      icon: "document-text-outline",
      colors: ["#0EA5E9", "#2563EB"],
    },
    {
      id: "listening",
      title: "Listening",
      subtitle: "Listen and choose the correct answer.",
      icon: "headset-outline",
      colors: ["#14B8A6", "#0F766E"],
    },
    {
      id: "speaking",
      title: "Speaking",
      subtitle: "Pronunciation and speaking exercises.",
      icon: "mic-outline",
      colors: ["#F59E0B", "#EA580C"],
    },
    {
      id: "letter",
      title: "Letter",
      subtitle: "Letters, alphabet groups, and recognition.",
      icon: "text-outline",
      colors: ["#EC4899", "#BE185D"],
    },
  ];

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
            <Text style={styles.topBarTitle}>Choose Test Type</Text>
            <Text style={styles.topBarSub}>{safeLevel} level</Text>
          </View>

          <View style={styles.iconBtnPlaceholder} />
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>{safeLevel}</Text>
          </View>

          <Text style={styles.heroTitle}>Select how you want to practice</Text>
          <Text style={styles.heroDesc}>
            Each test type focuses on a different skill. Start with the one you
            want to improve most.
          </Text>
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Available tests</Text>
          <Text style={styles.sectionCaption}>{testTypes.length} modes</Text>
        </View>

        {testTypes.map((item) => (
          <Pressable
            key={item.id}
            style={({ pressed }) => [
              styles.cardWrap,
              pressed && styles.cardPressed,
            ]}
            onPress={() =>
              router.push({
                pathname: "/test/session/[levelId]" as any,
                params: {
                  levelId: safeLevel,
                  testType: item.id,
                },
              })
            }
          >
            <View style={styles.card}>
              <View
                style={[styles.iconWrap, { backgroundColor: item.colors[0] }]}
              >
                <Ionicons name={item.icon} size={20} color="#fff" />
              </View>

              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
              </View>

              <Ionicons
                name="arrow-forward"
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
      borderRadius: 24,
      padding: 18,
      marginBottom: 20,
      backgroundColor:
        theme.mode === "dark" ? "rgba(255,255,255,0.05)" : "#FFFFFF",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(255,255,255,0.08)"
          : "rgba(148,163,184,0.16)",
      shadowColor: "#000",
      shadowOpacity: theme.mode === "dark" ? 0.14 : 0.06,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 3,
    },

    heroBadge: {
      alignSelf: "flex-start",
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor:
        theme.mode === "dark"
          ? "rgba(139,92,246,0.12)"
          : "rgba(139,92,246,0.10)",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(139,92,246,0.20)"
          : "rgba(139,92,246,0.16)",
      marginBottom: 12,
    },

    heroBadgeText: {
      color: theme.mode === "dark" ? "#C4B5FD" : "#7C3AED",
      fontSize: 11,
      fontWeight: "800",
    },

    heroTitle: {
      color: theme.colors.text,
      fontSize: 24,
      fontWeight: "900",
      letterSpacing: 0.2,
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

    cardWrap: {
      marginBottom: 12,
    },

    cardPressed: {
      transform: [{ scale: 0.985 }],
      opacity: 0.96,
    },

    card: {
      minHeight: 86,
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
      shadowColor: "#000",
      shadowOpacity: theme.mode === "dark" ? 0.12 : 0.04,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
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
      marginTop: 4,
      fontWeight: "500",
    },
  });
