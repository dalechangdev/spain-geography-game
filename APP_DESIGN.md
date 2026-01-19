# Spain Geography Quiz App - Design Document

## 1. Overview
An educational quiz app that helps users learn Spanish geography through interactive map-based quizzes covering cities, autonomous regions, municipalities, and geographical features.

## 2. Core Features

### 2.1 Quiz Types
- **Multiple Choice Quiz**: Display a question with 4 answer options, user selects on map
- **Point & Identify**: User taps location on map, system validates against correct answer
- **Name That Place**: Show a location marker, user types or selects the name
- **Progressive Difficulty**: Start with major cities/regions, progress to smaller municipalities
- **Timed Challenges**: Optional time limits for competitive gameplay

### 2.2 Quiz Categories
1. **Autonomous Communities** (17 regions + 2 autonomous cities)
2. **Provincial Capitals** (50 provinces)
3. **Major Cities** (Top 50-100 by population)
4. **Municipalities** (Selected important ones)
5. **Rivers** (Major rivers: Ebro, Tagus, Guadalquivir, Douro, etc.)
6. **Mountain Ranges** (Pyrenees, Sistema Central, Sierra Nevada, etc.)
7. **Notable Mountains** (Teide, Mulhacén, Picos de Europa peaks, etc.)
8. **Lakes & Reservoirs** (Major water bodies)
9. **Islands** (Balearic, Canary Islands)
10. **Coastlines & Capes** (Notable geographic features)

### 2.3 Game Modes
- **Practice Mode**: No scoring, hints available
- **Quiz Mode**: Timed questions with scoring
- **Challenge Mode**: Progressive difficulty, lives system
- **Study Mode**: Explore map with all labels visible

## 3. Technical Architecture

### 3.1 Dependencies Needed
```json
{
  "react-native-maps": "^latest", // Main maps library for Expo/React Native
  "expo-location": "~latest", // For location services (optional)
  "react-native-svg": "^latest", // For custom map overlays and markers
  "react-native-reanimated": "^4.1.1", // Already installed
  "zustand": "^latest", // State management for quiz state
  "@react-native-async-storage/async-storage": "^latest" // Save progress/scores
}
```

**Note**: Expo uses `react-native-maps` for map functionality. The package supports GeoJSON overlays and custom markers. For Expo projects, you may need to configure it in `app.json` with the maps plugin.

### 3.2 Project Structure
```
app/
  ├── (tabs)/
  │   ├── _layout.tsx
  │   ├── index.tsx           # Home/Dashboard
  │   ├── quiz.tsx            # Active quiz screen
  │   ├── study.tsx           # Study mode with labeled map
  │   └── progress.tsx        # Statistics & achievements
  ├── quiz/
  │   ├── [category].tsx      # Category selection
  │   └── [mode].tsx          # Quiz mode configuration
  components/
  ├── map/
  │   ├── MapView.tsx         # Main map component wrapper
  │   ├── MapLayers.tsx       # GeoJSON layer renderer
  │   ├── QuizMarker.tsx      # Interactive markers for quizzes
  │   └── MapControls.tsx     # Zoom, reset, layer toggles
  ├── quiz/
  │   ├── QuestionCard.tsx    # Question display component
  │   ├── AnswerOptions.tsx   # Multiple choice buttons
  │   ├── ScoreDisplay.tsx    # Current score/progress
  │   └── QuizTimer.tsx       # Countdown timer
  ├── ui/
  │   ├── Button.tsx
  │   ├── Card.tsx
  │   └── Badge.tsx
  data/
  ├── geojson/
  │   ├── autonomous-regions.json
  │   ├── provinces.json
  │   ├── municipalities.json
  │   ├── rivers.json
  │   ├── mountains.json
  │   ├── lakes.json
  │   └── coastlines.json
  ├── quiz-data/
  │   ├── questions.json       # Pre-generated questions
  │   └── locations.json       # Location metadata with coordinates
  types/
  └── geography.ts            # TypeScript types
utils/
  ├── quiz-generator.ts       # Generate questions dynamically
  ├── geojson-processor.ts    # Process & optimize GeoJSON
  └── scoring.ts              # Scoring logic
hooks/
  ├── useQuiz.ts              # Quiz state management
  ├── useMapInteraction.ts    # Handle map taps/gestures
  └── useProgress.ts          # Track user progress
```

## 4. Data Structure

### 4.1 Location Data Format
```typescript
interface Location {
  id: string;
  name: string;
  nameEs: string;           // Spanish name
  type: 'city' | 'region' | 'province' | 'municipality' | 'river' | 'mountain' | 'lake' | 'island';
  coordinates: [number, number]; // [longitude, latitude]
  geojson?: GeoJSON.Feature;    // Optional: for complex shapes
  region?: string;              // Which autonomous region
  metadata?: {
    population?: number;
    elevation?: number;
    length?: number;            // For rivers
    area?: number;              // For lakes/regions
  };
}
```

### 4.2 Question Format
```typescript
interface Question {
  id: string;
  category: QuizCategory;
  type: 'multiple-choice' | 'point-and-identify' | 'name-that-place';
  question: string;
  correctAnswer: string;        // Location ID
  options?: string[];           // For multiple choice (location IDs)
  difficulty: 1 | 2 | 3 | 4 | 5;
  hint?: string;
  coordinates: [number, number]; // Where to show marker/focus
  zoomLevel?: number;
}
```

## 5. GeoJSON Data Sources

### 5.1 Recommended Sources
1. **Autonomous Regions & Provinces**: 
   - Natural Earth Data (naturalearthdata.com)
   - GADM Database (gadm.org) - Has Spain administrative boundaries
   - INE (Instituto Nacional de Estadística) - Official Spanish statistics

2. **Rivers**: 
   - Natural Earth rivers dataset
   - OpenStreetMap (overpass-turbo.eu) - Query Spanish rivers

3. **Cities/Municipalities**: 
   - OpenStreetMap Nominatim API
   - GeoNames database
   - INE database

4. **Mountain Ranges/Peaks**: 
   - GeoNames API (geonames.org)
   - OpenStreetMap queries
   - Peakbagger.com data

### 5.2 Data Collection Strategy
- **Option A**: Pre-process all GeoJSON files during build
- **Option B**: Lazy load GeoJSON when category selected
- **Option C**: Hybrid - Load base regions on app start, load details on demand

**Recommendation**: Option C for performance

## 6. User Experience Flow

### 6.1 Initial App Experience
1. **Welcome Screen**: Brief intro, tutorial option
2. **Home/Dashboard**: 
   - Category cards (regions, cities, features)
   - Recent progress
   - Quick start quiz button
3. **Category Selection**: Choose what to study/quiz
4. **Mode Selection**: Practice vs Quiz vs Challenge
5. **Quiz Screen**: Map + question interface
6. **Results**: Score, correct answers review

### 6.2 Quiz Screen Layout
```
┌─────────────────────────┐
│  Score: 8/10  ⏱️ 02:34  │  Header
├─────────────────────────┤
│                         │
│                         │
│       MAP VIEW          │  ~60% screen
│    (Interactive)        │
│                         │
├─────────────────────────┤
│ Question: Where is      │  Question area
│ Barcelona located?      │
├─────────────────────────┤
│ [ ] Madrid [ ] Valencia │  Answer options
│ [✓] Barcelona [ ] Seville│  (if multiple choice)
└─────────────────────────┘
```

### 6.3 Map Interaction
- **Tap to Answer**: In point-and-identify mode
- **Pinch to Zoom**: Standard map zoom
- **Pan**: Move around map
- **Double-tap**: Reset to Spain bounds
- **Long-press**: Show location info (study mode)

## 7. Quiz Logic

### 7.1 Question Generation
- **Pre-generated**: Store 100+ questions per category in JSON
- **Dynamic**: Generate questions from location database
- **Smart Selection**: Avoid repeating recent questions

### 7.2 Answer Validation
```typescript
// Point-and-identify mode
function validatePointAnswer(
  userPoint: [number, number],
  correctLocation: Location,
  tolerance: number = 50000 // meters
): boolean {
  const distance = calculateDistance(userPoint, correctLocation.coordinates);
  return distance <= tolerance;
}

// Tolerance based on location type:
// - Regions: 100km
// - Cities: 50km  
// - Mountains: 10km
```

### 7.3 Scoring System
- **Correct Answer**: +10 points (base)
- **Difficulty Multiplier**: Easy (1x), Medium (1.5x), Hard (2x)
- **Time Bonus**: Faster answers get bonus points
- **Streak Bonus**: Consecutive correct answers
- **Perfect Game**: Bonus for 100% accuracy

## 8. State Management

### 8.1 Quiz State (Zustand)
```typescript
interface QuizState {
  currentQuestion: Question | null;
  questions: Question[];
  currentIndex: number;
  score: number;
  answers: Answer[];
  isActive: boolean;
  mode: QuizMode;
  category: QuizCategory;
  
  startQuiz: (category: QuizCategory, mode: QuizMode) => void;
  answerQuestion: (answer: string) => void;
  nextQuestion: () => void;
  endQuiz: () => void;
}
```

### 8.2 Progress Tracking
- **LocalStorage**: Save scores, achievements, unlocked categories
- **Statistics**: 
  - Total quizzes completed
  - Accuracy by category
  - Best scores
  - Study streaks

## 9. Map Configuration

### 9.1 Initial Map Settings
```typescript
const SPAIN_BOUNDS = {
  north: 44.0,
  south: 36.0,
  east: 4.5,
  west: -9.5,
};

const DEFAULT_ZOOM = 6; // Show all of Spain
const CITY_ZOOM = 10;   // Focus on city level
const REGION_ZOOM = 7;  // Focus on region level
```

### 9.2 Layer Management
- **Base Map**: Standard road map (via Expo Maps)
- **Overlay Layers**: 
  - Administrative boundaries (toggle on/off)
  - Rivers (toggle on/off)
  - Topography (optional)
  - Labels (toggle on/off)

## 10. Performance Considerations

### 10.1 GeoJSON Optimization
- Simplify geometries (reduce vertex count)
- Use appropriate detail levels per zoom
- Split large files into regions
- Cache processed GeoJSON

### 10.2 Map Performance
- Limit visible markers (only show relevant ones)
- Use clustering for many points
- Lazy load layers
- Optimize re-renders (React.memo, useMemo)

## 11. Accessibility

- **Screen Reader Support**: Announce questions and feedback
- **High Contrast Mode**: Ensure map features visible
- **Text Scaling**: Support system font sizes
- **Color Blind Friendly**: Don't rely solely on color for answers

## 12. Future Enhancements

- **Multiplayer Mode**: Challenge friends
- **Achievement System**: Badges for milestones
- **Leaderboards**: Global or friend-based
- **Offline Mode**: Download all data for offline use
- **AR Mode**: Use device camera for location-based questions
- **Language Options**: English, Spanish, Catalan, etc.
- **Custom Quizzes**: Users create and share quizzes

## 13. Implementation Phases

### Phase 1: MVP
- [ ] Set up Expo Maps
- [ ] Basic map with Spain bounds
- [ ] Single quiz category (autonomous regions)
- [ ] Multiple choice questions
- [ ] Basic scoring

### Phase 2: Core Features
- [ ] All quiz categories
- [ ] Point-and-identify mode
- [ ] Progress tracking
- [ ] Study mode

### Phase 3: Polish
- [ ] Animations and transitions
- [ ] Sound effects and haptics
- [ ] Achievements system
- [ ] Statistics dashboard

### Phase 4: Advanced
- [ ] Offline mode
- [ ] Multiple languages
- [ ] User-generated content
