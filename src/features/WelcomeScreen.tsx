import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "../ui/theme";
const FEATURES = ["cyrillic", "speak", "culture"];

export default function WelcomeScreen() {
  // useEffect(() => {
  //   const checkStatus = async () => {
  //     const token = await AsyncStorage.getItem("token");
  //     const fromLogout = await AsyncStorage.getItem("fromLogout");

  //     if (fromLogout) {
  //       await AsyncStorage.removeItem("fromLogout");
  //       return;
  //     }

  //     if (token) {
  //       if (token) {
  //         // router.replace("/courses");
  //         router.replace("/");
  //       }
  //     }
  //   };

  //   checkStatus();
  // }, []);
  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <View style={styles.iconWrap}>
          <LinearGradient
            colors={[theme.colors.blue, "#7C3AED"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.glow}
          />
          <LinearGradient
            colors={[theme.colors.blue, "#7C3AED"]}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.8, y: 1 }}
            style={styles.iconCard}
          >
            <Ionicons name="globe-outline" size={52} color="white" />
          </LinearGradient>
        </View>

        <View style={styles.titleRow}>
          <Text style={styles.title}>MonLanguage</Text>
          <Ionicons name="sparkles" size={22} color={theme.colors.purple} />
        </View>

        <Text style={styles.subtitle}>
          Learn Mongolian with interactive lessons for international students
        </Text>

        <View style={styles.chips}>
          {FEATURES.map((f) => (
            <View key={f} style={styles.chip}>
              <Text style={styles.chipText}>{f}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.bottom}>
        <Pressable
          onPress={() => router.push("/auth/register")}
          style={({ pressed }) => [
            styles.primaryBtn,
            pressed && { opacity: 0.9 },
          ]}
        >
          <LinearGradient
            colors={[theme.colors.blue, "#7C3AED"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.primaryGradient}
          >
            <Text style={styles.primaryText}>Sign up</Text>
          </LinearGradient>
        </Pressable>

        <Pressable
          onPress={() => router.push("/auth/login")}
          style={({ pressed }) => [
            styles.linkBtn,
            pressed && { opacity: 0.75 },
          ]}
        >
          <Text style={styles.linkText}>Login</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    paddingHorizontal: theme.s(3),
    paddingVertical: theme.s(6),
    justifyContent: "space-between",
  },
  top: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.s(3),
  },

  iconWrap: {
    width: 140,
    height: 140,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginBottom: theme.s(1),
  },
  glow: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 999,
    opacity: 0.3,
    shadowColor: "#7C3AED",
    shadowOpacity: 0.7,
    shadowRadius: 24,
    elevation: 14,
  },
  iconCard: {
    borderRadius: theme.r.xl,
    padding: theme.s(3),
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 10,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(1),
  },
  title: {
    color: theme.colors.text,
    fontSize: 36,
    fontWeight: "800",
  },
  subtitle: {
    color: theme.colors.muted,
    fontSize: 16,
    lineHeight: 22,
    textAlign: "center",
    maxWidth: 320,
  },

  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: theme.s(1.5),
    marginTop: theme.s(1),
  },
  chip: {
    paddingHorizontal: theme.s(2),
    paddingVertical: theme.s(1),
    borderRadius: theme.r.pill,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chipText: {
    color: theme.colors.chipText,
    fontSize: 13,
    fontWeight: "600",
  },

  bottom: {
    width: "100%",
    gap: theme.s(2),
    paddingBottom: theme.s(2),
  },
  primaryBtn: {
    width: "100%",
    borderRadius: theme.r.xl,
    overflow: "hidden",
  },
  primaryGradient: {
    paddingVertical: theme.s(2),
    alignItems: "center",
    borderRadius: theme.r.xl,
  },
  primaryText: {
    color: "white",
    fontSize: 16,
    fontWeight: "800",
  },
  linkBtn: {
    alignItems: "center",
    paddingVertical: theme.s(1),
  },
  linkText: {
    color: theme.colors.muted,
    fontSize: 15,
    fontWeight: "600",
  },
});
