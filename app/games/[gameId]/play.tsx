import { Redirect, useLocalSearchParams } from "expo-router";

export default function LegacyGamePlayRoute() {
  const { gameId, stageId } = useLocalSearchParams<{ gameId?: string; stageId?: string }>();

  if (!gameId) {
    return <Redirect href="/" />;
  }

  const basePath = `/practice/${encodeURIComponent(gameId)}/play`;
  const href = stageId
    ? `${basePath}?stageId=${encodeURIComponent(stageId)}`
    : basePath;

  return <Redirect href={href as any} />;
}
