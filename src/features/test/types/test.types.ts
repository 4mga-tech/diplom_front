export type TestType =
  | "vocabulary"
  | "grammar"
  | "listening"
  | "speaking";

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
    correctOptionId: string;

};

export type TestAnswerSubmission = {
  questionId: string;
  selectedOptionId: string;
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
  totalXp?: number;
};

export type TestLevelSummary = {
  levelId: string;
  title: string;
  activeTypes: Extract<TestType, "vocabulary" | "grammar">[];
  questionCounts: {
    vocabulary: number;
    grammar: number;
  };
};

export type TestTypeAvailability = {
  testType: TestType;
  title: string;
  active: boolean;
  status: "available" | "coming_soon";
  questionCount: number;
};

export type TestTypeAvailabilityResponse = {
  levelId: string;
  types: TestTypeAvailability[];
};

export type TestQuestionSet = {
  levelId: string;
  testType: TestType;
  title: string;
  passingScore: number;
  totalQuestions: number;
  questions: TestQuestion[];
};
