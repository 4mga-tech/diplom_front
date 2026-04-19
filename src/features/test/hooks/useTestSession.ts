import { useMemo, useState } from "react";
import { TestQuestion, TestSessionResult } from "../types/test.types";
import { calculatePercentage, calculateXp } from "../utils/testHelper";
export function useTestSession(
  questions: TestQuestion[],
  levelId: string,
  testType: TestSessionResult["testType"],
) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  const progress = useMemo(() => {
    if (!questions.length) return 0;
    return (currentIndex + 1) / questions.length;
  }, [currentIndex, questions.length]);

  function selectOption(optionId: string) {
    setSelectedOptionId(optionId);
  }

  function submitAnswer() {
    if (!currentQuestion || !selectedOptionId) return false;

    const isCorrect = selectedOptionId === currentQuestion.correctOptionId;

    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: selectedOptionId,
    }));

    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
    }

    return true;
  }

  function goNext() {
    if (currentIndex >= questions.length - 1) return;

    setSelectedOptionId(null);
    setCurrentIndex((prev) => prev + 1);
  }

  function buildResult(): TestSessionResult {
    const total = questions.length;
    const wrong = total - correctCount;

    return {
      levelId,
      testType,
      total,
      correct: correctCount,
      wrong,
      xpGained: calculateXp(correctCount),
      percentage: calculatePercentage(correctCount, total),
    };
  }

  return {
    currentIndex,
    currentQuestion,
    selectedOptionId,
    correctCount,
    progress,
    isLastQuestion,
    selectOption,
    submitAnswer,
    goNext,
    buildResult,
    hasQuestions: questions.length > 0,
    totalQuestions: questions.length,
  };
}
