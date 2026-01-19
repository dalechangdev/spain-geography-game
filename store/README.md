# Quiz State Management

This directory contains Zustand stores for managing quiz state and user progress.

## Stores

### `quiz-store.ts` - Active Quiz State

Manages the state of an active quiz session.

**State:**
- Quiz ID, category, mode
- Questions and current index
- Score, answers, streak
- Start/end times
- Settings

**Actions:**
- `startQuiz(category, mode, questions, settings?)` - Start a new quiz
- `answerQuestion(userAnswer, timeTaken?, isValid?)` - Submit an answer
- `nextQuestion()` - Move to next question
- `skipQuestion()` - Skip current question
- `endQuiz()` - End the quiz
- `resetQuiz()` - Reset all state
- `updateSettings(settings)` - Update quiz settings

**Getters:**
- `getCurrentQuestion()` - Get current question
- `getProgress()` - Get progress percentage (0-100)
- `getAccuracy()` - Get accuracy percentage (0-100)
- `getTimeElapsed()` - Get total time elapsed in milliseconds
- `isComplete()` - Check if quiz is complete

### `progress-store.ts` - User Progress

Manages user's overall progress and statistics.

**State:**
- Total quizzes and questions
- Accuracy and best scores
- Category-specific statistics
- Study streak
- Achievements

**Actions:**
- `loadProgress()` - Load progress from AsyncStorage
- `saveProgress()` - Save progress to AsyncStorage
- `updateProgressFromQuiz(category, score, totalQuestions, correctAnswers)` - Update after quiz
- `updateStudyStreak()` - Update study streak
- `resetProgress()` - Reset all progress
- `getCategoryStats(category)` - Get stats for a category

## Usage

### Starting a Quiz

```tsx
import { useQuiz } from '@/hooks/useQuiz';
import { Question } from '@/types/geography';

function QuizScreen() {
  const quiz = useQuiz();

  const startNewQuiz = () => {
    const questions: Question[] = [
      // ... your questions
    ];

    quiz.startQuiz(
      'cities',
      'quiz',
      questions,
      {
        questionCount: 10,
        enableHints: true,
        difficulty: 2,
      }
    );
  };

  // ... rest of component
}
```

### Answering Questions

```tsx
function QuizScreen() {
  const quiz = useQuiz();

  // Multiple choice or name-that-place
  const handleAnswer = (locationId: string) => {
    const isCorrect = quiz.answerWithLocationId(locationId);
    // Show feedback, then proceed
    setTimeout(() => {
      quiz.proceedToNext();
    }, 2000);
  };

  // Point-and-identify (requires location data)
  const handleMapPress = (coordinates: [number, number], correctLocation: Location) => {
    const isCorrect = quiz.answerWithCoordinates(coordinates, correctLocation);
    // Show feedback
  };

  // ... rest of component
}
```

### Accessing Quiz State

```tsx
function QuizScreen() {
  const quiz = useQuiz();

  if (!quiz.isActive) {
    return <StartScreen onStart={handleStart} />;
  }

  return (
    <View>
      <Text>Score: {quiz.score}</Text>
      <Text>Streak: {quiz.streak}</Text>
      <Text>Progress: {quiz.progress}%</Text>
      <Text>Accuracy: {quiz.accuracy}%</Text>
      
      {quiz.currentQuestion && (
        <QuestionCard question={quiz.currentQuestion} />
      )}
    </View>
  );
}
```

### Accessing Progress

```tsx
import { useProgress } from '@/hooks/useProgress';

function ProgressScreen() {
  const progress = useProgress();

  return (
    <View>
      <Text>Total Quizzes: {progress.totalQuizzes}</Text>
      <Text>Overall Accuracy: {progress.overallAccuracy}%</Text>
      <Text>Best Score: {progress.bestScore}</Text>
      <Text>Study Streak: {progress.studyStreak} days</Text>
      
      {progress.getCategoryStats('cities') && (
        <CategoryStats stats={progress.getCategoryStats('cities')} />
      )}
    </View>
  );
}
```

## Scoring System

Points are calculated based on:
- **Base Points**: 10 points per correct answer
- **Difficulty Multiplier**: Based on question difficulty (0.5x to 2.5x)
- **Time Bonus**: Faster answers get bonus points (up to 5 points)
- **Streak Bonus**: Consecutive correct answers add bonus (up to 10 points)

Practice mode doesn't award points.

## Data Persistence

Progress is automatically saved to AsyncStorage when:
- A quiz is completed
- Study streak is updated
- Progress is manually saved

Progress is automatically loaded on app start.
