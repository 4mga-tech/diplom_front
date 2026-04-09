import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    withSpring,
} from "react-native-reanimated";
import { theme } from "../ui/theme";

function Card({ children }: { children: React.ReactNode }) {
  return (
    <LinearGradient
      colors={["rgba(30,41,59,0.85)", "rgba(15,23,42,0.85)"]}
      style={styles.card}
    >
      {children}
    </LinearGradient>
  );
}

function ToggleSwitch({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: () => void;
}) {
  const knobStyle = useAnimatedStyle(
    () => ({
      transform: [
        {
          translateX: withSpring(enabled ? 20 : 0, {
            stiffness: 520,
            damping: 30,
          }),
        },
      ],
    }),
    [enabled],
  );

  return (
    <Pressable onPress={onChange} style={styles.toggleWrap}>
      <LinearGradient
        colors={
          enabled
            ? ["#2563EB", "#7C3AED"]
            : ["rgba(51,65,85,1)", "rgba(51,65,85,1)"]
        }
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.toggleTrack}
      >
        <Animated.View style={[styles.toggleKnob, knobStyle]} />
      </LinearGradient>
    </Pressable>
  );
}

function SettingRow({
  icon,
  iconColor,
  title,
  subtitle,
  right,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <Card>
      <View style={styles.row}>
        <View style={styles.left}>
          <View style={styles.iconBox}>
            <Ionicons name={icon} size={18} color={iconColor} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>{title}</Text>
            {subtitle ? <Text style={styles.rowSub}>{subtitle}</Text> : null}
          </View>
        </View>
        {right ? <View>{right}</View> : null}
      </View>
    </Card>
  );
}

export default function SettingsScreen() {
  // const [notifications, setNotifications] = useState(true);
  const [sound, setSound] = useState(true);
  // const [darkMode, setDarkMode] = useState(true);

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#2563EB", "#7C3AED"]} style={styles.header}>
        {/* Centered title + optional icon */}
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Settings</Text>
          {/* Хүсвэл icon нэмэх */}
          {/* <Ionicons name="settings-outline" size={24} color="white" /> */}
        </View>

        {/* Right placeholder for spacing */}
        <View style={{ width: 44, height: 44 }} />
      </LinearGradient>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <View style={styles.stack}>
            {/* <SettingRow
              icon="notifications"
              iconColor="#60A5FA"
              title="notif"
              subtitle="daily notification"
              right={
                <ToggleSwitch
                  enabled={notifications}
                  onChange={() => setNotifications((v) => !v)}
                />
              }
            /> */}
            <SettingRow
              icon="volume-high"
              iconColor="#A78BFA"
              title="voice"
              subtitle="voice eff"
              right={
                <ToggleSwitch
                  enabled={sound}
                  onChange={() => setSound((v) => !v)}
                />
              }
            />
            <SettingRow
              icon="volume-high"
              iconColor="#A78BFA"
              title="voice"
              subtitle="voice eff"
              right={
                <ToggleSwitch
                  enabled={sound}
                  onChange={() => setSound((v) => !v)}
                />
              }
            />
            <SettingRow
              icon="volume-high"
              iconColor="#A78BFA"
              title="voice"
              subtitle="voice eff"
              right={
                <ToggleSwitch
                  enabled={sound}
                  onChange={() => setSound((v) => !v)}
                />
              }
            />
            {/* <SettingRow
              icon="moon"
              iconColor="#818CF8"
              title="dark mode"
              subtitle={darkMode ? "on" : "off"}
              right={
                <ToggleSwitch
                  enabled={darkMode}
                  onChange={() => setDarkMode((v) => !v)}
                />
              }
            /> */}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Learn</Text>
          <View style={styles.stack}>
            <SettingRow
              icon="globe"
              iconColor="#4ADE80"
              title="language"
              subtitle="mongolia"
              right={<Ionicons name="checkmark" size={18} color="#4ADE80" />}
            />
            <SettingRow
              icon="phone-portrait"
              iconColor="#FB923C"
              title="daily goal"
              subtitle="5 lesson / day"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>information</Text>
          <Card>
            <View style={styles.about}>
              <Text style={styles.aboutTitle}>Технологи</Text>
              <Text style={styles.aboutSub}>Version 1.0.0</Text>
            </View>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  header: {
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "900",
    paddingLeft: 20,
  },
  section: { marginBottom: theme.s(3) },
  sectionTitle: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: "800",
    marginBottom: theme.s(1.5),
  },
  stack: { gap: theme.s(1.5) },
  card: {
    borderRadius: theme.r.xl,
    borderWidth: 1,
    borderColor: "rgba(51,65,85,0.55)",
    padding: theme.s(2),
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.s(2),
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(1.5),
    flex: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "rgba(51,65,85,0.35)",
    borderWidth: 1,
    borderColor: "rgba(51,65,85,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  rowTitle: { color: "white", fontSize: 15, fontWeight: "800" },
  rowSub: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  toggleWrap: {},
  toggleTrack: {
    width: 48,
    height: 28,
    borderRadius: 999,
    padding: 4,
    justifyContent: "center",
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 999,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  about: { alignItems: "center", paddingVertical: theme.s(1) },
  aboutTitle: {
    color: "white",
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 4,
  },
  aboutSub: { color: theme.colors.muted, fontSize: 12, fontWeight: "700" },
});
