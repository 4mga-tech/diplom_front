import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Dimensions,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
const { width, height } = Dimensions.get("window");

// Mock data
const todaysChallenge = {
  title: "Daily Audio Challenge",
  description: "Complete 3 listening exercises to earn bonus XP",
  progress: 67,
  icon: "🎯",
  xpReward: 150,
};

const gameCategories = [
  {
    id: "listening",
    icon: "book-outline",
    games: [
      {
        id: "audio-practice",
        title: "Audio Practice",
        description: "Listen and repeat Mongolian words",
        icon: "🎧",
        difficulty: "Easy",
        progress: 75,
        unlocked: true,
        color: "#667eea",
      },
      {
        id: "repeat-after",
        title: "Repeat After",
        description: "Follow along with native speakers",
        icon: "🔊",
        difficulty: "Medium",
        progress: 45,
        unlocked: true,
        color: "#764ba2",
      },
    ],
  },
  {
    id: "writing",
    icon: "create-outline",
    games: [
      {
        id: "handwriting",
        title: "Handwriting",
        description: "Practice writing Mongolian script",
        icon: "✍️",
        difficulty: "Hard",
        progress: 20,
        unlocked: false,
        color: "#f093fb",
      },
      {
        id: "tracing",
        title: "Tracing",
        description: "Trace letters to learn shapes",
        icon: "📝",
        difficulty: "Easy",
        progress: 90,
        unlocked: true,
        color: "#4facfe",
      },
    ],
  },
  {
    id: "vocabulary",
    icon: "book-outline",
    games: [
      {
        id: "word-building",
        title: "Word Building",
        description: "Build words from letters",
        icon: "🧩",
        difficulty: "Medium",
        progress: 60,
        unlocked: true,
        color: "#43e97b",
      },
      {
        id: "letter-matching",
        title: "Letter Matching",
        description: "Match letters to images",
        icon: "🎯",
        difficulty: "Easy",
        progress: 100,
        unlocked: true,
        color: "#38f9d7",
      },
    ],
  },
  {
    id: "grammar",
    icon: "library-outline",
    games: [
      {
        id: "fill-blank",
        title: "Fill in the Blank",
        description: "Complete sentences with correct words",
        icon: "📄",
        difficulty: "Medium",
        progress: 30,
        unlocked: true,
        color: "#fa709a",
      },
      {
        id: "sentence-ordering",
        title: "Sentence Ordering",
        description: "Arrange words in correct order",
        icon: "🔀",
        difficulty: "Hard",
        progress: 10,
        unlocked: false,
        color: "#a8edea",
      },
      {
        id: "vocab-challenge",
        title: "Vocabulary Challenge",
        description: "Test your word knowledge",
        icon: "🧠",
        difficulty: "Medium",
        progress: 50,
        unlocked: true,
        color: "#ff9a9e",
      },
    ],
  },
];

const GameCard = ({ game, router }: { game: any; router: any }) => {
  const handlePress = () => {
    if (game.unlocked) {
      router.push(`/games/${game.id}`);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.gameCard, !game.unlocked && styles.lockedCard]}
      onPress={handlePress}
      disabled={!game.unlocked}
      activeOpacity={0.8}
    >
      <View style={styles.gameCardGlow}>
        <View
          style={[
            styles.gameCardGradient,
            { backgroundColor: game.color + "15" },
          ]}
        >
          <View style={styles.gameCardContent}>
            <View style={styles.gameHeader}>
              <View
                style={[
                  styles.gameIconContainer,
                  { backgroundColor: game.color + "30" },
                ]}
              >
                <Text style={styles.gameIcon}>{game.icon}</Text>
              </View>
              {!game.unlocked && <Text style={styles.lockIcon}>🔒</Text>}
            </View>

            <View style={styles.gameInfo}>
              <Text style={styles.gameTitle}>{game.title}</Text>
              <Text style={styles.gameDescription}>{game.description}</Text>
            </View>

            <View style={styles.gameMeta}>
              <Text
                style={[
                  styles.difficultyBadge,
                  getDifficultyStyle(game.difficulty),
                ]}
              >
                {game.difficulty}
              </Text>
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${game.progress}%` },
                      getProgressColor(game.progress),
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>{game.progress}%</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.startButton,
                !game.unlocked && styles.lockedButton,
              ]}
              onPress={handlePress}
              disabled={!game.unlocked}
            >
              <Text
                style={[
                  styles.startButtonText,
                  !game.unlocked && styles.lockedButtonText,
                ]}
              >
                {game.unlocked ? "Start" : "Locked"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const getDifficultyStyle = (difficulty: string) => {
  switch (difficulty) {
    case "Easy":
      return styles.easyBadge;
    case "Medium":
      return styles.mediumBadge;
    case "Hard":
      return styles.hardBadge;
    default:
      return styles.easyBadge;
  }
};

const getProgressColor = (progress: number) => {
  if (progress === 100) return styles.completedProgress;
  if (progress >= 50) return styles.goodProgress;
  return styles.startingProgress;
};

const CategorySection = ({
  category,
  router,
}: {
  category: any;
  router: any;
}) => (
  <View style={styles.categorySection}>
    <FlatList
      data={category.games}
      renderItem={({ item }) => <GameCard game={item} router={router} />}
      keyExtractor={(item) => item.id}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.gamesList}
    />
  </View>
);

const CategoryTab = ({
  category,
  isActive,
  onPress,
}: {
  category: any;
  isActive: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={[styles.categoryTab, isActive && styles.activeCategoryTab]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Ionicons
      name={category.icon}
      size={22}
      color={isActive ? "#fff" : "#9CA3AF"}
    />
  </TouchableOpacity>
);

export default function GameHubScreen() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("listening");

  const activeCategoryData = gameCategories.find(
    (cat) => cat.id === activeCategory,
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Immersive Background Layers */}
      <View style={styles.backgroundLayer1} />
      <View style={styles.backgroundLayer2} />
      <View style={styles.backgroundLayer3} />
      <View style={styles.backgroundLayer4} />

      {/* Floating Decorative Elements */}
      <View style={styles.floatingCircle1} />
      <View style={styles.floatingCircle2} />
      <View style={styles.floatingCircle3} />
      <View style={styles.glowOrb1} />
      <View style={styles.glowOrb2} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroGlow} />
          <Text style={styles.heroTitle}>Game Zone</Text>
          <Text style={styles.heroSubtitle}>Enter the practice dimension</Text>
        </View>

        {/* Featured Challenge Card */}
        <View style={styles.featuredCard}>
          <View style={styles.featuredGlow} />
          <View style={styles.featuredHeader}>
            <View style={styles.featuredIconContainer}>
              <Text style={styles.featuredIcon}>🎯</Text>
            </View>
            <View style={styles.featuredContent}>
              <Text style={styles.featuredTitle}>Daily Challenge</Text>
              <Text style={styles.featuredDescription}>
                Complete 3 exercises to earn bonus XP
              </Text>
            </View>
          </View>
          <View style={styles.featuredProgress}>
            <View style={styles.featuredProgressBar}>
              <View style={[styles.featuredProgressFill, { width: "67%" }]} />
            </View>
            <Text style={styles.featuredProgressText}>2/3 completed</Text>
          </View>
          <TouchableOpacity style={styles.featuredButton}>
            <Text style={styles.featuredButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>

        {/* Category Selector */}
        <View style={styles.categorySelector}>
          {gameCategories.map((category) => (
            <CategoryTab
              key={category.id}
              category={category}
              isActive={activeCategory === category.id}
              onPress={() => setActiveCategory(category.id)}
            />
          ))}
        </View>

        {/* Active Category Games */}
        {activeCategoryData && (
          <CategorySection category={activeCategoryData} router={router} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a14",
  },
  // Enhanced Background Layers
  backgroundLayer1: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.35,
    backgroundColor: "#1a1a2e",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  backgroundLayer2: {
    position: "absolute",
    top: height * 0.25,
    left: 0,
    right: 0,
    height: height * 0.4,
    backgroundColor: "#16213e",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backgroundLayer3: {
    position: "absolute",
    top: height * 0.4,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#0f0f23",
  },
  backgroundLayer4: {
    position: "absolute",
    top: height * 0.6,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#0a0a14",
  },
  // Floating Decorative Elements
  floatingCircle1: {
    position: "absolute",
    top: height * 0.1,
    right: width * 0.1,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(102, 126, 234, 0.1)",
    transform: [{ scale: 1.2 }],
  },
  floatingCircle2: {
    position: "absolute",
    top: height * 0.3,
    left: width * 0.05,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(118, 75, 162, 0.08)",
    transform: [{ scale: 0.8 }],
  },
  floatingCircle3: {
    position: "absolute",
    top: height * 0.5,
    right: width * 0.15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(240, 147, 251, 0.06)",
  },
  glowOrb1: {
    position: "absolute",
    top: height * 0.2,
    left: width * 0.7,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(102, 126, 234, 0.05)",
    transform: [{ scale: 1.5 }],
  },
  glowOrb2: {
    position: "absolute",
    top: height * 0.7,
    left: width * 0.2,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(67, 233, 123, 0.03)",
    transform: [{ scale: 1.3 }],
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    padding: 24,
    paddingTop: 50,
    alignItems: "center",
    position: "relative",
  },
  heroGlow: {
    position: "absolute",
    top: 20,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(102, 126, 234, 0.1)",
    transform: [{ scale: 1.2 }],
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
    textAlign: "center",
    textShadowColor: "rgba(102, 126, 234, 0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "#b8c5d6",
    textAlign: "center",
    lineHeight: 24,
    opacity: 0.8,
  },
  featuredCard: {
    backgroundColor: "rgba(26, 26, 46, 0.8)",
    margin: 20,
    marginTop: 10,
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(102, 126, 234, 0.3)",
    position: "relative",
    overflow: "hidden",
  },
  featuredGlow: {
    position: "absolute",
    top: -20,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(102, 126, 234, 0.2)",
  },
  featuredHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  featuredIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(102, 126, 234, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  featuredIcon: {
    fontSize: 28,
  },
  featuredContent: {
    flex: 1,
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 4,
  },
  featuredDescription: {
    fontSize: 14,
    color: "#b8c5d6",
    lineHeight: 20,
  },
  featuredProgress: {
    marginBottom: 20,
  },
  featuredProgressBar: {
    height: 10,
    backgroundColor: "rgba(42, 42, 62, 0.5)",
    borderRadius: 5,
    marginBottom: 8,
    overflow: "hidden",
  },
  featuredProgressFill: {
    height: "100%",
    backgroundColor: "#667eea",
    borderRadius: 5,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  featuredProgressText: {
    fontSize: 12,
    color: "#b8c5d6",
    textAlign: "center",
  },
  featuredButton: {
    backgroundColor: "#667eea",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  featuredButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  categorySelector: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  categoryTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: "rgba(30, 30, 46, 0.6)",
    borderWidth: 1,
    borderColor: "rgba(42, 42, 62, 0.5)",
    backdropFilter: "blur(10px)",
  },
  activeCategoryTab: {
    backgroundColor: "rgba(102, 126, 234, 0.8)",
    borderColor: "#667eea",
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },

  categorySection: {
    marginBottom: 32,
  },
  gamesList: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  gameCard: {
    marginRight: 16,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  gameCardGlow: {
    padding: 2,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  gameCardGradient: {
    padding: 24,
    minHeight: 220,
    borderRadius: 18,
  },
  gameCardContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  lockedCard: {
    opacity: 0.5,
  },
  gameHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  gameIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  gameIcon: {
    fontSize: 28,
  },
  gameInfo: {
    marginBottom: 20,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 6,
  },
  gameDescription: {
    fontSize: 13,
    color: "#b8c5d6",
    lineHeight: 18,
  },
  gameMeta: {
    marginBottom: 20,
  },
  difficultyBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  easyBadge: {
    backgroundColor: "#43e97b",
    color: "#0f0f23",
  },
  mediumBadge: {
    backgroundColor: "#fa709a",
    color: "#ffffff",
  },
  hardBadge: {
    backgroundColor: "#f093fb",
    color: "#ffffff",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 4,
    marginRight: 10,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  completedProgress: {
    backgroundColor: "#43e97b",
  },
  goodProgress: {
    backgroundColor: "#667eea",
  },
  startingProgress: {
    backgroundColor: "#f093fb",
  },
  progressText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
  },
  startButton: {
    backgroundColor: "#ffffff",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f0f23",
  },
  lockedButton: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  lockedButtonText: {
    color: "#b8c5d6",
  },
  lockIcon: {
    fontSize: 24,
    color: "#b8c5d6",
  },
});
