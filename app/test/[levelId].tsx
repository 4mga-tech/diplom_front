import TestScreen from "@/src/features/TestScreen";
import { useLocalSearchParams } from "expo-router";

export default function TestPage() {
  const { levelId } = useLocalSearchParams();

  if (!levelId || typeof levelId !== "string") {
    return null;
  }

  return <TestScreen levelId={levelId} />;
}
