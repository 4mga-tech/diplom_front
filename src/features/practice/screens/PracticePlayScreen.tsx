import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

export default function PracticePlayScreen() {
  const { gameId, stageId } = useLocalSearchParams<{
    gameId: string;
    stageId?: string;
  }>();

  return (
    <View style={{ flex: 1, padding: 24, justifyContent: "center" }}>
      <Text style={{ fontSize: 24, fontWeight: "800" }}>Practice Play</Text>
      <Text>Practice: {gameId}</Text>
      <Text>Stage: {stageId}</Text>
    </View>
  );
}
