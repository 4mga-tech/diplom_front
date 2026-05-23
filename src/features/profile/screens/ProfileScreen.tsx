import {
  fetchProgressSummary,
  fetchXpWalletSummary,
} from "@/src/features/achievements/achievements.service";
import {
  fetchCurrentUserProfile,
  updateProfileName,
  uploadCurrentUserAvatar,
} from "@/src/features/profile/profile.service";
import {
  clearAuthSession,
  useAuthState,
} from "@/src/store/authStore";
import { AppTheme, useAppTheme, useThemedStyles } from "@/src/ui/theme";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { TextInput } from "react-native-gesture-handler";

type LearningStats = {
  streak: number;
  completedLessons: number;
  totalXp: number;
};

const DEFAULT_STATS: LearningStats = {
  streak: 0,
  completedLessons: 0,
  totalXp: 0,
};

function StatCard({
  value,
  label,
  styles,
  theme,
}: {
  value: string;
  label: string;
  styles: ReturnType<typeof createStyles>;
  theme: AppTheme;
}) {
  return (
    <LinearGradient colors={theme.colors.cardGradient} style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </LinearGradient>
  );
}

const MOCK_RANKING = [
  { rank: 1, name: "Mino", xp: 3820 },
  { rank: 2, name: "Jennie", xp: 2500 },
  { rank: 3, name: "Vinxen", xp: 2200 },
  { rank: 4, name: "Zico", xp: 1800 },
  { rank: 5, name: "Loopy", xp: 1600 },
  { rank: 6, name: "You", xp: 1500, isCurrentUser: true },
  { rank: 7, name: "Flowsik", xp: 800 },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const { user, isHydrated } = useAuthState();
  // useLayoutEffect(() => {
  //   navigation.setOptions({
  //     headerRight: () => (
  //       <Pressable
  //         onPress={() => router.push("/settings")}
  //         style={{ marginRight: 10 }}
  //       >
  //         <Ionicons
  //           name="settings-outline"
  //           size={20}
  //           color={theme.colors.text}
  //         />{" "}
  //       </Pressable>
  //     ),
  //   });
  // }, []);
  const [stats, setStats] = useState<LearningStats>(DEFAULT_STATS);

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
      return;
    }

    setName("");
  }, [user]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [xpWallet, progress] = await Promise.all([
          fetchXpWalletSummary(),
          fetchProgressSummary(),
        ]);

        setStats({
          streak: progress.streak,
          completedLessons: progress.completedLessons,
          totalXp: xpWallet.totalXp,
        });
      } catch (err) {
        console.log("Error loading profile stats:", err);
        setStats(DEFAULT_STATS);
      }
    };

    loadStats();
  }, []);

  const [isRefreshingProfile, setIsRefreshingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [isSavingName, setIsSavingName] = useState(false);

  const refreshProfile = useCallback(async () => {
    try {
      setIsRefreshingProfile(true);
      setAvatarError(null);
      setNameError(null);
      await fetchCurrentUserProfile();
    } catch (err) {
      console.log("Error refreshing profile:", err);
    } finally {
      setIsRefreshingProfile(false);
    }
  }, []);

  const pickImage = async () => {
    try {
      setAvatarError(null);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.9,
        allowsEditing: true,
      });

      if (result.canceled || !result.assets?.[0]) {
        return;
      }

      setIsUploadingAvatar(true);
      await uploadCurrentUserAvatar(result.assets[0]);
      await refreshProfile();
    } catch (err: any) {
      console.log("Error uploading avatar:", err);
      setAvatarError(
        err?.response?.data?.message ||
          err?.message ||
          "Could not update your profile image.",
      );
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      void refreshProfile();
    }, [refreshProfile]),
  );

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");

  const handleSaveName = async () => {
    try {
      setIsSavingName(true);
      setNameError(null);
      await updateProfileName(name);
      setIsEditing(false);
    } catch (err: any) {
      console.log("Error updating name:", err);
      setNameError(
        err?.response?.data?.message ||
          err?.message ||
          "Could not update your display name.",
      );
    } finally {
      setIsSavingName(false);
    }
  };

  const logout = async () => {
    try {
      await clearAuthSession();
      router.replace("/welcome");
    } catch (error) {
      console.log("Logout error:", error);
    }
  };

  const confirmLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          void logout();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroTopRow}>
          <View style={styles.heroBadge}>
            <Ionicons name="infinite-outline" size={14} color="#93C5FD" />
            {/* <Text style={styles.heroBadgeText}>Profile</Text> */}
          </View>

          <Pressable
            onPress={() => router.push("/settings")}
            style={styles.settingsIcon}
          >
            <Ionicons
              name="settings-outline"
              size={20}
              color={theme.colors.text}
            />
          </Pressable>
        </View>
        <LinearGradient
          colors={theme.colors.profileHeroGradient}
          style={styles.heroCard}
        >
          <View style={styles.heroBadge}>
            <Ionicons name="sparkles" size={14} color="#93C5FD" />
            <Text style={styles.heroBadgeText}>Profile</Text>
          </View>

          <View style={styles.avatarBlock}>
            <View style={styles.avatarWrap}>
              <LinearGradient
                colors={["#2563EB", "#7C3AED"]}
                style={styles.avatar}
              >
                {user?.avatarUrl ? (
                  <Image
                    source={{ uri: user.avatarUrl }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <Ionicons name="person" size={48} color="white" />
                )}
                {isUploadingAvatar ? (
                  <View style={styles.avatarLoadingOverlay}>
                    <ActivityIndicator color="white" size="small" />
                  </View>
                ) : null}
              </LinearGradient>

              <Pressable
                onPress={pickImage}
                disabled={isUploadingAvatar}
                style={styles.avatarPressable}
              >
                <View style={styles.cameraIcon}>
                  {isUploadingAvatar ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Ionicons name="camera" size={15} color="white" />
                  )}
                </View>
              </Pressable>
            </View>

            {avatarError ? (
              <Text style={styles.avatarErrorText}>{avatarError}</Text>
            ) : null}

            {/* <Text style={styles.profileEyebrow}>Mongol Hel Learner</Text> */}

            {isEditing ? (
              <View style={styles.editCard}>
                <Text style={styles.editLabel}>Display name</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  style={styles.nameInputInline}
                  autoFocus
                  onSubmitEditing={handleSaveName}
                  editable={!isSavingName}
                  placeholder="Enter your name"
                  placeholderTextColor="#64748B"
                />
                {nameError ? (
                  <Text style={styles.avatarErrorText}>{nameError}</Text>
                ) : null}
                <View style={styles.editActions}>
                  <Pressable
                    onPress={handleSaveName}
                    disabled={isSavingName}
                    style={styles.inlineBtn}
                  >
                    <Text style={styles.inlineBtnText}>
                      {isSavingName ? "Saving..." : "Save"}
                    </Text>
                  </Pressable>
                  <Pressable
                    disabled={isSavingName}
                    onPress={() => {
                      setName(user?.name || "");
                      setNameError(null);
                      setIsEditing(false);
                    }}
                    style={[styles.inlineBtn, styles.secondaryInlineBtn]}
                  >
                    <Text style={styles.inlineBtnText}>Cancel</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <View style={styles.nameDisplay}>
                <Text style={styles.nameText}>{user?.name || "No name"}</Text>
                <Text style={styles.profileSubtext}>
                  {user?.email || "No email"}
                </Text>
                {isRefreshingProfile && isHydrated ? (
                  <Text style={styles.refreshingText}>Refreshing profile...</Text>
                ) : null}
                <Pressable
                  onPress={() => setIsEditing(true)}
                  style={({ pressed }) => [
                    styles.inlineBtn,
                    pressed && styles.inlineBtnPressed,
                  ]}
                >
                  <Text style={styles.inlineBtnText}>Edit name</Text>
                </Pressable>
              </View>
            )}
          </View>
        </LinearGradient>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Learning Progress</Text>
          <Text style={styles.sectionSubtitle}>Your latest study momentum</Text>
          <View style={styles.statsRow}>
            <StatCard
              value={String(stats.streak)}
              label="Daily Streak"
              styles={styles}
              theme={theme}
            />
            <StatCard
              value={String(stats.completedLessons)}
              label="Lessons"
              styles={styles}
              theme={theme}
            />
            <StatCard
              value={String(stats.totalXp)}
              label="XP"
              styles={styles}
              theme={theme}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Ranking</Text>
          <Text style={styles.sectionSubtitle}>You are #6 this week</Text>
          <LinearGradient colors={theme.colors.cardGradient} style={styles.rankingCard}>
            <View style={styles.topThreeRow}>
              {[MOCK_RANKING[1], MOCK_RANKING[0], MOCK_RANKING[2]].map((entry) => {
                const isFirst = entry.rank === 1;
                return (
                  <View key={entry.rank} style={styles.topThreeItem}>
                    <View style={[styles.topAvatar, isFirst && styles.topAvatarFirst]}>
                      <Text style={styles.topAvatarRank}>#{entry.rank}</Text>
                    </View>
                    <Text style={styles.topName}>{entry.name}</Text>
                    <Text style={styles.topXp}>{entry.xp} XP</Text>
                  </View>
                );
              })}
            </View>
            <View style={styles.rankList}>
              {MOCK_RANKING.slice(3).map((entry) => (
                <View key={entry.rank} style={[styles.rankRow, entry.isCurrentUser && styles.rankRowCurrent]}>
                  <Text style={styles.rankNumber}>#{entry.rank}</Text>
                  <Text style={styles.rankName}>{entry.name}</Text>
                  <Text style={styles.rankXp}>{entry.xp} XP</Text>
                </View>
              ))}
            </View>
          </LinearGradient>
        </View>

        <Pressable
          onPress={confirmLogout}
          style={({ pressed }) => [
            styles.logoutBtn,
            pressed && styles.logoutBtnPressed,
          ]}
        >
          <Ionicons name="log-out-outline" size={18} color="#F87171" />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.bg,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: theme.s(3),
      paddingTop: theme.s(6),
      paddingBottom: theme.s(5),
    },
    heroCard: {
      borderRadius: 30,
      padding: theme.s(3),
      marginBottom: theme.s(3),
      borderWidth: 1,
      borderColor: "rgba(96,165,250,0.12)",
      shadowColor: "#000",
      shadowOpacity: 0.28,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 12 },
      elevation: 10,
    },
    heroBadge: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 999,
      backgroundColor: "rgba(59,130,246,0.12)",
      borderWidth: 1,
      borderColor: "rgba(147,197,253,0.2)",
      marginBottom: theme.s(2),
    },
    heroBadgeText: {
      color: theme.mode === "dark" ? "#BFDBFE" : "#1D4ED8",
      fontSize: 12,
      fontWeight: "700",
    },
    heroTopRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },

    settingsIcon: {
      width: 48,
      height: 48,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        theme.mode === "dark" ? "rgba(15,23,42,0.72)" : "#F8FAFC",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(148,163,184,0.12)"
          : "rgba(148,163,184,0.35)",
      shadowColor: "#000",
      shadowOpacity: theme.mode === "dark" ? 0 : 0.08,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: theme.mode === "dark" ? 0 : 3,
    },
    avatarBlock: {
      alignItems: "center",
    },
    avatarWrap: {
      position: "relative",
      marginBottom: theme.s(1.5),
    },
    avatar: {
      width: 112,
      height: 112,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOpacity: 0.38,
      shadowRadius: 22,
      elevation: 12,
    },
    avatarImage: {
      width: 112,
      height: 112,
      borderRadius: 999,
    },
    avatarLoadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(15,23,42,0.42)",
    },
    avatarPressable: {
      ...StyleSheet.absoluteFillObject,
      alignItems: "flex-end",
      justifyContent: "flex-end",
      padding: 4,
      borderRadius: 999,
    },
    cameraIcon: {
      position: "absolute",
      bottom: 4,
      right: 4,
      backgroundColor: "#2563EB",
      borderRadius: 999,
      padding: 8,
      borderWidth: 2,
      borderColor: "#0F172A",
    },
    profileEyebrow: {
      color: "#93C5FD",
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 1,
      textTransform: "uppercase",
      marginBottom: 10,
    },
    nameDisplay: {
      alignItems: "center",
    },
    nameText: {
      color: theme.colors.text,
      fontSize: 28,
      fontWeight: "800",
    },
    profileSubtext: {
      color: theme.colors.muted,
      fontSize: 14,
      textAlign: "center",
      marginTop: 8,
      marginBottom: 16,
      lineHeight: 20,
    },
    refreshingText: {
      color: "#93C5FD",
      fontSize: 12,
      fontWeight: "700",
      marginBottom: 12,
    },
    avatarErrorText: {
      color: "#FCA5A5",
      fontSize: 12,
      fontWeight: "600",
      textAlign: "center",
      marginBottom: 10,
    },
    editCard: {
      width: "100%",
      backgroundColor:
        theme.mode === "dark" ? "rgba(15,23,42,0.72)" : "#FFFFFF",
      borderRadius: 22,
      padding: 16,
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(148,163,184,0.12)"
          : "rgba(148,163,184,0.18)",
    },
    editLabel: {
      color: theme.colors.muted,
      fontSize: 12,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginBottom: 10,
    },
    nameInputInline: {
      color: theme.colors.text,
      fontSize: 20,
      fontWeight: "700",
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? "rgba(96,165,250,0.35)"
          : "rgba(148,163,184,0.35)",
      backgroundColor: theme.mode === "dark" ? "rgba(2,6,23,0.6)" : "#FFFFFF",
      borderRadius: 16,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    editActions: {
      flexDirection: "row",
      gap: 10,
      marginTop: 14,
    },
    inlineBtn: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 14,
      backgroundColor: "#2563EB",
      alignItems: "center",
      justifyContent: "center",
    },
    secondaryInlineBtn: {
      backgroundColor: "#334155",
    },
    inlineBtnPressed: {
      opacity: 0.88,
    },
    inlineBtnText: {
      color: "white",
      fontWeight: "700",
      fontSize: 14,
    },
    section: {
      marginBottom: theme.s(3),
    },
    sectionTitle: {
      color: theme.colors.text,
    },
    sectionSubtitle: {
      color: theme.colors.muted,
      marginBottom: theme.s(2),
    },
    statsRow: {
      flexDirection: "row",
      gap: theme.s(1.5),
    },
    statCard: {
      flex: 1,
      borderRadius: theme.r.xl,
      paddingVertical: theme.s(2),
      alignItems: "center",
      borderWidth: 1,
      borderColor: "rgba(51,65,85,0.65)",
      shadowColor: "#000",
      shadowOpacity: 0.18,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 10 },
      elevation: 6,
    },
    statValue: {
      color: theme.colors.text,
      fontSize: 20,
      fontWeight: "900",
    },
    statLabel: {
      color: theme.colors.muted,
      fontSize: 11,
      fontWeight: "800",
      marginTop: 4,
    },
    rankingCard: {
      borderRadius: theme.r.xl,
      padding: theme.s(2),
      borderWidth: 1,
      borderColor: "rgba(51,65,85,0.55)",
      shadowColor: "#000",
      shadowOpacity: 0.16,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 8 },
      elevation: 5,
    },
    topThreeRow: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "flex-end",
      marginBottom: 16,
    },
    topThreeItem: {
      alignItems: "center",
      flex: 1,
    },
    topAvatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: "rgba(59,130,246,0.2)",
      borderWidth: 1,
      borderColor: "rgba(96,165,250,0.45)",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 8,
    },
    topAvatarFirst: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: "rgba(99,102,241,0.34)",
      borderColor: "rgba(129,140,248,0.6)",
    },
    topAvatarRank: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: "800",
    },
    topName: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: "700",
    },
    topXp: {
      color: theme.colors.muted,
      fontSize: 12,
      marginTop: 2,
    },
    rankList: {
      gap: 10,
    },
    rankRow: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 14,
      backgroundColor: "rgba(15,23,42,0.6)",
      borderWidth: 1,
      borderColor: "rgba(148,163,184,0.12)",
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    rankRowCurrent: {
      backgroundColor: "rgba(79,70,229,0.24)",
      borderColor: "rgba(129,140,248,0.5)",
    },
    rankNumber: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: "700",
      width: 36,
    },
    rankName: {
      color: theme.colors.text,
      fontSize: 15,
      fontWeight: "700",
      flex: 1,
    },
    rankXp: {
      color: theme.colors.muted,
      fontSize: 13,
      fontWeight: "600",
    },
    logoutBtn: {
      width: "100%",
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
    logoutBtnPressed: {
      opacity: 0.88,
    },
    logoutText: {
      color: "#F87171",
      fontWeight: "900",
      fontSize: 15,
    },
  });
