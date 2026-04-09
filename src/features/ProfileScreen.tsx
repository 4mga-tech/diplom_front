import { api } from "@/lib/api";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { theme } from "../ui/theme";
function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <LinearGradient
      colors={["rgba(30,41,59,0.85)", "rgba(15,23,42,0.85)"]}
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
      colors={["rgba(30,41,59,0.85)", "rgba(15,23,42,0.85)"]}
      style={styles.infoCard}
    >
      <View style={styles.infoRow}>
        <View style={styles.infoIconWrap}>
          <Ionicons name={icon} size={18} color={iconColor} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.infoLabel}>{label}</Text>
          <Text style={styles.infoValue}>{value}</Text>
        </View>
      </View>
    </LinearGradient>
  );
}
export default function ProfileScreen() {
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(
    null,
  );
  useEffect(() => {
    // console.log("USER:", user);
    const loadUser = async () => {
      const stored = await AsyncStorage.getItem("user");
      if (stored) {
        setUser(JSON.parse(stored));
      }
    };
    loadUser();
  }, []);
  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user]);
  const streak = "7";
  const lessons = "21";
  const xp = "420";
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
      const updatedUser = res.data;

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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ width: 44, height: 44 }} />
      </View>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.avatarBlock}>
          <View style={styles.avatarWrap}>
            <LinearGradient
              colors={["#2563EB", "#7C3AED"]}
              style={styles.avatar}
            >
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="person" size={44} color="white" />
              )}
            </LinearGradient>

            {/* Avatar дээр дарж зураг солих */}
            <Pressable onPress={pickImage} style={styles.avatarPressable}>
              <View style={styles.cameraIcon}>
                <Ionicons name="camera" size={14} color="white" />
              </View>
            </Pressable>
          </View>

          <View style={styles.nameRow}>
            {isEditing ? (
              <>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  style={styles.nameInputInline}
                  autoFocus
                  onSubmitEditing={handleSaveName}
                />
                <Pressable onPress={handleSaveName} style={styles.inlineBtn}>
                  <Text style={styles.inlineBtnText}>Save</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setName(user?.name || "");
                    setIsEditing(false);
                  }}
                  style={[styles.inlineBtn, { backgroundColor: "#6B7280" }]}
                >
                  <Text style={styles.inlineBtnText}>Cancel</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={styles.nameText}>{user?.name || "No name"}</Text>
                <Pressable
                  onPress={() => setIsEditing(true)}
                  style={styles.inlineBtn}
                >
                  <Text style={styles.inlineBtnText}>Edit Profile</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>

        <View style={styles.statsRow}>
          <StatCard value={streak} label="Daily Streak" />
          <StatCard value={lessons} label="lesson" />
          <StatCard value={xp} label="XP" />
        </View>

        <View style={styles.infoList}>
          <InfoRow
            icon="mail"
            iconColor="#60A5FA"
            label="e-mail"
            value={user?.email || "-"}
          />
          <View style={{ marginTop: 20 }}>
            <Text
              style={{ color: "#94A3B8", marginBottom: 8, fontWeight: "700" }}
            >
              Achievements
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {["🏆", "🎯", "💡"].map((badge, i) => (
                <View key={i} style={styles.badgeCard}>
                  <Text style={{ fontSize: 24 }}>{badge}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>

        <Pressable
          onPress={logout}
          style={({ pressed }) => [
            styles.logoutBtn,
            pressed && { opacity: 0.9 },
          ]}
        >
          <Ionicons name="log-out-outline" size={18} color="#F87171" />
          <Text style={styles.logoutText}>logout</Text>
        </Pressable>
      </ScrollView>
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
    justifyContent: "space-between",
    marginBottom: theme.s(3),
  },
  // backBtn: {
  //   width: 44,
  //   height: 44,
  //   borderRadius: 14,
  //   alignItems: "center",
  //   justifyContent: "center",
  //   backgroundColor: "rgba(30,41,59,0.35)",
  //   borderWidth: 1,
  //   borderColor: "rgba(51,65,85,0.55)",
  // },
  headerTitle: { color: "white", fontSize: 18, fontWeight: "800" },

  avatarBlock: { alignItems: "center", marginBottom: theme.s(3) },
  avatarWrap: { position: "relative", marginBottom: theme.s(1.5) },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 10,
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 999,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    width: "100%",
    gap: 8,
  },

  nameText: {
    color: "white",
    fontSize: 22,
    fontWeight: "700",
    flex: 1,
  },
  nameInputInline: {
    color: "white",
    fontSize: 22,
    fontWeight: "700",
    borderBottomWidth: 1,
    borderBottomColor: "#2563EB",
    flex: 1,
  },
  inlineBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },
  inlineBtnText: {
    color: "white",
    fontWeight: "700",
    fontSize: 14,
  },
  editProfileText: {
    color: "#2563EB",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 12,
  },
  avatarPressable: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "flex-end",
    justifyContent: "flex-end",
    padding: 4,
    borderRadius: 999,
  },

  editNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
  },

  editNameBtn: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#2563EB",
    borderRadius: 8,
  },

  name: { color: "white", fontSize: 22, fontWeight: "800" },
  role: {
    color: theme.colors.muted,
    marginTop: 4,
    fontSize: 13,
    fontWeight: "700",
  },

  statsRow: {
    flexDirection: "row",
    gap: theme.s(1.5),
    marginBottom: theme.s(3),
  },
  statCard: {
    flex: 1,
    borderRadius: theme.r.xl,
    paddingVertical: theme.s(2),
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(51,65,85,0.55)",
  },
  statValue: { color: "white", fontSize: 20, fontWeight: "900" },
  statLabel: {
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: "800",
    marginTop: 4,
  },
  nameInput: {
    flex: 1,
    color: "white",
    fontSize: 22,
    fontWeight: "800",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.3)",
    textAlign: "center",
    paddingVertical: 4,
  },
  badgeCard: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: "rgba(30,41,59,0.85)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoList: { gap: theme.s(1.5), marginBottom: theme.s(2) },
  infoCard: {
    borderRadius: theme.r.xl,
    borderWidth: 1,
    borderColor: "rgba(51,65,85,0.55)",
    padding: theme.s(2),
  },
  infoRow: { flexDirection: "row", alignItems: "center", gap: theme.s(1.5) },
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
  infoLabel: {
    color: "rgba(148,163,184,0.7)",
    fontSize: 11,
    fontWeight: "800",
  },

  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },

  saveText: { color: "white", fontWeight: "700" },
  infoValue: { color: "white", fontSize: 15, fontWeight: "700", marginTop: 2 },
  cameraIcon: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "#2563EB",
    borderRadius: 999,
    padding: 6,
    borderWidth: 2,
    borderColor: "#0F172A",
  },
  logoutBtn: {
    marginTop: "auto",
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
  logoutText: { color: "#F87171", fontWeight: "900", fontSize: 15 },
});
