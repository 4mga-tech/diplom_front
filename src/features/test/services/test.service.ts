import { mockGrammarTests } from "../data/mockGrammarTests";
import { mockLetterTests } from "../data/mockLetterTests";
import { mockListeningTests } from "../data/mockListeningTests";
import { mockSpeakingTests } from "../data/mockSpeakingTests";
import { mockVocabularyTests } from "../data/mockVocabularyTests";
import { TestQuestion, TestType } from "../types/test.types";

type TestMap = Record<string, TestQuestion[]>;

function getSourceByType(testType: TestType): TestMap {
  switch (testType) {
    case "vocabulary":
      return mockVocabularyTests;
    case "grammar":
      return mockGrammarTests;
    case "listening":
      return mockListeningTests;
    case "speaking":
      return mockSpeakingTests;
    case "letter":
      return mockLetterTests;
    default:
      return {};
  }
}

export const testService = {
  async getQuestions(
    levelId: string,
    testType: TestType,
  ): Promise<TestQuestion[]> {
    const source = getSourceByType(testType);
    return source[levelId] ?? [];
  },
};
