/**
 * TypeScript type definitions for Spain Geography Quiz App
 */

import { GeoJSON } from 'geojson';

/**
 * Quiz categories
 */
export type QuizCategory =
  | 'autonomous-regions'
  | 'provinces'
  | 'cities'
  | 'municipalities'
  | 'rivers'
  | 'mountain-ranges'
  | 'mountains'
  | 'lakes'
  | 'islands'
  | 'coastlines';

/**
 * Location types
 */
export type LocationType =
  | 'city'
  | 'region'
  | 'province'
  | 'municipality'
  | 'river'
  | 'mountain'
  | 'mountain-range'
  | 'lake'
  | 'island'
  | 'cape'
  | 'coastline';

/**
 * Quiz modes
 */
export type QuizMode = 'practice' | 'quiz' | 'challenge' | 'study';

/**
 * Question types
 */
export type QuestionType =
  | 'multiple-choice'
  | 'point-and-identify'
  | 'name-that-place';

/**
 * Difficulty levels
 */
export type Difficulty = 1 | 2 | 3 | 4 | 5;

/**
 * Location data structure
 */
export interface Location {
  id: string;
  name: string;
  nameEs: string; // Spanish name
  type: LocationType;
  coordinates: [number, number]; // [longitude, latitude]
  geojson?: GeoJSON.Feature; // Optional: for complex shapes (regions, rivers)
  region?: string; // Which autonomous region (id)
  province?: string; // Which province (id)
  metadata?: {
    population?: number;
    elevation?: number;
    length?: number; // For rivers
    area?: number; // For lakes/regions (km²)
    highestPeak?: string; // For mountain ranges
  };
  aliases?: string[]; // Alternative names for matching
}

/**
 * Question data structure
 */
export interface Question {
  id: string;
  category: QuizCategory;
  type: QuestionType;
  question: string;
  questionEs?: string; // Spanish translation
  correctAnswer: string; // Location ID
  options?: string[]; // For multiple choice (location IDs)
  difficulty: Difficulty;
  hint?: string;
  hintEs?: string;
  coordinates: [number, number]; // Where to show marker/focus
  zoomLevel?: number; // Suggested zoom level
  tolerance?: number; // Distance tolerance in meters (for point-and-identify)
}

/**
 * Answer submitted by user
 */
export interface Answer {
  questionId: string;
  userAnswer: string; // Location ID or coordinates
  correctAnswer: string;
  isCorrect: boolean;
  timeTaken: number; // milliseconds
  timestamp: number;
}

/**
 * Quiz state
 */
export interface QuizState {
  id: string;
  category: QuizCategory;
  mode: QuizMode;
  questions: Question[];
  currentIndex: number;
  score: number;
  answers: Answer[];
  startTime: number;
  endTime?: number;
  isActive: boolean;
  streak: number; // Consecutive correct answers
  bestStreak: number;
}

/**
 * User progress
 */
export interface UserProgress {
  totalQuizzes: number;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number; // percentage
  bestScore: number;
  categoryStats: Record<QuizCategory, CategoryStats>;
  achievements: string[];
  studyStreak: number;
  lastStudyDate: number;
}

/**
 * Category-specific statistics
 */
export interface CategoryStats {
  quizzesCompleted: number;
  questionsAnswered: number;
  correctAnswers: number;
  accuracy: number;
  bestScore: number;
  averageScore: number;
}

/**
 * Map configuration
 */
export interface MapConfig {
  initialCenter: [number, number]; // [longitude, latitude]
  initialZoom: number;
  minZoom: number;
  maxZoom: number;
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

/**
 * Achievement data
 */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: number;
  progress?: number;
  maxProgress?: number;
}

/**
 * Quiz settings
 */
export interface QuizSettings {
  questionCount: number; // 10, 20, 30, etc.
  timeLimit?: number; // seconds per question (optional)
  enableHints: boolean;
  enableSounds: boolean;
  enableHaptics: boolean;
  difficulty: Difficulty;
}
