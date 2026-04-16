export type LevelId = "B1" | "M1" | "M2" | "M3";

export type Level = {
  id: LevelId;
  title: string;
  subtitle: string;
  description: string;
  vocabularyReady: boolean;
  vocabularyCount: number;
  gradient: [string, string];
};

export type Unit = {
  id: string;
  levelId: LevelId;
  title: string;
  subtitle: string;
  lessonsCount: number;
  progress: number;
  gradient: [string, string];
  locked?: boolean;
};
export type Lesson = {
  id: string;
  unitId: string;
  title: string;
  subtitle: string;
  xp: number;
  done?: boolean;
  locked?: boolean;
};
export const LEVELS: Level[] = [
  {
    id: "B1",
    title: "B1",
    subtitle: "Starter",
    description: "Letters, sounds, and basics",
    vocabularyReady: false,
    vocabularyCount: 0,
    gradient: ["#2563EB", "#06B6D4"],
  },
  {
    id: "M1",
    title: "M1",
    subtitle: "Foundation",
    description: "Beginners",
    vocabularyReady: true,
    vocabularyCount: 731,
    gradient: ["#7C3AED", "#EC4899"],
  },
  {
    id: "M2",
    title: "M2",
    subtitle: "Pre-Intermediate",
    description: "Pre-Intermediate",
    vocabularyReady: false,
    vocabularyCount: 0,
    gradient: ["#16A34A", "#14B8A6"],
  },
  {
    id: "M3",
    title: "M3",
    subtitle: "Intermediate",
    description: "Intermediate",
    vocabularyReady: false,
    vocabularyCount: 0,
    gradient: ["#F59E0B", "#EF4444"],
  },
];

export const getLevelById = (levelId: LevelId) =>
  LEVELS.find((level) => level.id === levelId);
