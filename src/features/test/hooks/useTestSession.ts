import { useEffect, useMemo, useState } from "react";

import { TestQuestion, TestSubmitPayload, TestType } from "../types/test.types";

export function useTestSession(
  questions: TestQuestion[],
  levelId: string,
  testType: TestType,
) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [answersByQuestionId, setAnswersByQuestionId] = useState<
    Record<string, string>
  >({});

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  const progress = useMemo(() => {
    if (!questions.length) return 0;
    return (currentIndex + 1) / questions.length;
  }, [currentIndex, questions.length]);

  useEffect(() => {
    if (!currentQuestion) {
      setSelectedOptionId(null);
      return;
    }

    setSelectedOptionId(answersByQuestionId[currentQuestion.id] ?? null);
  }, [answersByQuestionId, currentQuestion]);

  function selectOption(optionId: string) {
    setSelectedOptionId(optionId);
  }

  function clearSelectedOption() {
    setSelectedOptionId(null);
  }

  function buildAnswersMapWithCurrentSelection() {
    if (!currentQuestion || !selectedOptionId) {
      return null;
    }

    return {
      ...answersByQuestionId,
      [currentQuestion.id]: selectedOptionId,
    };
  }

  function saveCurrentAnswer() {
    const nextAnswersByQuestionId = buildAnswersMapWithCurrentSelection();

    if (!nextAnswersByQuestionId) {
      return null;
    }

    setAnswersByQuestionId(nextAnswersByQuestionId);

    return nextAnswersByQuestionId;
  }

  function goNext() {
    if (currentIndex >= questions.length - 1) return;

    setCurrentIndex((prev) => prev + 1);
  }
  function goPrevious() {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }
  function buildSubmitPayload(
    answersMap = answersByQuestionId,
  ): TestSubmitPayload {
    return {
      levelId,
      testType,
      answers: questions
        .map((question) => ({
          questionId: question.id,
          selectedOptionId: answersMap[question.id],
        }))
        .filter(
          (answer) =>
            typeof answer.selectedOptionId === "string" &&
            answer.selectedOptionId.length > 0,
        ),
    };
  }

  return {
    currentIndex,
    currentQuestion,
    selectedOptionId,
    answersByQuestionId,
    progress,
    isLastQuestion,
    selectOption,
    clearSelectedOption,
    saveCurrentAnswer,
    goNext,
    goPrevious,
    buildSubmitPayload,
    hasQuestions: questions.length > 0,
    totalQuestions: questions.length,
  };
}
