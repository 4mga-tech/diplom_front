import { useLocalSearchParams } from "expo-router";

import PracticeRoadmapScreen from "@/src/features/practice/screens/PracticeRoadmapScreen";

export default function PracticeRoadmapTabRoute() {
  const { practiceId } = useLocalSearchParams<{ practiceId: string }>();
  if (!practiceId) return null;
  return <PracticeRoadmapScreen practiceId={practiceId} />;
}
