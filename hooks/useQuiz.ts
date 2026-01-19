import { useEffect, useCallback } from 'react';
import { useQuizStore } from '@/store/quiz-store';
import { useProgressStore } from '@/store/progress-store';
import { Location } from '@/types/geography';
import { validatePointAnswer } from '@/utils/geography';

/**
 * Main hook for quiz functionality
 * 
 * Provides access to quiz state and actions, with helper methods
 * for answering questions and managing quiz flow.
 */
export function useQuiz() {
  const quizState = useQuizStore();
  const { updateProgressFromQuiz, updateStudyStreak } = useProgressStore();

  /**
   * Get current question
   */
  const currentQuestion = quizState.getCurrentQuestion();

  /**
   * Answer a multiple-choice or name-that-place question
   */
  const answerWithLocationId = useCallback(
    (locationId: string) => {
      return quizState.answerQuestion(locationId);
    },
    [quizState]
  );

  /**
   * Answer a point-and-identify question with coordinates
   * Requires the correct location data for validation
   */
  const answerWithCoordinates = useCallback(
    (
      coordinates: [number, number], // [longitude, latitude]
      correctLocation: Location
    ) => {
      // Validate the answer
      const isCorrect = validatePointAnswer(
        coordinates,
        correctLocation,
        currentQuestion?.tolerance
      );

      // Record the answer with validation result
      // Pass coordinates and the validation result
      return quizState.answerQuestion(
        coordinates,
        undefined, // Time will be auto-calculated
        isCorrect
      );
    },
    [quizState, currentQuestion]
  );

  /**
   * Move to next question after showing feedback
   */
  const proceedToNext = useCallback(() => {
    quizState.nextQuestion();
  }, [quizState]);

  /**
   * Skip current question
   */
  const skip = useCallback(() => {
    quizState.skipQuestion();
  }, [quizState]);

  /**
   * End quiz early
   */
  const endQuiz = useCallback(() => {
    quizState.endQuiz();
  }, [quizState]);

  /**
   * Reset quiz state
   */
  const reset = useCallback(() => {
    quizState.resetQuiz();
  }, [quizState]);

  /**
   * Save progress when quiz ends
   */
  useEffect(() => {
    if (quizState.isComplete() && quizState.category && quizState.answers.length > 0) {
      const correctAnswers = quizState.answers.filter((a) => a.isCorrect).length;
      
      // Update progress
      updateProgressFromQuiz(
        quizState.category,
        quizState.score,
        quizState.questions.length,
        correctAnswers
      );

      // Update study streak
      updateStudyStreak();
    }
  }, [
    quizState.isComplete(),
    quizState.category,
    quizState.score,
    quizState.answers,
    quizState.questions.length,
    updateProgressFromQuiz,
    updateStudyStreak,
  ]);

  return {
    // State
    quizId: quizState.quizId,
    category: quizState.category,
    mode: quizState.mode,
    currentQuestion,
    currentIndex: quizState.currentIndex,
    totalQuestions: quizState.questions.length,
    score: quizState.score,
    answers: quizState.answers,
    streak: quizState.streak,
    bestStreak: quizState.bestStreak,
    isActive: quizState.isActive,
    isComplete: quizState.isComplete(),
    progress: quizState.getProgress(),
    accuracy: quizState.getAccuracy(),
    timeElapsed: quizState.getTimeElapsed(),
    settings: quizState.settings,

    // Actions
    startQuiz: quizState.startQuiz,
    answerWithLocationId,
    answerWithCoordinates,
    proceedToNext,
    skip,
    endQuiz,
    reset,
    updateSettings: quizState.updateSettings,
  };
}
