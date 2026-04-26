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
  explanation?: string;
};

export type TestAnswerSubmission = {
  questionId: string;
  answer: string;
};

export type TestSubmitPayload = {
  levelId: string;
  testType: TestType;
  answers: TestAnswerSubmission[];
};

export type TestSubmitResult = {
  levelId: string;
  testType: TestType;
  score: number;
  passed: boolean;
  correctCount: number;
  totalQuestions: number;
  xpGained: number;
};
