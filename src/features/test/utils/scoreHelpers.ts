export function calculateXp(correctCount: number): number {
  return correctCount * 5;
}

export function calculatePercentage(
  correctCount: number,
  total: number,
): number {
  if (!total) return 0;
  return Math.round((correctCount / total) * 100);
}
