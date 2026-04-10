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

export const UNITS: Unit[] = [
  {
    id: "m1-u1",
    levelId: "M1",
    title: "M1 Unit 1",
    subtitle: "Beginning of basic words",
    lessonsCount: 8,
    progress: 0,
    gradient: ["#7C3AED", "#EC4899"],
    locked: false,
  },
  {
    id: "m2-u1",
    levelId: "M2",
    title: "M2 Unit 1",
    subtitle: "Travel, routines, and short dialogue practice",
    lessonsCount: 3,
    progress: 0,
    gradient: ["#16A34A", "#14B8A6"],
    locked: false,
  },
];

export const LESSONS: Lesson[] = [
  {
    id: "b1-u1-l1",
    unitId: "m1-u1",
    title: "cryllic letter",
    subtitle: "M1 starting words",
    xp: 10,
    done: true,
    locked: false,
  },
  {
    id: "m1-u1-l1",
    unitId: "m1-u1",
    title: "Vocabulary Basics",
    subtitle: "M1 starting words",
    xp: 20,
    done: false,
    locked: false,
  },
  {
    id: "m2-u1-l1",
    unitId: "m2-u1",
    title: "Travel Vocabulary",
    subtitle: "Useful words for stations, tickets, and directions",
    xp: 30,
    done: false,
    locked: false,
  },
  {
    id: "m2-u1-l2",
    unitId: "m2-u1",
    title: "Daily Routine Phrases",
    subtitle: "Talk about what you do in the morning and evening",
    xp: 35,
    done: false,
    locked: true,
  },
  {
    id: "m2-u1-l3",
    unitId: "m2-u1",
    title: "Mini Conversation Drill",
    subtitle: "Read and respond to a short real-life dialogue",
    xp: 40,
    done: false,
    locked: true,
  },
  {
    id: "m2-legacy-l1",
    unitId: "m1-u1",
    title: "Vocabulary Basics",
    subtitle: "M2 sentences",
    xp: 30,
    done: false,
    locked: false,
  },
  {
    id: "m3-legacy-l1",
    unitId: "m1-u1",
    title: "Vocabulary Basics",
    subtitle: "M3 poetry",
    xp: 40,
    done: false,
    locked: false,
  },
];
export const getLevelById = (levelId: LevelId) =>
  LEVELS.find((level) => level.id === levelId);
