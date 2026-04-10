import { api } from "@/lib/api";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { theme } from "../ui/theme";

type StoredUser = {
  name?: string;
  email?: string;
};

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

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <LinearGradient
      colors={["rgba(30,41,59,0.95)", "rgba(15,23,42,0.92)"]}
      style={styles.statCard}
    >
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </LinearGradient>
  );
}

function InfoRow({
  icon,
  iconColor,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  label: string;
  value: string;
}) {
  return (
    <LinearGradient
      colors={["rgba(30,41,59,0.9)", "rgba(15,23,42,0.88)"]}
      style={styles.infoCard}
    >
      <View style={styles.infoRow}>
        <View style={styles.infoIconWrap}>
          <Ionicons name={icon} size={18} color={iconColor} />
        </View>
        <View style={styles.infoTextWrap}>
          <Text style={styles.infoLabel}>{label}</Text>
          <Text style={styles.infoValue}>{value}</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

export default function ProfileScreen() {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [stats, setStats] = useState<LearningStats>(DEFAULT_STATS);

  useEffect(() => {
    const loadUser = async () => {
      const stored = await AsyncStorage.getItem("user");
      if (stored) {
        setUser(JSON.parse(stored) as StoredUser);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await api.get("/me/progress/summary");
        const payload = res.data as any;
        const data = payload?.data ?? payload;

        setStats({
          streak: Number(data?.streak ?? 0),
          completedLessons: Number(data?.completedLessons ?? 0),
          totalXp: Number(data?.totalXp ?? 0),
        });
      } catch (err) {
        console.log("Error loading profile stats:", err);
        setStats(DEFAULT_STATS);
      }
    };

    loadStats();
  }, []);

  const router = useRouter();
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      quality: 1,
      allowsEditing: true,
    });

    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
      await AsyncStorage.setItem("avatarUri", result.assets[0].uri);
    }
  };

  useEffect(() => {
    const loadAvatar = async () => {
      const savedUri = await AsyncStorage.getItem("avatarUri");
      if (savedUri) setAvatarUri(savedUri);
    };
    loadAvatar();
  }, []);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");

  const handleSaveName = async () => {
    try {
      const res = await api.patch("/user/profile", { name });
      const updatedUser = res.data as StoredUser;

      setUser(updatedUser);
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      setIsEditing(false);
    } catch (err) {
      console.log("Error updating name:", err);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("registered");
      await AsyncStorage.removeItem("onboardingDone");
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");

      await AsyncStorage.setItem("fromLogout", "true");

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
        <LinearGradient
          colors={["#172554", "#111827", "#020617"]}
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
                {avatarUri ? (
                  <Image
                    source={{ uri: avatarUri }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <Ionicons name="person" size={48} color="white" />
                )}
              </LinearGradient>

              <Pressable onPress={pickImage} style={styles.avatarPressable}>
                <View style={styles.cameraIcon}>
                  <Ionicons name="camera" size={15} color="white" />
                </View>
              </Pressable>
            </View>

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
                  placeholder="Enter your name"
                  placeholderTextColor="#64748B"
                />
                <View style={styles.editActions}>
                  <Pressable onPress={handleSaveName} style={styles.inlineBtn}>
                    <Text style={styles.inlineBtnText}>Save</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      setName(user?.name || "");
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
                  Keep your photo and display name updated for a polished
                  profile.
                </Text>
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
            <StatCard value={String(stats.streak)} label="Daily Streak" />
            <StatCard value={String(stats.completedLessons)} label="Lessons" />
            <StatCard value={String(stats.totalXp)} label="XP" />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <Text style={styles.sectionSubtitle}>Your saved profile details</Text>
          <View style={styles.infoList}>
            <InfoRow
              icon="mail"
              iconColor="#60A5FA"
              label="E-mail"
              value={user?.email || "-"}
            />

            <LinearGradient
              colors={["rgba(30,41,59,0.9)", "rgba(15,23,42,0.88)"]}
              style={styles.achievementsCard}
            >
              <View style={styles.achievementsHeader}>
                <View>
                  <Text style={styles.achievementsTitle}>Achievements</Text>
                  <Text style={styles.achievementsSubtitle}>
                    Small milestones from your journey
                  </Text>
                </View>
                <View style={styles.achievementsHeaderIcon}>
                  <Ionicons name="ribbon-outline" size={18} color="#FBBF24" />
                </View>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.badgesRow}>
                  <View style={styles.badgeCard}>
                    <View
                      style={[
                        styles.badgeIconWrap,
                        { backgroundColor: "rgba(250,204,21,0.18)" },
                      ]}
                    >
                      <Ionicons
                        name="trophy-outline"
                        size={22}
                        color="#FACC15"
                      />
                    </View>
                    <Text style={styles.badgeTitle}>Champion</Text>
                    <Text style={styles.badgeCaption}>Top effort</Text>
                  </View>

                  <View style={styles.badgeCard}>
                    <View
                      style={[
                        styles.badgeIconWrap,
                        { backgroundColor: "rgba(96,165,250,0.18)" },
                      ]}
                    >
                      <Ionicons
                        name="flash-outline"
                        size={22}
                        color="#60A5FA"
                      />
                    </View>
                    <Text style={styles.badgeTitle}>Focused</Text>
                    <Text style={styles.badgeCaption}>XP builder</Text>
                  </View>

                  <View style={styles.badgeCard}>
                    <View
                      style={[
                        styles.badgeIconWrap,
                        { backgroundColor: "rgba(167,139,250,0.18)" },
                      ]}
                    >
                      <Ionicons name="bulb-outline" size={22} color="#A78BFA" />
                    </View>
                    <Text style={styles.badgeTitle}>Curious</Text>
                    <Text style={styles.badgeCaption}>Keeps learning</Text>
                  </View>
                </View>
              </ScrollView>
            </LinearGradient>
          </View>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
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
    color: "#BFDBFE",
    fontSize: 12,
    fontWeight: "700",
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
    color: "#F8FAFC",
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
  },
  profileSubtext: {
    color: "#94A3B8",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 16,
    lineHeight: 20,
  },
  editCard: {
    width: "100%",
    backgroundColor: "rgba(15,23,42,0.72)",
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.12)",
  },
  editLabel: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  nameInputInline: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    borderWidth: 1,
    borderColor: "rgba(96,165,250,0.35)",
    backgroundColor: "rgba(2,6,23,0.6)",
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
    color: "#F8FAFC",
    fontSize: 18,
    fontWeight: "800",
  },
  sectionSubtitle: {
    color: "#94A3B8",
    fontSize: 13,
    marginTop: 4,
    marginBottom: theme.s(1.5),
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
    color: "white",
    fontSize: 20,
    fontWeight: "900",
  },
  statLabel: {
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: "800",
    marginTop: 4,
  },
  infoList: {
    gap: theme.s(1.5),
  },
  infoCard: {
    borderRadius: theme.r.xl,
    borderWidth: 1,
    borderColor: "rgba(51,65,85,0.55)",
    padding: theme.s(2),
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(1.5),
  },
  infoIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "rgba(51,65,85,0.35)",
    borderWidth: 1,
    borderColor: "rgba(51,65,85,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  infoTextWrap: {
    flex: 1,
  },
  infoLabel: {
    color: "rgba(148,163,184,0.7)",
    fontSize: 11,
    fontWeight: "800",
  },
  infoValue: {
    color: "white",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 2,
  },
  achievementsCard: {
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
  achievementsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  achievementsTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  achievementsSubtitle: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 4,
  },
  achievementsHeaderIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(250,204,21,0.12)",
  },
  badgesRow: {
    flexDirection: "row",
    gap: 12,
  },
  badgeCard: {
    width: 124,
    borderRadius: 18,
    backgroundColor: "rgba(15,23,42,0.82)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.12)",
    padding: 14,
  },
  badgeIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  badgeTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  badgeCaption: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 4,
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
