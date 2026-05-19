import { useLocalSearchParams } from "expo-router";
import PracticeLevelScreen from "@/src/features/practice/screens/PracticeLevelScreen";

export default function PracticeLevelRoute() {
  const { levelId } = useLocalSearchParams<{ levelId: string }>();
  if (!levelId) return null;
  return <PracticeLevelScreen levelId={levelId} />;
}
