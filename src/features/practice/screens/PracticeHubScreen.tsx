import {
  fetchXpOverview,
  XpOverview,
} from "@/src/features/achievements/achievements.service";
import { subscribeToXpUpdates } from "@/src/features/achievements/xp-events";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Dimensions,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

// ─── Types ────────────────────────────────────────────────────────────────────

type GameType =
  | "fill-blank"
  | "word-scramble"
  | "matching"
  | "multiple-choice"
  | "listen-type";

type GameItem = {
  id: string;
  type: GameType;
  title: string;
  description: string;
  emoji: string;
  difficulty: "Easy" | "Medium" | "Hard";
  progress: number;
  unlocked: boolean;
  xpReward: number;
  color: string;
  isNew?: boolean;
};

type CategoryData = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  games: GameItem[];
};

// ─── Static Data ──────────────────────────────────────────────────────────────

const EMPTY_XP: XpOverview = {
  totalXp: 0,
  streak: 0,
  completedLessons: 0,
  canClaimDailyXp: false,
  nextDailyClaimAt: null,
  dailyClaimXpAmount: null,
  hintXpCost: null,
};


const CATEGORIES: CategoryData[] = [
  {
    id: "fill-blank",
    label: "Fill Blank",
    icon: "create-outline",
    games: [
      {
        id: "fb-greetings",
        type: "fill-blank",
        title: "Greetings",
        description: 'Fill in missing words — "Сайн ___ байна уу?"',
        emoji: "✏️",
        difficulty: "Easy",
        progress: 80,
        unlocked: true,
        xpReward: 50,
        color: "#667eea",
        isNew: false,
      },
      {
        id: "fb-numbers",
        type: "fill-blank",
        title: "Numbers",
        description: "Complete number sequences in Mongolian",
        emoji: "🔢",
        difficulty: "Medium",
        progress: 40,
        unlocked: true,
        xpReward: 65,
        color: "#764ba2",
      },
      {
        id: "fb-sentences",
        type: "fill-blank",
        title: "Sentences",
        description: "Fill in verb forms to complete sentences",
        emoji: "📝",
        difficulty: "Hard",
        progress: 15,
        unlocked: false,
        xpReward: 90,
        color: "#a78bfa",
      },
      {
        id: "fb-question-words",
        type: "fill-blank",
        title: "Question Words",
        description: "Complete interrogative sentences correctly",
        emoji: "❓",
        difficulty: "Medium",
        progress: 50,
        unlocked: true,
        xpReward: 70,
        color: "#667eea",
        isNew: true,
      },
      {
        id: "fb-verb-tense",
        type: "fill-blank",
        title: "Verb Tenses",
        description: "Choose correct tense forms for context",
        emoji: "⏰",
        difficulty: "Hard",
        progress: 25,
        unlocked: true,
        xpReward: 85,
        color: "#764ba2",
      },
    ],
  },
  {
    id: "scramble",
    label: "Scramble",
    icon: "shuffle-outline",
    games: [
      {
        id: "sc-animals",
        type: "word-scramble",
        title: "Animals",
        description: "Rearrange letters to spell Mongolian animal names",
        emoji: "🐺",
        difficulty: "Easy",
        progress: 60,
        unlocked: true,
        xpReward: 55,
        color: "#43e97b",
        isNew: true,
      },
      {
        id: "sc-food",
        type: "word-scramble",
        title: "Food & Drinks",
        description: "Unscramble Mongolian food vocabulary",
        emoji: "🥟",
        difficulty: "Medium",
        progress: 25,
        unlocked: true,
        xpReward: 70,
        color: "#38f9d7",
      },
      {
        id: "sc-places",
        type: "word-scramble",
        title: "Places",
        description: "Unscramble location and landmark words",
        emoji: "🏛️",
        difficulty: "Easy",
        progress: 75,
        unlocked: true,
        xpReward: 50,
        color: "#43e97b",
      },
      {
        id: "sc-activities",
        type: "word-scramble",
        title: "Activities",
        description: "Rearrange action and activity verbs",
        emoji: "⚽",
        difficulty: "Medium",
        progress: 45,
        unlocked: true,
        xpReward: 75,
        color: "#38f9d7",
        isNew: true,
      },
    ],
  },
  {
    id: "matching",
    label: "Matching",
    icon: "git-compare-outline",
    games: [
      {
        id: "mt-colors",
        type: "matching",
        title: "Colors",
        description: "Match Mongolian color words to swatches",
        emoji: "🎨",
        difficulty: "Easy",
        progress: 100,
        unlocked: true,
        xpReward: 45,
        color: "#f093fb",
      },
      {
        id: "mt-family",
        type: "matching",
        title: "Family",
        description: "Pair family member words with illustrations",
        emoji: "👨‍👩‍👧",
        difficulty: "Medium",
        progress: 55,
        unlocked: true,
        xpReward: 65,
        color: "#fa709a",
        isNew: true,
      },
      {
        id: "mt-phrases",
        type: "matching",
        title: "Phrases",
        description: "Match Mongolian phrases to English meanings",
        emoji: "💬",
        difficulty: "Hard",
        progress: 0,
        unlocked: false,
        xpReward: 85,
        color: "#ffecd2",
      },
      {
        id: "mt-objects",
        type: "matching",
        title: "Objects",
        description: "Pair common objects with their Mongolian names",
        emoji: "🎁",
        difficulty: "Easy",
        progress: 90,
        unlocked: true,
        xpReward: 50,
        color: "#f093fb",
      },
      {
        id: "mt-adjectives",
        type: "matching",
        title: "Adjectives",
        description: "Match adjectives to their meanings and opposites",
        emoji: "✨",
        difficulty: "Medium",
        progress: 35,
        unlocked: true,
        xpReward: 70,
        color: "#fa709a",
      },
    ],
  },
  {
    id: "choice",
    label: "Quiz",
    icon: "help-circle-outline",
    games: [
      {
        id: "mc-vocab",
        type: "multiple-choice",
        title: "Vocab Quiz",
        description: "Choose the correct Mongolian translation",
        emoji: "🧠",
        difficulty: "Easy",
        progress: 70,
        unlocked: true,
        xpReward: 50,
        color: "#4facfe",
      },
      {
        id: "mc-grammar",
        type: "multiple-choice",
        title: "Grammar Quiz",
        description: "Pick the grammatically correct sentence",
        emoji: "📚",
        difficulty: "Hard",
        progress: 20,
        unlocked: true,
        xpReward: 95,
        color: "#f6d365",
        isNew: true,
      },
      {
        id: "mc-comprehension",
        type: "multiple-choice",
        title: "Reading Comprehension",
        description: "Read a passage and answer questions",
        emoji: "📖",
        difficulty: "Medium",
        progress: 40,
        unlocked: true,
        xpReward: 80,
        color: "#4facfe",
      },
      {
        id: "mc-dialogue",
        type: "multiple-choice",
        title: "Dialogue Quiz",
        description: "Complete conversations with correct responses",
        emoji: "💬",
        difficulty: "Medium",
        progress: 55,
        unlocked: true,
        xpReward: 75,
        color: "#f6d365",
        isNew: true,
      },
    ],
  },
  {
    id: "listen",
    label: "Listen",
    icon: "headset-outline",
    games: [
      {
        id: "lt-words",
        type: "listen-type",
        title: "Listen & Type",
        description: "Hear the Mongolian word, type what you hear",
        emoji: "🎧",
        difficulty: "Medium",
        progress: 35,
        unlocked: true,
        xpReward: 75,
        color: "#ff9a9e",
        isNew: true,
      },
      {
        id: "lt-sentences",
        type: "listen-type",
        title: "Dictation",
        description: "Listen to full sentences and write them out",
        emoji: "🎙️",
        difficulty: "Hard",
        progress: 10,
        unlocked: false,
        xpReward: 100,
        color: "#a1c4fd",
      },
      {
        id: "lt-conversation",
        type: "listen-type",
        title: "Conversation",
        description: "Listen to dialogues and fill in missing parts",
        emoji: "💭",
        difficulty: "Hard",
        progress: 0,
        unlocked: false,
        xpReward: 110,
        color: "#ff9a9e",
      },
      {
        id: "lt-pronunciation",
        type: "listen-type",
        title: "Pronunciation Match",
        description: "Match spoken words to written text",
        emoji: "🔊",
        difficulty: "Easy",
        progress: 65,
        unlocked: true,
        xpReward: 60,
        color: "#a1c4fd",
      },
    ],
  },
];




const TYPE_ICONS: Record<GameType, string> = {
  "fill-blank": "✏️",
  "word-scramble": "🔀",
  matching: "🔗",
  "multiple-choice": "🧠",
  "listen-type": "🎧",
};

function GameCard({
  game,
  router,
}: {
  game: GameItem;
  router: ReturnType<typeof useRouter>;
}) {
  const handlePress = () => {
    if (game.unlocked) {
      const gameTypeMap: Record<GameType, string> = {
        "fill-blank": "fill-blank",
        "word-scramble": "vocab-challenge",
        "matching": "letter-matching",
        "multiple-choice": "vocab-challenge",
        "listen-type": "audio-practice",
      };
      const gameKey = gameTypeMap[game.type];
      router.push(`/practice/${gameKey}`);
    }
  };

  const diffColor =
    game.difficulty === "Easy"
      ? "#43e97b"
      : game.difficulty === "Medium"
        ? "#f6c90e"
        : "#f093fb";

  const fillColor =
    game.progress === 100
      ? "#43e97b"
      : game.progress >= 50
        ? "#667eea"
        : "#f093fb";

  return (
    <TouchableOpacity
      style={[gc.card, !game.unlocked && gc.locked]}
      onPress={handlePress}
      disabled={!game.unlocked}
      activeOpacity={0.82}
    >
      {/* subtle glow border */}
      <View style={[gc.glowBorder, { shadowColor: game.color }]}>
        <View style={[gc.inner, { backgroundColor: game.color + "14" }]}>
          {/* top row */}
          <View style={gc.topRow}>
            <View style={[gc.iconWrap, { backgroundColor: game.color + "28" }]}>
              <Text style={gc.emoji}>{game.emoji}</Text>
            </View>
            <View style={gc.topRight}>
              {game.isNew && (
                <View style={gc.newBadge}>
                  <Text style={gc.newText}>NEW</Text>
                </View>
              )}
              {!game.unlocked && <Text style={gc.lock}>🔒</Text>}
            </View>
          </View>

          {/* type chip */}
          <View style={gc.typeChip}>
            <Text style={gc.typeEmoji}>{TYPE_ICONS[game.type]}</Text>
            <Text style={gc.typeLabel}>
              {game.type === "fill-blank"
                ? "Fill Blank"
                : game.type === "word-scramble"
                  ? "Scramble"
                  : game.type === "matching"
                    ? "Matching"
                    : game.type === "multiple-choice"
                      ? "Quiz"
                      : "Listen & Type"}
            </Text>
          </View>

          <Text style={gc.title}>{game.title}</Text>
          <Text style={gc.desc}>{game.description}</Text>

          {/* difficulty + xp */}
          <View style={gc.metaRow}>
            <View style={[gc.diffBadge, { backgroundColor: diffColor + "22" }]}>
              <Text style={[gc.diffText, { color: diffColor }]}>
                {game.difficulty}
              </Text>
            </View>
            <View style={gc.xpChip}>
              <Text style={gc.xpText}>+{game.xpReward} XP</Text>
            </View>
          </View>

          {/* progress */}
          <View style={gc.progressRow}>
            <View style={gc.progressTrack}>
              <View
                style={[
                  gc.progressFill,
                  { width: `${game.progress}%`, backgroundColor: fillColor },
                ]}
              />
            </View>
            <Text style={gc.progressPct}>{game.progress}%</Text>
          </View>

          {/* CTA */}
          <TouchableOpacity
            style={[
              gc.btn,
              !game.unlocked && gc.btnLocked,
              { borderColor: game.color + "60" },
            ]}
            onPress={handlePress}
            disabled={!game.unlocked}
          >
            <Text style={[gc.btnText, !game.unlocked && gc.btnTextLocked]}>
              {game.unlocked
                ? game.progress === 0
                  ? "Start"
                  : game.progress === 100
                    ? "Replay"
                    : "Continue"
                : "Locked"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const CARD_W = width * 0.64;

const gc = StyleSheet.create({
  card: {
    width: CARD_W,
    marginRight: 14,
    borderRadius: 22,
    overflow: "hidden",
  },
  locked: { opacity: 0.52 },
  glowBorder: {
    borderRadius: 22,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  inner: {
    padding: 20,
    gap: 12,
    borderRadius: 22,
    borderWidth: 1.2,
    borderColor: "rgba(255,255,255,0.1)",
    minHeight: 280,
    backgroundColor: "rgba(26,26,46,0.6)",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  emoji: { fontSize: 28 },
  topRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  newBadge: {
    backgroundColor: "rgba(34,197,94,0.25)",
    borderRadius: 99,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.4)",
  },
  newText: { color: "#86EFAC", fontSize: 11, fontWeight: "800" },
  lock: { fontSize: 20 },
  typeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(102,126,234,0.12)",
    alignSelf: "flex-start",
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: "rgba(102,126,234,0.2)",
  },
  typeEmoji: { fontSize: 12 },
  typeLabel: {
    color: "#a5b4fc",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  title: { color: "#fff", fontSize: 17, fontWeight: "800", lineHeight: 21 },
  desc: { color: "#cbd5e1", fontSize: 13, lineHeight: 18 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 2 },
  diffBadge: { borderRadius: 99, paddingHorizontal: 11, paddingVertical: 5, borderWidth: 1 },
  diffText: { fontSize: 12, fontWeight: "700" },
  xpChip: {
    backgroundColor: "rgba(102,126,234,0.18)",
    borderRadius: 99,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "rgba(102,126,234,0.3)",
  },
  xpText: { color: "#c7d2fe", fontSize: 12, fontWeight: "700" },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 2 },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 3,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  progressFill: { height: "100%", borderRadius: 3 },
  progressPct: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 11,
    fontWeight: "700",
    width: 32,
    textAlign: "right",
  },
  btn: {
    marginTop: 4,
    borderWidth: 1.5,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    marginHorizontal: -4,
    paddingHorizontal: 12,
  },
  btnLocked: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderColor: "rgba(255,255,255,0.08)",
  },
  btnText: { color: "#fff", fontSize: 15, fontWeight: "800" },
  btnTextLocked: { color: "#6b7280" },
});

// ─── Category Tab ─────────────────────────────────────────────────────────────

function CategoryTab({
  cat,
  active,
  onPress,
}: {
  cat: CategoryData;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[ct.tab, active && ct.activeTab]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Ionicons name={cat.icon} size={16} color={active ? "#fff" : "#6b7280"} />
      <Text style={[ct.label, active && ct.activeLabel]}>{cat.label}</Text>
    </TouchableOpacity>
  );
}

const ct = StyleSheet.create({
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: "rgba(30,30,46,0.5)",
    borderWidth: 1.2,
    borderColor: "rgba(255,255,255,0.08)",
  },
  activeTab: {
    backgroundColor: "rgba(102,126,234,0.2)",
    borderColor: "rgba(102,126,234,0.4)",
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  label: { color: "#64748b", fontSize: 13, fontWeight: "700" },
  activeLabel: { color: "#e0e7ff" },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function PracticeHubScreen() {
  const router = useRouter();
  const [xpOverview, setXpOverview] = useState<XpOverview>(EMPTY_XP);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState("fill-blank");

  const loadXp = useCallback(async () => {
    try {
      const data = await fetchXpOverview();
      setXpOverview(data);
    } catch (e) {
      console.log("XP load failed:", e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadXp();
    }, [loadXp]),
  );
  React.useEffect(() => subscribeToXpUpdates(() => void loadXp()), [loadXp]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadXp();
    setRefreshing(false);
  }, [loadXp]);


  const activeCat = CATEGORIES.find((c) => c.id === activeCategory);

  return (
    <SafeAreaView style={s.container}>
      {/* Background layers */}
      <View style={s.bg1} />
      <View style={s.bg2} />
      <View style={s.orb1} />
      <View style={s.orb2} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void onRefresh()}
            tintColor="#667eea"
          />
        }
      >
        <View style={s.hero}>
          <View style={s.heroGlow} />
          <View style={s.heroLeft}>
            <Text style={s.heroTitle}>Practice</Text>
            <Text style={s.heroSub}>Learn Mongolian through play</Text>

            {/* <View style={s.statsRow}>
              
              <View style={s.statPill}>
                <Ionicons name="trophy-outline" size={13} color="#FBBF24" />
                <Text style={s.statText}>{xpOverview.totalXp} total XP</Text>
              </View>
            </View> */}

            {xpOverview.canClaimDailyXp && (
              <Pressable style={s.claimBtn}>
                <Text style={s.claimBtnText}>
                  🎁 Claim daily {xpOverview.dailyClaimXpAmount} XP
                </Text>
              </Pressable>
            )}
          </View>

        </View>

       

        {/* ── Category tabs ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Practice</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.tabsRow}
          >
            {CATEGORIES.map((cat) => (
              <CategoryTab
                key={cat.id}
                cat={cat}
                active={activeCategory === cat.id}
                onPress={() => setActiveCategory(cat.id)}
              />
            ))}
          </ScrollView>
        </View>

        {activeCat && (
          <FlatList
            data={activeCat.games}
            renderItem={({ item }) => <GameCard game={item} router={router} />}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.cardsList}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a14" },

  // bg
  bg1: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.42,
    backgroundColor: "#1a1a2e",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  bg2: {
    position: "absolute",
    top: height * 0.28,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#0f0f23",
  },
  orb1: {
    position: "absolute",
    top: height * 0.08,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(102,126,234,0.07)",
  },
  orb2: {
    position: "absolute",
    top: height * 0.55,
    left: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(118,75,162,0.05)",
  },

  // hero
  hero: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 28,
    position: "relative",
  },
  heroGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(102,126,234,0.06)",
    borderRadius: 32,
  },
  heroLeft: { flex: 1, gap: 8 },
  heroEyebrow: {
    color: "#a5b4fc",
    fontWeight: "800",
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  heroTitle: { color: "#fff", fontSize: 32, fontWeight: "900", lineHeight: 38 },
  heroSub: { color: "#cbd5e1", fontSize: 14, fontWeight: "600" },
  statsRow: { flexDirection: "row", gap: 10, marginTop: 6, flexWrap: "wrap" },
  statPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  statText: { color: "#e0e7ff", fontSize: 12, fontWeight: "800" },
  claimBtn: {
    marginTop: 8,
    alignSelf: "flex-start",
    backgroundColor: "rgba(102,126,234,0.18)",
    borderWidth: 1.2,
    borderColor: "rgba(102,126,234,0.35)",
    borderRadius: 13,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  claimBtnText: { color: "#c7d2fe", fontSize: 13, fontWeight: "800" },

  // daily card
  dailyCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: "rgba(102,126,234,0.12)",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.2,
    borderColor: "rgba(102,126,234,0.25)",
    gap: 12,
  },
  dailyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dailyLabel: { color: "#cbd5e1", fontSize: 14, fontWeight: "700" },
  dailyCount: { color: "#c7d2fe", fontSize: 15, fontWeight: "900" },
  dailyTrack: {
    height: 10,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 5,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  dailyFill: { height: "100%", backgroundColor: "#667eea", borderRadius: 5 },
  dailyHint: { color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: "600" },

  // sections
  section: { gap: 12, marginBottom: 16 },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    paddingHorizontal: 20,
  },
  tabsRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  cardsList: { paddingHorizontal: 20, paddingBottom: 8 },

  // recommended
  recCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "rgba(26,26,46,0.8)",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(102,126,234,0.2)",
  },
  recIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(102,126,234,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  recBody: { flex: 1, gap: 2 },
  recEye: { color: "#667eea", fontSize: 11, fontWeight: "700" },
  recTitle: { color: "#fff", fontSize: 16, fontWeight: "800" },
  recDesc: { color: "#b8c5d6", fontSize: 12 },

  // progress
  progressCard: {
    backgroundColor: "rgba(26,26,46,0.8)",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    gap: 10,
  },
  progressRow: { flexDirection: "row", justifyContent: "space-between" },
  progressLabel: { color: "#b8c5d6", fontWeight: "600", fontSize: 13 },
  progressPct: { color: "#a5b4fc", fontWeight: "800", fontSize: 13 },
  progressTrack: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 99,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#667eea",
    borderRadius: 99,
  },
  progressHint: { color: "rgba(255,255,255,0.3)", fontSize: 11 },
});
