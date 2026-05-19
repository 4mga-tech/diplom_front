import { useLocalSearchParams } from "expo-router";

import PracticePlayScreen from "@/src/features/practice/screens/PracticePlayScreen";

export default function PracticePlayRoute() {
  const { practiceId } = useLocalSearchParams<{ practiceId: string }>();

  if (!practiceId) return null;

  return <PracticePlayScreen practiceId={practiceId} />;
}
