import { useLocalSearchParams } from "expo-router";

import PracticePlayScreen from "@/src/features/practice/screens/PracticePlayScreen";

export default function PracticePlayTabRoute() {
  const { practiceId, stageId } = useLocalSearchParams<{ practiceId: string; stageId?: string }>();
  if (!practiceId) return null;
  return <PracticePlayScreen practiceId={practiceId} stageId={stageId} />;
}
