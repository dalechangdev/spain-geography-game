import { useEffect } from 'react';
import { useProgressStore } from '@/store/progress-store';
import { QuizCategory } from '@/types/geography';

/**
 * Hook for accessing user progress and statistics
 */
export function useProgress() {
  const progressStore = useProgressStore();

  // Load progress on mount
  useEffect(() => {
    progressStore.loadProgress();
  }, [progressStore]);

  /**
   * Get stats for a specific category
   */
  const getCategoryStats = (category: QuizCategory) => {
    return progressStore.getCategoryStats(category);
  };

  /**
   * Update study streak
   */
  const updateStreak = () => {
    progressStore.updateStudyStreak();
  };

  return {
    // State
    progress: progressStore.progress,
    isLoading: progressStore.isLoading,

    // Actions
    refresh: progressStore.loadProgress,
    save: progressStore.saveProgress,
    updateStreak,
    getCategoryStats,
    reset: progressStore.resetProgress,

    // Convenience getters
    totalQuizzes: progressStore.progress?.totalQuizzes || 0,
    totalQuestions: progressStore.progress?.totalQuestions || 0,
    overallAccuracy: progressStore.progress?.accuracy || 0,
    bestScore: progressStore.progress?.bestScore || 0,
    studyStreak: progressStore.progress?.studyStreak || 0,
    achievements: progressStore.progress?.achievements || [],
  };
}
