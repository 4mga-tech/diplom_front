import { normalizeTestLevelId } from "@/src/features/test/constants/testLevels";
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
  tone: string;
};

export default function TestTypeSelectScreen() {
  const { theme } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const router = useRouter();
  const { levelId } = useLocalSearchParams<{ levelId?: string }>();

  const safeLevel = normalizeTestLevelId(levelId) ?? "M1";

  const testTypes: TestTypeItem[] = [
    {
      id: "vocabulary",
      title: "Vocabulary Test",
      subtitle: "Check meaning, translation, and usage in context.",
      icon: "library-outline",
      tone: "#1D4ED8",
    },
    {
      id: "grammar",
      title: "Grammar Test",
      subtitle: "Practice sentence patterns, structure, and accuracy.",
      icon: "document-text-outline",
      tone: "#0F766E",
    },
    {
      id: "listening",
      title: "Listening Test",
      subtitle: "Work through listening prompts and response matching.",
      icon: "headset-outline",
      tone: "#B45309",
    },
    {
      id: "speaking",
      title: "Speaking Test",
      subtitle: "Focus on pronunciation and spoken response practice.",
      icon: "mic-outline",
      tone: "#BE123C",
    },
    {
      id: "letter",
      title: "Letter Test",
      subtitle: "Review letters, recognition, and script patterns.",
      icon: "text-outline",
      tone: "#6D28D9",
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
            <Text style={styles.topBarTitle}>Practice Tests</Text>
            <Text style={styles.topBarSub}>{safeLevel} level</Text>
          </View>

          <View style={styles.iconBtnPlaceholder} />
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <Ionicons name="shield-checkmark-outline" size={14} color="#F59E0B" />
            <Text style={styles.heroBadgeText}>Assessment</Text>
          </View>

          <Text style={styles.heroTitle}>Choose a test</Text>
          <Text style={styles.heroDesc}>
            Practice your skills by choosing a test type for this level.
            Vocabulary, grammar, listening, and more are available here.
          </Text>
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Available tests</Text>
          <Text style={styles.sectionCaption}>{testTypes.length} test types</Text>
        </View>

        {testTypes.map((item) => (
          <Pressable
            key={item.id}
            style={({ pressed }) => [styles.cardWrap, pressed && styles.cardPressed]}
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
              <View style={[styles.iconWrap, { backgroundColor: `${item.tone}18` }]}>
                <Ionicons name={item.icon} size={20} color={item.tone} />
              </View>

              <View style={styles.cardBody}>
                <Text style={styles.cardEyebrow}>Skill test</Text>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
              </View>

              <Ionicons name="arrow-forward" size={18} color={theme.colors.muted} />
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
    cardWrap: {
      marginBottom: 12,
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
  });
