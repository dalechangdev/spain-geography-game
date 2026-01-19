import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  UserProgress, 
  CategoryStats, 
  QuizCategory 
} from '@/types/geography';

interface ProgressStoreState {
  // Progress data
  progress: UserProgress | null;
  isLoading: boolean;
  
  // Actions
  loadProgress: () => Promise<void>;
  saveProgress: () => Promise<void>;
  updateProgressFromQuiz: (
    category: QuizCategory,
    score: number,
    totalQuestions: number,
    correctAnswers: number
  ) => void;
  updateStudyStreak: () => void;
  resetProgress: () => Promise<void>;
  
  // Getters
  getCategoryStats: (category: QuizCategory) => CategoryStats | null;
}

const STORAGE_KEY = '@spain_geography_progress';

const initialCategoryStats: CategoryStats = {
  quizzesCompleted: 0,
  questionsAnswered: 0,
  correctAnswers: 0,
  accuracy: 0,
  bestScore: 0,
  averageScore: 0,
};

const initialProgress: UserProgress = {
  totalQuizzes: 0,
  totalQuestions: 0,
  correctAnswers: 0,
  accuracy: 0,
  bestScore: 0,
  categoryStats: {
    'autonomous-regions': { ...initialCategoryStats },
    'provinces': { ...initialCategoryStats },
    'cities': { ...initialCategoryStats },
    'municipalities': { ...initialCategoryStats },
    'rivers': { ...initialCategoryStats },
    'mountain-ranges': { ...initialCategoryStats },
    'mountains': { ...initialCategoryStats },
    'lakes': { ...initialCategoryStats },
    'islands': { ...initialCategoryStats },
    'coastlines': { ...initialCategoryStats },
  },
  achievements: [],
  studyStreak: 0,
  lastStudyDate: 0,
};

export const useProgressStore = create<ProgressStoreState>((set, get) => ({
  progress: null,
  isLoading: false,

  /**
   * Load progress from AsyncStorage
   */
  loadProgress: async () => {
    set({ isLoading: true });
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const progress = JSON.parse(data) as UserProgress;
        set({ progress, isLoading: false });
      } else {
        // Initialize with default progress
        set({ progress: initialProgress, isLoading: false });
        await get().saveProgress();
      }
    } catch (error) {
      console.error('Error loading progress:', error);
      set({ progress: initialProgress, isLoading: false });
    }
  },

  /**
   * Save progress to AsyncStorage
   */
  saveProgress: async () => {
    const state = get();
    if (!state.progress) return;

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state.progress));
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  },

  /**
   * Update progress after completing a quiz
   */
  updateProgressFromQuiz: (category, score, totalQuestions, correctAnswers) => {
    const state = get();
    if (!state.progress) return;

    const categoryStats = state.progress.categoryStats[category] || { ...initialCategoryStats };
    
    // Update category stats
    const newQuizzesCompleted = categoryStats.quizzesCompleted + 1;
    const newQuestionsAnswered = categoryStats.questionsAnswered + totalQuestions;
    const newCorrectAnswers = categoryStats.correctAnswers + correctAnswers;
    const newAccuracy = (newCorrectAnswers / newQuestionsAnswered) * 100;
    const newAverageScore = 
      (categoryStats.averageScore * (newQuizzesCompleted - 1) + score) / newQuizzesCompleted;
    
    const updatedCategoryStats: CategoryStats = {
      quizzesCompleted: newQuizzesCompleted,
      questionsAnswered: newQuestionsAnswered,
      correctAnswers: newCorrectAnswers,
      accuracy: newAccuracy,
      bestScore: Math.max(categoryStats.bestScore, score),
      averageScore: newAverageScore,
    };

    // Update overall stats
    const totalQuizzes = state.progress.totalQuizzes + 1;
    const totalQuestions = state.progress.totalQuestions + totalQuestions;
    const overallCorrectAnswers = state.progress.correctAnswers + correctAnswers;
    const overallAccuracy = (overallCorrectAnswers / totalQuestions) * 100;

    const updatedProgress: UserProgress = {
      ...state.progress,
      totalQuizzes,
      totalQuestions,
      correctAnswers: overallCorrectAnswers,
      accuracy: overallAccuracy,
      bestScore: Math.max(state.progress.bestScore, score),
      categoryStats: {
        ...state.progress.categoryStats,
        [category]: updatedCategoryStats,
      },
    };

    set({ progress: updatedProgress });
    get().saveProgress();
  },

  /**
   * Update study streak
   */
  updateStudyStreak: () => {
    const state = get();
    if (!state.progress) return;

    const now = Date.now();
    const lastStudyDate = state.progress.lastStudyDate;
    const oneDayMs = 24 * 60 * 60 * 1000;

    let newStreak = state.progress.studyStreak;

    if (lastStudyDate === 0) {
      // First study session
      newStreak = 1;
    } else {
      const daysSinceLastStudy = Math.floor((now - lastStudyDate) / oneDayMs);
      
      if (daysSinceLastStudy === 0) {
        // Same day, don't increment
        newStreak = state.progress.studyStreak;
      } else if (daysSinceLastStudy === 1) {
        // Consecutive day
        newStreak = state.progress.studyStreak + 1;
      } else {
        // Streak broken
        newStreak = 1;
      }
    }

    const updatedProgress: UserProgress = {
      ...state.progress,
      studyStreak: newStreak,
      lastStudyDate: now,
    };

    set({ progress: updatedProgress });
    get().saveProgress();
  },

  /**
   * Get stats for a specific category
   */
  getCategoryStats: (category) => {
    const state = get();
    if (!state.progress) return null;
    return state.progress.categoryStats[category] || null;
  },

  /**
   * Reset all progress
   */
  resetProgress: async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      set({ progress: initialProgress });
      await get().saveProgress();
    } catch (error) {
      console.error('Error resetting progress:', error);
    }
  },
}));
