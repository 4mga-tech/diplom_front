import { Redirect, useLocalSearchParams } from "expo-router";

export default function LegacyGameStagesRoute() {
  const { gameId } = useLocalSearchParams<{ gameId?: string }>();

  if (!gameId) {
    return <Redirect href="/" />;
  }

  return <Redirect href={`/practice/${encodeURIComponent(gameId)}` as any} />;
}
