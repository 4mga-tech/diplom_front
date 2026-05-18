import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

// Mock data for games and their stages
const gamesData = {
  "audio-practice": {
    title: "Audio Practice",
    icon: "🎧",
    description: "Master Mongolian pronunciation through listening exercises",
    color: "#667eea",
    stages: [
      {
        id: "stage-1",
        title: "Stage 1",
        subtitle: "Basic Sounds",
        difficulty: "Easy",
        xpReward: 50,
        progress: 100,
        unlocked: true,
        position: { x: 0.2, y: 0.2 },
      },
      {
        id: "stage-2",
        title: "Stage 2",
        subtitle: "Simple Words",
        difficulty: "Easy",
        xpReward: 75,
        progress: 80,
        unlocked: true,
        position: { x: 0.5, y: 0.35 },
      },
      {
        id: "stage-3",
        title: "Stage 3",
        subtitle: "Phrases",
        difficulty: "Medium",
        xpReward: 100,
        progress: 45,
        unlocked: true,
        position: { x: 0.8, y: 0.5 },
      },
      {
        id: "stage-4",
        title: "Stage 4",
        subtitle: "Conversations",
        difficulty: "Medium",
        xpReward: 125,
        progress: 20,
        unlocked: false,
        position: { x: 0.3, y: 0.7 },
      },
      {
        id: "stage-5",
        title: "Stage 5",
        subtitle: "Advanced Dialogues",
        difficulty: "Hard",
        xpReward: 150,
        progress: 0,
        unlocked: false,
        position: { x: 0.7, y: 0.85 },
      },
    ],
  },
  "repeat-after": {
    title: "Repeat After",
    icon: "🔊",
    description: "Follow native speakers and perfect your pronunciation",
    color: "#764ba2",
    stages: [
      {
        id: "stage-1",
        title: "Stage 1",
        subtitle: "Echo Mode",
        difficulty: "Easy",
        xpReward: 60,
        progress: 100,
        unlocked: true,
        position: { x: 0.2, y: 0.2 },
      },
      {
        id: "stage-2",
        title: "Stage 2",
        subtitle: "Speed Challenge",
        difficulty: "Medium",
        xpReward: 85,
        progress: 65,
        unlocked: true,
        position: { x: 0.5, y: 0.35 },
      },
      {
        id: "stage-3",
        title: "Stage 3",
        subtitle: "Perfect Match",
        difficulty: "Medium",
        xpReward: 110,
        progress: 30,
        unlocked: false,
        position: { x: 0.8, y: 0.5 },
      },
    ],
  },
  handwriting: {
    title: "Handwriting",
    icon: "✍️",
    description: "Learn to write beautiful Mongolian script",
    color: "#f093fb",
    stages: [
      {
        id: "stage-1",
        title: "Stage 1",
        subtitle: "Letter Forms",
        difficulty: "Easy",
        xpReward: 70,
        progress: 90,
        unlocked: true,
        position: { x: 0.2, y: 0.2 },
      },
      {
        id: "stage-2",
        title: "Stage 2",
        subtitle: "Word Writing",
        difficulty: "Medium",
        xpReward: 95,
        progress: 40,
        unlocked: false,
        position: { x: 0.5, y: 0.35 },
      },
    ],
  },
  tracing: {
    title: "Tracing",
    icon: "📝",
    description: "Trace letters to master Mongolian calligraphy",
    color: "#4facfe",
    stages: [
      {
        id: "stage-1",
        title: "Stage 1",
        subtitle: "Basic Strokes",
        difficulty: "Easy",
        xpReward: 40,
        progress: 100,
        unlocked: true,
        position: { x: 0.2, y: 0.2 },
      },
      {
        id: "stage-2",
        title: "Stage 2",
        subtitle: "Letter Practice",
        difficulty: "Easy",
        xpReward: 55,
        progress: 85,
        unlocked: true,
        position: { x: 0.5, y: 0.35 },
      },
      {
        id: "stage-3",
        title: "Stage 3",
        subtitle: "Word Tracing",
        difficulty: "Medium",
        xpReward: 80,
        progress: 60,
        unlocked: true,
        position: { x: 0.8, y: 0.5 },
      },
    ],
  },
  "word-building": {
    title: "Word Building",
    icon: "🧩",
    description: "Build Mongolian words from letter pieces",
    color: "#43e97b",
    stages: [
      {
        id: "stage-1",
        title: "Stage 1",
        subtitle: "Simple Words",
        difficulty: "Easy",
        xpReward: 65,
        progress: 100,
        unlocked: true,
        position: { x: 0.2, y: 0.2 },
      },
      {
        id: "stage-2",
        title: "Stage 2",
        subtitle: "Compound Words",
        difficulty: "Medium",
        xpReward: 90,
        progress: 75,
        unlocked: true,
        position: { x: 0.5, y: 0.35 },
      },
      {
        id: "stage-3",
        title: "Stage 3",
        subtitle: "Complex Phrases",
        difficulty: "Hard",
        xpReward: 120,
        progress: 25,
        unlocked: false,
        position: { x: 0.8, y: 0.5 },
      },
    ],
  },
  "letter-matching": {
    title: "Letter Matching",
    icon: "🎯",
    description: "Match Mongolian letters to their pronunciations",
    color: "#38f9d7",
    stages: [
      {
        id: "stage-1",
        title: "Stage 1",
        subtitle: "Vowel Sounds",
        difficulty: "Easy",
        xpReward: 45,
        progress: 100,
        unlocked: true,
        position: { x: 0.2, y: 0.2 },
      },
      {
        id: "stage-2",
        title: "Stage 2",
        subtitle: "Consonant Sounds",
        difficulty: "Easy",
        xpReward: 60,
        progress: 95,
        unlocked: true,
        position: { x: 0.5, y: 0.35 },
      },
    ],
  },
  "fill-blank": {
    title: "Fill in the Blank",
    icon: "📄",
    description: "Complete Mongolian sentences with correct words",
    color: "#fa709a",
    stages: [
      {
        id: "stage-1",
        title: "Stage 1",
        subtitle: "Basic Sentences",
        difficulty: "Medium",
        xpReward: 80,
        progress: 70,
        unlocked: true,
        position: { x: 0.2, y: 0.2 },
      },
      {
        id: "stage-2",
        title: "Stage 2",
        subtitle: "Complex Grammar",
        difficulty: "Medium",
        xpReward: 105,
        progress: 35,
        unlocked: false,
        position: { x: 0.5, y: 0.35 },
      },
    ],
  },
  "sentence-ordering": {
    title: "Sentence Ordering",
    icon: "🔀",
    description: "Arrange Mongolian words in correct sentence order",
    color: "#a8edea",
    stages: [
      {
        id: "stage-1",
        title: "Stage 1",
        subtitle: "Word Order Basics",
        difficulty: "Hard",
        xpReward: 130,
        progress: 15,
        unlocked: false,
        position: { x: 0.2, y: 0.2 },
      },
    ],
  },
  "vocab-challenge": {
    title: "Vocabulary Challenge",
    icon: "🧠",
    description: "Test and expand your Mongolian vocabulary",
    color: "#ff9a9e",
    stages: [
      {
        id: "stage-1",
        title: "Stage 1",
        subtitle: "Word Recognition",
        difficulty: "Medium",
        xpReward: 85,
        progress: 55,
        unlocked: true,
        position: { x: 0.2, y: 0.2 },
      },
      {
        id: "stage-2",
        title: "Stage 2",
        subtitle: "Context Usage",
        difficulty: "Hard",
        xpReward: 115,
        progress: 10,
        unlocked: false,
        position: { x: 0.5, y: 0.35 },
      },
    ],
  },
};

const StageNode = ({
  stage,
  gameColor,
  gameId,
}: {
  stage: any;
  gameColor: string;
  gameId: string;
}) => {
  const router = useRouter();

  const handlePress = () => {
  if (stage.unlocked) {
    router.push(
      `/games/${gameId}/play?stageId=${stage.id}`
    );
  }
};
  const nodeSize = stage.unlocked ? 80 : 60;
  const nodePosition = {
    left: stage.position.x * (width - 40) - nodeSize / 2,
    top: stage.position.y * (height * 0.6) - nodeSize / 2,
  };

  return (
    <TouchableOpacity
      style={[
        styles.stageNode,
        {
          width: nodeSize,
          height: nodeSize,
          left: nodePosition.left,
          top: nodePosition.top,
          backgroundColor: stage.unlocked ? gameColor : "#2a2a3e",
          borderColor: stage.unlocked ? gameColor : "#404040",
        },
        !stage.unlocked && styles.lockedNode,
      ]}
      onPress={handlePress}
      disabled={!stage.unlocked}
      activeOpacity={0.8}
    >
      {!stage.unlocked && <Text style={styles.lockIcon}>🔒</Text>}
      {stage.unlocked && (
        <View style={styles.stageContent}>
          <Text style={styles.stageNumber}>{stage.title.split(" ")[1]}</Text>
          {stage.progress > 0 && (
            <View style={styles.miniProgress}>
              <View
                style={[
                  styles.miniProgressFill,
                  { width: `${Math.min(stage.progress, 100)}%` },
                ]}
              />
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const StageDetailCard = ({
  stage,
  gameColor,
}: {
  stage: any;
  gameColor: string;
}) => {
  if (!stage.unlocked) return null;

  return (
    <View style={[styles.detailCard, { borderLeftColor: gameColor }]}>
      <View style={styles.detailHeader}>
        <Text style={styles.detailTitle}>{stage.title}</Text>
        <Text style={styles.detailSubtitle}>{stage.subtitle}</Text>
      </View>

      <View style={styles.detailMeta}>
        <Text
          style={[styles.difficultyBadge, getDifficultyStyle(stage.difficulty)]}
        >
          {stage.difficulty}
        </Text>
        <Text style={styles.xpReward}>+{stage.xpReward} XP</Text>
      </View>

      {stage.progress > 0 && (
        <View style={styles.detailProgress}>
          <View style={styles.detailProgressBar}>
            <View
              style={[
                styles.detailProgressFill,
                { width: `${stage.progress}%` },
                getProgressColor(stage.progress),
              ]}
            />
          </View>
          <Text style={styles.detailProgressText}>
            {stage.progress}% Complete
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.playButton, { backgroundColor: gameColor }]}
      >
        <Text style={styles.playButtonText}>Play Stage</Text>
      </TouchableOpacity>
    </View>
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

export default function GameStagesScreen() {
  const searchParams = useLocalSearchParams<{ gameId?: string }>();
  const gameId = searchParams.gameId as keyof typeof gamesData | undefined;
  const game = gameId ? gamesData[gameId] : null;

  if (!game || !gameId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>Game not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Background Layers */}
      <View style={styles.backgroundLayer1} />
      <View style={styles.backgroundLayer2} />

      {/* Hero Header */}
      <View style={styles.heroHeader}>
        <View
          style={[
            styles.heroIconContainer,
            { backgroundColor: game.color + "30" },
          ]}
        >
          <Text style={styles.heroIcon}>{game.icon}</Text>
        </View>
        <Text style={styles.heroTitle}>{game.title}</Text>
        <Text style={styles.heroDescription}>{game.description}</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Game Map */}
        <View style={styles.mapContainer}>
          {/* Connection Lines */}
          <View style={styles.connectionsContainer}>
            {game.stages.slice(0, -1).map((stage, index) => {
              const nextStage = game.stages[index + 1];
              const startX = stage.position.x * width;
              const startY = stage.position.y * (height * 0.6);
              const endX = nextStage.position.x * width;
              const endY = nextStage.position.y * (height * 0.6);
              const distance = Math.sqrt(
                Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2),
              );
              const angle =
                (Math.atan2(endY - startY, endX - startX) * 180) / Math.PI;

              return (
                <View
                  key={`connection-${index}`}
                  style={[
                    styles.connectionLine,
                    {
                      width: distance,
                      left: startX - distance / 2,
                      top: startY - 1,
                      transform: [{ rotate: `${angle}deg` }],
                      backgroundColor: nextStage.unlocked
                        ? game.color
                        : "#404040",
                    },
                  ]}
                />
              );
            })}
          </View>

          {/* Stage Nodes */}
          {game.stages.map((stage) => (
<StageNode
  key={stage.id}
  stage={stage}
  gameColor={game.color}
  gameId={gameId}
/>          ))}
        </View>

        {/* Stage Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.detailsTitle}>Stages</Text>
          {game.stages.map((stage) => (
            <StageDetailCard
              key={stage.id}
              stage={stage}
              gameColor={game.color}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f23",
  },
  backgroundLayer1: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.3,
    backgroundColor: "#1a1a2e",
  },
  backgroundLayer2: {
    position: "absolute",
    top: height * 0.2,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#0f0f23",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: "#b8c5d6",
  },
  heroHeader: {
    alignItems: "center",
    padding: 24,
    paddingTop: 60,
  },
  heroIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  heroIcon: {
    fontSize: 40,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
    textAlign: "center",
  },
  heroDescription: {
    fontSize: 16,
    color: "#b8c5d6",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  scrollView: {
    flex: 1,
  },
  mapContainer: {
    height: height * 0.6,
    position: "relative",
    marginHorizontal: 20,
    marginTop: 20,
  },
  connectionsContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  connectionLine: {
    position: "absolute",
    height: 3,
    borderRadius: 1.5,
    transformOrigin: "left center",
  },
  stageNode: {
    position: "absolute",
    borderRadius: 40,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  lockedNode: {
    opacity: 0.6,
  },
  stageContent: {
    alignItems: "center",
  },
  stageNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
  },
  miniProgress: {
    width: 30,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 1.5,
    marginTop: 4,
  },
  miniProgressFill: {
    height: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 1.5,
  },
  lockIcon: {
    fontSize: 20,
    color: "#b8c5d6",
  },
  detailsContainer: {
    padding: 20,
  },
  detailsTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 20,
  },
  detailCard: {
    backgroundColor: "#1e1e2e",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
  },
  detailHeader: {
    marginBottom: 12,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 4,
  },
  detailSubtitle: {
    fontSize: 14,
    color: "#b8c5d6",
  },
  detailMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: "600",
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
  xpReward: {
    fontSize: 14,
    fontWeight: "600",
    color: "#b8c5d6",
  },
  detailProgress: {
    marginBottom: 16,
  },
  detailProgressBar: {
    height: 8,
    backgroundColor: "#2a2a3e",
    borderRadius: 4,
    marginBottom: 8,
  },
  detailProgressFill: {
    height: "100%",
    borderRadius: 4,
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
  detailProgressText: {
    fontSize: 12,
    color: "#b8c5d6",
    textAlign: "center",
  },
  playButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  playButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
