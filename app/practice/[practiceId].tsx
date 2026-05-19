import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

export default function PracticeDetailRoute() {
  const { practiceId } = useLocalSearchParams<{ practiceId: string }>();

  return (
    <View style={{ flex: 1, padding: 24, justifyContent: "center" }}>
      <Text style={{ fontSize: 24, fontWeight: "800" }}>Practice</Text>
      <Text>{practiceId}</Text>
    </View>
  );
}