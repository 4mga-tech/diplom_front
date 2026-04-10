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
  accent,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  accent?: string;
}) {
  return (
    <Card>
      <View style={styles.row}>
        <View style={styles.left}>
          <View
            style={[
              styles.iconBox,
              accent ? { backgroundColor: accent, borderColor: accent } : null,
            ]}
          >
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

function Pill({
  label,
  active = false,
}: {
  label: string;
  active?: boolean;
}) {
  return (
    <View style={[styles.pill, active && styles.pillActive]}>
      <Text style={[styles.pillText, active && styles.pillTextActive]}>
        {label}
      </Text>
    </View>
  );
}

export default function SettingsScreen() {
  const [sound, setSound] = useState(true);
  const [dailyReminder, setDailyReminder] = useState(true);
  const [autoPlay, setAutoPlay] = useState(false);
  const [downloadWifiOnly, setDownloadWifiOnly] = useState(true);

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#2563EB", "#7C3AED"]} style={styles.header}>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        <View style={{ width: 44, height: 44 }} />
      </LinearGradient>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={["rgba(37,99,235,0.28)", "rgba(124,58,237,0.16)"]}
          style={styles.heroCard}
        >
          <View style={styles.heroHeader}>
            <View style={styles.heroIcon}>
              <Ionicons name="sparkles-outline" size={18} color="#BFDBFE" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>Make learning fit your day</Text>
              <Text style={styles.heroSub}>
                Tune reminders, audio, and study pace for a smoother routine.
              </Text>
            </View>
          </View>
          <View style={styles.heroPills}>
            <Pill label="Daily goal: 5 lessons" active />
            <Pill label="Voice practice" active={sound} />
            <Pill label="Reminder at 8:00 PM" active={dailyReminder} />
          </View>
        </LinearGradient>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <Text style={styles.sectionCaption}>
            Personalize lesson playback and reminders
          </Text>
          <View style={styles.stack}>
            <SettingRow
              icon="volume-high"
              iconColor="#A78BFA"
              title="Voice guidance"
              subtitle="Play pronunciation support during lessons"
              right={
                <ToggleSwitch
                  enabled={sound}
                  onChange={() => setSound((v) => !v)}
                />
              }
              accent="rgba(167,139,250,0.14)"
            />
            <SettingRow
              icon="notifications"
              iconColor="#60A5FA"
              title="Daily reminder"
              subtitle="Get a study nudge every evening"
              right={
                <ToggleSwitch
                  enabled={dailyReminder}
                  onChange={() => setDailyReminder((v) => !v)}
                />
              }
              accent="rgba(96,165,250,0.14)"
            />
            <SettingRow
              icon="play-circle"
              iconColor="#34D399"
              title="Auto-play examples"
              subtitle="Play sentence examples right after each answer"
              right={
                <ToggleSwitch
                  enabled={autoPlay}
                  onChange={() => setAutoPlay((v) => !v)}
                />
              }
              accent="rgba(52,211,153,0.14)"
            />
            <SettingRow
              icon="download"
              iconColor="#FBBF24"
              title="Download on Wi-Fi only"
              subtitle="Save mobile data when caching lesson audio"
              right={
                <ToggleSwitch
                  enabled={downloadWifiOnly}
                  onChange={() => setDownloadWifiOnly((v) => !v)}
                />
              }
              accent="rgba(251,191,36,0.14)"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Study plan</Text>
          <Text style={styles.sectionCaption}>
            Keep your goals visible and easy to adjust
          </Text>
          <View style={styles.stack}>
            <SettingRow
              icon="flag"
              iconColor="#4ADE80"
              title="Daily goal"
              subtitle="5 lessons per day"
              right={<Pill label="On track" active />}
              accent="rgba(74,222,128,0.14)"
            />
            <SettingRow
              icon="repeat"
              iconColor="#F97316"
              title="Review mode"
              subtitle="Mixed practice after each completed unit"
              right={<Pill label="Smart review" active />}
              accent="rgba(249,115,22,0.14)"
            />
            <SettingRow
              icon="globe"
              iconColor="#4ADE80"
              title="Learning language"
              subtitle="Mongolian basics"
              right={
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color="#4ADE80"
                />
              }
              accent="rgba(74,222,128,0.14)"
            />
            <SettingRow
              icon="phone-portrait"
              iconColor="#FB923C"
              title="Practice pace"
              subtitle="Balanced for short daily sessions"
              right={<Pill label="15 min" />}
              accent="rgba(251,146,60,0.14)"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support & info</Text>
          <Text style={styles.sectionCaption}>
            A quick view of app details and your setup
          </Text>
          <View style={styles.stack}>
            <Card>
              <View style={styles.about}>
                <View style={styles.aboutIcon}>
                  <Ionicons
                    name="information-circle-outline"
                    size={22}
                    color="#93C5FD"
                  />
                </View>
                <Text style={styles.aboutTitle}>Monlanguage mobile</Text>
                <Text style={styles.aboutSub}>
                  Version 1.0.0 • Personalized daily learning
                </Text>
              </View>
            </Card>
            <Card>
              <View style={styles.quickFacts}>
                <View style={styles.quickFact}>
                  <Text style={styles.quickFactLabel}>Reminder time</Text>
                  <Text style={styles.quickFactValue}>8:00 PM</Text>
                </View>
                <View style={styles.quickFact}>
                  <Text style={styles.quickFactLabel}>Audio quality</Text>
                  <Text style={styles.quickFactValue}>High</Text>
                </View>
                <View style={styles.quickFact}>
                  <Text style={styles.quickFactLabel}>Offline lessons</Text>
                  <Text style={styles.quickFactValue}>12 saved</Text>
                </View>
              </View>
            </Card>
          </View>
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
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  sectionCaption: {
    color: "#CBD5E1",
    fontSize: 13,
    marginBottom: theme.s(1.5),
  },
  stack: { gap: theme.s(1.5) },
  heroCard: {
    borderRadius: 26,
    padding: theme.s(2.5),
    marginVertical: theme.s(3),
    borderWidth: 1,
    borderColor: "rgba(96,165,250,0.18)",
  },
  heroHeader: {
    flexDirection: "row",
    gap: theme.s(1.5),
    alignItems: "flex-start",
  },
  heroIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(148,163,184,0.16)",
    borderWidth: 1,
    borderColor: "rgba(191,219,254,0.18)",
  },
  heroTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "900",
  },
  heroSub: {
    color: "#CBD5E1",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6,
  },
  heroPills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: theme.s(2),
  },
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
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(51,65,85,0.45)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.18)",
  },
  pillActive: {
    backgroundColor: "rgba(37,99,235,0.18)",
    borderColor: "rgba(96,165,250,0.28)",
  },
  pillText: {
    color: "#CBD5E1",
    fontSize: 12,
    fontWeight: "700",
  },
  pillTextActive: {
    color: "#DBEAFE",
  },
  about: { alignItems: "center", paddingVertical: theme.s(1) },
  aboutIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(37,99,235,0.14)",
    marginBottom: 12,
  },
  aboutTitle: {
    color: "white",
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 4,
  },
  aboutSub: { color: theme.colors.muted, fontSize: 12, fontWeight: "700" },
  quickFacts: {
    gap: theme.s(1.25),
  },
  quickFact: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  quickFactLabel: {
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "700",
  },
  quickFactValue: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
});
