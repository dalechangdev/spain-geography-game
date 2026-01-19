import { create } from 'zustand';
import { Question, Answer, QuizCategory, QuizMode, QuizSettings } from '@/types/geography';

interface QuizStoreState {
  // Quiz state
  quizId: string | null;
  category: QuizCategory | null;
  mode: QuizMode | null;
  questions: Question[];
  currentIndex: number;
  score: number;
  answers: Answer[];
  startTime: number | null;
  endTime: number | null;
  isActive: boolean;
  streak: number;
  bestStreak: number;
  currentQuestionStartTime: number | null;
  
  // Settings
  settings: QuizSettings;
  
  // Actions
  startQuiz: (
    category: QuizCategory,
    mode: QuizMode,
    questions: Question[],
    settings?: Partial<QuizSettings>
  ) => void;
  answerQuestion: (
    userAnswer: string | [number, number], // Location ID or coordinates
    timeTaken?: number,
    isValid?: boolean // Pre-validated result for point-and-identify
  ) => boolean;
  nextQuestion: () => void;
  endQuiz: () => void;
  resetQuiz: () => void;
  skipQuestion: () => void;
  updateSettings: (settings: Partial<QuizSettings>) => void;
  
  // Getters
  getCurrentQuestion: () => Question | null;
  getProgress: () => number; // 0-100
  getAccuracy: () => number; // 0-100
  getTimeElapsed: () => number; // milliseconds
  isComplete: () => boolean;
}

const defaultSettings: QuizSettings = {
  questionCount: 10,
  timeLimit: undefined,
  enableHints: true,
  enableSounds: false,
  enableHaptics: true,
  difficulty: 2,
};

const initialState = {
  quizId: null,
  category: null,
  mode: null,
  questions: [],
  currentIndex: 0,
  score: 0,
  answers: [],
  startTime: null,
  endTime: null,
  isActive: false,
  streak: 0,
  bestStreak: 0,
  currentQuestionStartTime: null,
  settings: defaultSettings,
};

export const useQuizStore = create<QuizStoreState>((set, get) => ({
  ...initialState,

  /**
   * Start a new quiz
   */
  startQuiz: (category, mode, questions, settings) => {
    const quizId = `quiz-${Date.now()}`;
    const startTime = Date.now();
    const questionStartTime = Date.now();
    
    set({
      quizId,
      category,
      mode,
      questions,
      currentIndex: 0,
      score: 0,
      answers: [],
      startTime,
      endTime: null,
      isActive: true,
      streak: 0,
      bestStreak: 0,
      currentQuestionStartTime: questionStartTime,
      settings: { ...defaultSettings, ...settings },
    });
  },

  /**
   * Submit an answer to the current question
   * Returns true if correct, false otherwise
   */
  answerQuestion: (userAnswer, timeTaken, isValid) => {
    const state = get();
    if (!state.isActive || state.questions.length === 0) {
      return false;
    }

    const currentQuestion = state.questions[state.currentIndex];
    if (!currentQuestion) {
      return false;
    }

    // Calculate time taken if not provided
    const questionTime = timeTaken || 
      (state.currentQuestionStartTime 
        ? Date.now() - state.currentQuestionStartTime 
        : 0);

    // Validate answer based on question type
    let isCorrect = false;
    let normalizedAnswer = '';

    if (currentQuestion.type === 'point-and-identify') {
      // For point-and-identify, validation is done in the hook with location data
      // If isValid is provided, use it; otherwise check if userAnswer matches correctAnswer
      if (isValid !== undefined) {
        isCorrect = isValid;
      } else {
        // Fallback: if answer is already validated and passed as location ID
        normalizedAnswer = typeof userAnswer === 'string' ? userAnswer : JSON.stringify(userAnswer);
        isCorrect = normalizedAnswer === currentQuestion.correctAnswer;
      }
      
      // Store coordinates or location ID
      normalizedAnswer = Array.isArray(userAnswer) 
        ? JSON.stringify(userAnswer) 
        : (typeof userAnswer === 'string' ? userAnswer : JSON.stringify(userAnswer));
    } else {
      // For multiple-choice or name-that-place, userAnswer is a location ID
      normalizedAnswer = typeof userAnswer === 'string' ? userAnswer : JSON.stringify(userAnswer);
      isCorrect = normalizedAnswer === currentQuestion.correctAnswer;
    }

    // Calculate score (if not practice mode)
    let pointsEarned = 0;
    if (state.mode !== 'practice' && isCorrect) {
      const basePoints = 10;
      const difficultyMultiplier = currentQuestion.difficulty / 2; // 0.5 to 2.5
      const timeBonus = calculateTimeBonus(questionTime, currentQuestion.difficulty);
      const streakBonus = state.streak > 0 ? Math.min(state.streak * 2, 10) : 0;
      
      pointsEarned = Math.round(
        basePoints * difficultyMultiplier + timeBonus + streakBonus
      );
    }

    // Create answer record
    const answer: Answer = {
      questionId: currentQuestion.id,
      userAnswer: normalizedAnswer,
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect,
      timeTaken: questionTime,
      timestamp: Date.now(),
    };

    // Update state
    const newStreak = isCorrect ? state.streak + 1 : 0;
    const newBestStreak = Math.max(state.bestStreak, newStreak);

    set({
      answers: [...state.answers, answer],
      score: state.score + pointsEarned,
      streak: newStreak,
      bestStreak: newBestStreak,
    });

    return isCorrect;
  },

  /**
   * Move to the next question
   */
  nextQuestion: () => {
    const state = get();
    if (!state.isActive) return;

    const nextIndex = state.currentIndex + 1;
    
    if (nextIndex >= state.questions.length) {
      // Quiz is complete
      get().endQuiz();
    } else {
      set({
        currentIndex: nextIndex,
        currentQuestionStartTime: Date.now(),
      });
    }
  },

  /**
   * Skip the current question (no points, no answer recorded)
   */
  skipQuestion: () => {
    const state = get();
    if (!state.isActive) return;

    // Break streak on skip
    set({
      streak: 0,
    });

    get().nextQuestion();
  },

  /**
   * End the quiz
   */
  endQuiz: () => {
    const state = get();
    if (!state.isActive) return;

    set({
      isActive: false,
      endTime: Date.now(),
    });
  },

  /**
   * Reset quiz state
   */
  resetQuiz: () => {
    set(initialState);
  },

  /**
   * Update quiz settings
   */
  updateSettings: (newSettings) => {
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    }));
  },

  /**
   * Get current question
   */
  getCurrentQuestion: () => {
    const state = get();
    if (!state.isActive || state.questions.length === 0) {
      return null;
    }
    return state.questions[state.currentIndex] || null;
  },

  /**
   * Get progress percentage (0-100)
   */
  getProgress: () => {
    const state = get();
    if (state.questions.length === 0) return 0;
    return Math.round(((state.currentIndex + 1) / state.questions.length) * 100);
  },

  /**
   * Get accuracy percentage (0-100)
   */
  getAccuracy: () => {
    const state = get();
    if (state.answers.length === 0) return 0;
    const correctCount = state.answers.filter((a) => a.isCorrect).length;
    return Math.round((correctCount / state.answers.length) * 100);
  },

  /**
   * Get total time elapsed in milliseconds
   */
  getTimeElapsed: () => {
    const state = get();
    if (!state.startTime) return 0;
    const endTime = state.endTime || Date.now();
    return endTime - state.startTime;
  },

  /**
   * Check if quiz is complete
   */
  isComplete: () => {
    const state = get();
    return !state.isActive && state.endTime !== null;
  },
}));

/**
 * Calculate time bonus points
 * Faster answers get more bonus points
 */
function calculateTimeBonus(timeMs: number, difficulty: number): number {
  // Base time limits in milliseconds (more time for harder questions)
  const timeLimits = {
    1: 30000, // 30 seconds for easy
    2: 45000, // 45 seconds for medium
    3: 60000, // 60 seconds for hard
    4: 75000, // 75 seconds for very hard
    5: 90000, // 90 seconds for expert
  };

  const limit = timeLimits[difficulty as keyof typeof timeLimits] || 60000;
  
  if (timeMs <= limit / 3) {
    return 5; // Very fast
  } else if (timeMs <= limit / 2) {
    return 3; // Fast
  } else if (timeMs <= limit) {
    return 1; // Within limit
  }
  
  return 0; // Over limit, no bonus
}
