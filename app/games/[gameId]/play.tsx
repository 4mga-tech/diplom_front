import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

export default function GamePlayRoute() {
  const { gameId, stageId } = useLocalSearchParams<{
    gameId: string;
    stageId?: string;
  }>();

  return (
    <View style={{ flex: 1, padding: 24, justifyContent: "center" }}>
      <Text style={{ fontSize: 24, fontWeight: "800" }}>Game Play</Text>
      <Text>Game: {gameId}</Text>
      <Text>Stage: {stageId}</Text>
    </View>
  );
}