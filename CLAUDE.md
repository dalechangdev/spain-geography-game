# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Before ingesting the rest of this file, keep the following in mind:

- Don't assume. Don't hide confusion. Surface tradeoffs
- Minimum code that solves the problem. Nothing speculative
- Touch only what you must. Clean up only your own mess
- Define success criteria. Loop until verified

## Project Overview

Spain Geography Quiz is an Expo-based React Native app for learning Spanish geography through interactive map-based quizzes. Users can quiz themselves on autonomous regions, provinces, cities, rivers, mountains, and other geographic features via multiple-choice, point-and-identify, and name-that-place question types.

Uses **MapLibre GL** for the map component, **Zustand** for state management, and **TypeScript** for type safety. Data is stored as GeoJSON files in `data/` and location metadata in JSON.

## Development Commands

- **Start dev server**: `npm start` → Opens Expo menu; press `i` for iOS, `a` for Android, `w` for web
- **Lint**: `npm run lint`
- **iOS build**: `npm run ios`
- **Android build**: `npm run android`
- **Web dev**: `npm run web`
- **Reset project**: `npm run reset-project` → Backs up starter code to `app-example/`

## Project Structure

### Key Directories

- **`app/`**: Expo Router file-based routing (entry points)
- **`components/map/`**: Map components (SpainMapView, MapControls, MapLayers, QuizMarker)
- **`store/`**: Zustand stores for quiz and progress state
- **`hooks/`**: Custom React hooks (useQuiz, useProgress)
- **`utils/`**: Utilities like quiz-generator and geography helpers
- **`data/`**: GeoJSON administrative boundaries (admin-0 through admin-4), example locations, and example questions
- **`constants/`**: Map config (zoom levels, tolerances, bounds)
- **`types/`**: TypeScript definitions in `geography.ts`

### Data Files

- **`data/spain-administrative-*.json`**: GeoJSON files for different administrative levels (0=country, 1=regions, 2=provinces, 3=?, 4=municipalities)
- **`data/example-locations.json`**: Sample location coordinates with metadata
- **`data/example-questions.json`**: Pre-generated questions for testing
- Keep GeoJSON files in `data/geojson/` with a naming pattern like `autonomous-regions.json`, `provinces.json`, etc. See DATA_SOURCES.md for where to source this.

## Architecture & Key Patterns

### State Management

Uses **Zustand** for two main stores:

- **`store/quiz-store.ts`** (useQuizStore): Manages active quiz—current question, score, answers, streaks. Call `startQuiz()` with questions, then `answerQuestion()` to submit answers. Quiz state includes scoring logic (base 10 points × difficulty multiplier + time bonus + streak bonus).
- **`store/progress-store.ts`** (useProgressStore): Tracks user progress—total quizzes, accuracy, category stats, achievements, study streaks. Loads/saves from AsyncStorage.

### Quiz Flow

1. Generate or fetch `Question[]` from data
2. Call `useQuizStore.startQuiz(category, mode, questions, settings)`
3. Render current question via `getCurrentQuestion()`
4. On answer: call `answerQuestion(userAnswer, timeTaken?, isValid?)`
   - For point-and-identify, pass coordinates and set `isValid` based on distance check
   - Returns boolean (correct/incorrect)
5. Call `nextQuestion()` to advance; quiz auto-ends when all questions answered
6. On quiz complete, call `useProgressStore.addQuizResult()` to persist stats

### Question Generation

**`utils/quiz-generator.ts`** exports:

- `generateQuestionFromLocation()`: Creates a single Question from a Location
- `generateQuestions()`: Batch-creates multiple questions with progressive difficulty
- Auto-generates multiple-choice options, Spanish translations, hints, appropriate zoom levels, and distance tolerances

### Map Component (MapLibre)

**`components/map/index.ts`** exports SpainMapView (ref-forwarded) with:

- `ref.resetToSpain()`, `ref.zoomIn()`, `ref.zoomOut()` methods
- `onMapPress` callback with `{ latitude, longitude }`
- Props: `showUserLocation`, `mapType` ('standard', 'satellite', 'terrain')
- Renders GeoJSON layers via MapLayers component; quizMarkers via QuizMarker component
- Bounds: north 44, south 36, east 4.5, west -9.5; default zoom 5 shows all of Spain

See `constants/map.ts` for ZOOM_LEVELS and TOLERANCES (distance for validating point-and-identify answers).

## Type Definitions

**`types/geography.ts`** defines all core types:
mOut()` methods
- `onMapPress` callback with `{ latitude, longitude }`
- Props: `showUserLocation`, `mapType` ('standard', 'satellite', 'terrain')
- Renders GeoJSON layers via MapLayers component; quizMarkers via QuizMarker component
- Bounds: north 44, south 36, east 4.5, west -9.5; default zoom 5 shows all of Spain

See `constants/map.ts` for ZOOM_LEVELS and TOLERANCES (distance for validating point-and-identify answers).

## Type Definitions

**`types/geography.ts`** defines all core types:

- `QuizCategory`: 'autonomous-regions', 'provinces', 'cities', 'municipalities', 'rivers', 'mountain-ranges', 'mountains', 'lakes', 'islands', 'coastlines'
- `Location`: id, name, nameEs, type, coordinates [lon, lat], optional geojson (for polygons), region, province, metadata (population, elevation, etc.)
- `Question`: id, category, type ('multiple-choice' | 'point-and-identify' | 'name-that-place'), question text, correctAnswer (location id), options (for MC), difficulty 1–5, hint, coordinates, zoomLevel, tolerance (meters for point validation)
- `Answer`: what user submitted, correct answer, isCorrect boolean, timeTaken, timestamp
- `QuizMode`: 'practice' | 'quiz' | 'challenge' | 'study'

## Important Implementation Notes

1. **GeoJSON Loading**: Currently using static imports from data/. For large datasets, lazy-load by category or zoom level (see optimization notes in APP_DESIGN.md). Files at `data/spain-administrative-*.json`.

2. **Coordinate System**: Always [longitude, latitude] in code (GeoJSON standard), **not** [lat, lon]. MapLibre also uses [lon, lat].

3. **Scoring in Quiz Store**: Base 10 points, multiplied by (difficulty / 2), plus time bonus (0–5 points based on speed vs difficulty-specific time limit), plus streak bonus (min 2× streak capped at 10). Only applied in 'quiz' and 'challenge' modes; practice mode gives no points.

4. **Distance Validation**: Point-and-identify answers validated by comparing user tap to correct location's coordinates. Tolerance depends on category (e.g., 100km for regions, 5km for mountains). See `getToleranceForCategory()` in utils/quiz-generator.ts.

5. **Async Storage**: Progress persists via `@react-native-async-storage/async-storage`. useProgressStore handles save/load. Keep in mind Expo apps don't persist across reinstall.

6. **Haptics & Sounds**: Quiz store has settings flags (`enableHaptics`, `enableSounds`) but don't require these dependencies; they're optional enhancements. expo-haptics is already in package.json.

7. **Map Library**: Using **@maplibre/maplibre-react-native** (not Google Maps), an open-source alternative. See components/map/README.md for integration details.

## Testing & Debugging

- **Test a quiz locally**: See `examples/quiz-usage.example.tsx` for pattern
- **Validate GeoJSON**: Use geojsonlint.com or `npm install -g @mapbox/geojsonhint && geojsonhint file.json`
- **Simplify large GeoJSON**: `mapshaper file.json -simplify 10% -o out.json`
- **Check Expo logs**: `npx expo start` and check the CLI output for errors

## Additional Documentation

- **APP_DESIGN.md**: Full design spec—features, quiz types, game modes, UI layout, user flow
- **IMPLEMENTATION_GUIDE.md**: Step-by-step setup and data collection workflow
- **DATA_SOURCES.md**: Where to source GeoJSON data (GADM, Natural Earth, OpenStreetMap, GeoNames)
- **QUIZ_STATE_SETUP.md**: Deep dive into quiz state management and initialization

## Common Patterns

- **Fetch locations and generate quiz**: Load locations from JSON, filter by category, call `generateQuestions(locations, category, ['multiple-choice'], 10)`, pass result to `startQuiz()`
- **Point-and-identify validation**: On map tap, calculate distance between tap and correct location, call `answerQuestion(coordinates, undefined, distance <= tolerance)`
- **UI feedback**: After `answerQuestion()` returns, check result to show correctness feedback (highlight on map, toast, audio)
- **Progress persistence**: After quiz ends, call `useProgressStore.addQuizResult(category, score, accuracy)` to update stats and persist to AsyncStorage
