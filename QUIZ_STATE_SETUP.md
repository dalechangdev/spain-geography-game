# Quiz State Management Setup

Basic quiz state management has been set up using Zustand. Here's what you need to do to use it.

## Install Dependencies

First, install the required packages:

```bash
npm install zustand @react-native-async-storage/async-storage
```

Or with Expo:

```bash
npx expo install @react-native-async-storage/async-storage
npm install zustand
```

## What's Been Created

### Stores (`store/`)

1. **`quiz-store.ts`** - Active quiz state management
   - Manages current quiz session (questions, answers, score, streak)
   - Handles quiz flow (start, answer, next, end)
   - Calculates scores with difficulty multipliers and bonuses

2. **`progress-store.ts`** - User progress tracking
   - Saves progress to AsyncStorage
   - Tracks statistics by category
   - Manages study streaks

### Hooks (`hooks/`)

1. **`useQuiz.ts`** - Main quiz hook
   - Provides easy access to quiz state and actions
   - Handles answer validation for different question types
   - Automatically saves progress when quiz completes

2. **`useProgress.ts`** - Progress hook
   - Loads and manages user progress
   - Provides category-specific statistics
   - Updates study streaks

### Utilities (`utils/`)

1. **`quiz-generator.ts`** - Question generation utilities
   - Generate questions from location data
   - Create multiple choice options
   - Handle different question types

## Quick Start

### Starting a Quiz

```tsx
import { useQuiz } from '@/hooks/useQuiz';
import { Question } from '@/types/geography';

function MyQuizScreen() {
  const quiz = useQuiz();

  const start = () => {
    const questions: Question[] = [
      // Your questions here
    ];

    quiz.startQuiz('cities', 'quiz', questions, {
      questionCount: 10,
      enableHints: true,
      difficulty: 2,
    });
  };

  // ... rest of component
}
```

### Answering Questions

```tsx
// Multiple choice
const handleAnswer = (locationId: string) => {
  const isCorrect = quiz.answerWithLocationId(locationId);
  if (isCorrect) {
    console.log('Correct!');
  }
  quiz.proceedToNext();
};

// Point-and-identify (on map)
const handleMapPress = (coords: { latitude: number; longitude: number }) => {
  const coordinates: [number, number] = [coords.longitude, coords.latitude];
  // You'll need the correct location data
  const isCorrect = quiz.answerWithCoordinates(coordinates, correctLocation);
  quiz.proceedToNext();
};
```

### Accessing Quiz State

```tsx
const quiz = useQuiz();

// Quiz state
quiz.isActive           // boolean
quiz.currentQuestion    // Question | null
quiz.score              // number
quiz.streak             // number
quiz.progress           // 0-100
quiz.accuracy           // 0-100

// Quiz actions
quiz.startQuiz(...)
quiz.answerWithLocationId(...)
quiz.answerWithCoordinates(...)
quiz.proceedToNext()
quiz.skip()
quiz.endQuiz()
quiz.reset()
```

### Accessing Progress

```tsx
import { useProgress } from '@/hooks/useProgress';

function ProgressScreen() {
  const progress = useProgress();

  return (
    <View>
      <Text>Total Quizzes: {progress.totalQuizzes}</Text>
      <Text>Accuracy: {progress.overallAccuracy}%</Text>
      <Text>Streak: {progress.studyStreak} days</Text>
    </View>
  );
}
```

## Example Usage

See `examples/quiz-usage.example.tsx` for complete examples of:
- Starting and playing a quiz
- Handling different question types
- Displaying results
- Showing progress statistics

## Next Steps

1. Install dependencies (see above)
2. Load question data from your data files
3. Create quiz UI components (QuestionCard, AnswerOptions, etc.)
4. Connect the map component to quiz state
5. Build quiz flow screens

## Notes

- Progress is automatically saved to AsyncStorage
- Quiz state is reset when app restarts (only progress persists)
- Scoring is disabled in practice mode
- Point-and-identify questions require location data for validation

For more details, see `store/README.md`.
