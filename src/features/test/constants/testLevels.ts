export const TEST_LEVEL_IDS = ["M1", "M2", "M3", "M4"] as const;

export type TestLevelId = (typeof TEST_LEVEL_IDS)[number];

export type TestLevelCard = {
  id: TestLevelId;
  title: string;
  subtitle: string;
  description: string;
  accent: string;
};

export const TEST_LEVELS: TestLevelCard[] = [
  {
    id: "M1",
    title: "M1",
    subtitle: "Foundation",
    description: "Build confidence with core test skills and familiar patterns.",
    accent: "#2563EB",
  },
  {
    id: "M2",
    title: "M2",
    subtitle: "Everyday use",
    description: "Practice practical skills across common tasks and situations.",
    accent: "#0F766E",
  },
  {
    id: "M3",
    title: "M3",
    subtitle: "Applied skills",
    description: "Work through longer prompts with grammar, listening, and more.",
    accent: "#EA580C",
  },
  {
    id: "M4",
    title: "M4",
    subtitle: "Advanced",
    description: "Challenge yourself with higher-level tests across multiple skills.",
    accent: "#BE123C",
  },
];

export function normalizeTestLevelId(
  value?: string | string[] | null,
): TestLevelId | null {
  const candidate = Array.isArray(value) ? value[0] : value;

  if (!candidate) {
    return null;
  }

  const normalized = candidate.toUpperCase();
  return TEST_LEVEL_IDS.find((levelId) => levelId === normalized) ?? null;
}
