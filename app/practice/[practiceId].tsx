import { Redirect, useLocalSearchParams } from "expo-router";

export default function PracticeLegacyRedirectRoute() {
  const { practiceId } = useLocalSearchParams<{ practiceId: string }>();
  if (!practiceId) return <Redirect href="/practice" />;
  return <Redirect href={`/practice/${encodeURIComponent(practiceId)}/play` as any} />;
}
