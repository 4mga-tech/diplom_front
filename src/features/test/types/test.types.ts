export type TestType =
  | "vocabulary"
  | "grammar"
  | "listening"
  | "speaking"
  | "letter";

export type TestOption = {
  id: string;
  text: string;
};

export type TestQuestion = {
  id: string;
  levelId: string;
  testType: TestType;
  question: string;
  options: TestOption[];
  correctOptionId: string;
  explanation?: string;
};

export type TestSessionResult = {
  levelId: string;
  testType: TestType;
  total: number;
  correct: number;
  wrong: number;
  xpGained: number;
  percentage: number;
};
