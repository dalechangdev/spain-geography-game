import { Question, Location, QuizCategory, QuestionType, Difficulty } from '@/types/geography';

/**
 * Generate a question from a location
 */
export function generateQuestionFromLocation(
  location: Location,
  category: QuizCategory,
  type: QuestionType,
  difficulty: Difficulty = 2,
  allLocations?: Location[] // For generating multiple choice options
): Question {
  const questionId = `q-${location.id}-${Date.now()}`;
  const [longitude, latitude] = location.coordinates;

  let questionText = '';
  let hint = '';

  switch (type) {
    case 'multiple-choice':
      questionText = `Where is ${location.name} located?`;
      hint = `It's in ${location.region || 'Spain'}`;
      break;
    
    case 'point-and-identify':
      questionText = `Tap on the map where ${location.name} is located`;
      hint = `It's in the ${location.region || 'Spanish'} region`;
      break;
    
    case 'name-that-place':
      questionText = `What is the name of this location?`;
      hint = `It's located in ${location.region || 'Spain'}`;
      break;
  }

  // Generate multiple choice options if needed
  let options: string[] | undefined;
  if (type === 'multiple-choice' && allLocations) {
    options = generateMultipleChoiceOptions(location, allLocations, category);
  }

  return {
    id: questionId,
    category,
    type,
    question: questionText,
    questionEs: generateSpanishQuestion(location, type),
    correctAnswer: location.id,
    options,
    difficulty,
    hint,
    hintEs: `Está en ${location.region || 'España'}`,
    coordinates: [longitude, latitude],
    zoomLevel: getZoomLevelForCategory(category),
    tolerance: getToleranceForCategory(category),
  };
}

/**
 * Generate multiple choice options (correct answer + 3 distractors)
 */
function generateMultipleChoiceOptions(
  correctLocation: Location,
  allLocations: Location[],
  category: QuizCategory
): string[] {
  // Filter locations by same category/type
  const candidates = allLocations.filter(
    (loc) => loc.id !== correctLocation.id && getLocationCategory(loc) === category
  );

  // Shuffle and pick 3 random distractors
  const shuffled = [...candidates].sort(() => Math.random() - 0.5);
  const distractors = shuffled.slice(0, 3).map((loc) => loc.id);

  // Combine with correct answer and shuffle
  const options = [correctLocation.id, ...distractors].sort(() => Math.random() - 0.5);

  return options;
}

/**
 * Determine category from location type
 */
function getLocationCategory(location: Location): QuizCategory {
  switch (location.type) {
    case 'region':
      return 'autonomous-regions';
    case 'province':
      return 'provinces';
    case 'city':
      return 'cities';
    case 'municipality':
      return 'municipalities';
    case 'river':
      return 'rivers';
    case 'mountain-range':
      return 'mountain-ranges';
    case 'mountain':
      return 'mountains';
    case 'lake':
      return 'lakes';
    case 'island':
      return 'islands';
    default:
      return 'cities';
  }
}

/**
 * Get zoom level for a category
 */
function getZoomLevelForCategory(category: QuizCategory): number {
  switch (category) {
    case 'autonomous-regions':
      return 7;
    case 'provinces':
      return 8;
    case 'cities':
      return 10;
    case 'municipalities':
      return 12;
    case 'rivers':
    case 'mountain-ranges':
      return 7;
    case 'mountains':
      return 9;
    case 'lakes':
      return 9;
    default:
      return 7;
  }
}

/**
 * Get tolerance for a category (in meters)
 */
function getToleranceForCategory(category: QuizCategory): number {
  switch (category) {
    case 'autonomous-regions':
      return 100000; // 100km
    case 'provinces':
      return 75000; // 75km
    case 'cities':
      return 50000; // 50km
    case 'municipalities':
      return 25000; // 25km
    case 'rivers':
      return 10000; // 10km
    case 'mountain-ranges':
      return 50000; // 50km
    case 'mountains':
      return 5000; // 5km
    case 'lakes':
      return 30000; // 30km
    default:
      return 50000;
  }
}

/**
 * Generate Spanish question text
 */
function generateSpanishQuestion(location: Location, type: QuestionType): string {
  switch (type) {
    case 'multiple-choice':
      return `¿Dónde está ${location.nameEs || location.name}?`;
    case 'point-and-identify':
      return `Toca en el mapa dónde está ${location.nameEs || location.name}`;
    case 'name-that-place':
      return `¿Cuál es el nombre de este lugar?`;
    default:
      return '';
  }
}

/**
 * Generate a set of questions from locations
 */
export function generateQuestions(
  locations: Location[],
  category: QuizCategory,
  questionTypes: QuestionType[],
  count: number,
  difficulty?: Difficulty
): Question[] {
  // Filter locations by category
  const categoryLocations = locations.filter(
    (loc) => getLocationCategory(loc) === category
  );

  if (categoryLocations.length === 0) {
    return [];
  }

  // Shuffle locations
  const shuffled = [...categoryLocations].sort(() => Math.random() - 0.5);
  
  // Generate questions
  const questions: Question[] = [];
  for (let i = 0; i < Math.min(count, shuffled.length); i++) {
    const location = shuffled[i];
    const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    const questionDifficulty = difficulty || getDifficultyForIndex(i, shuffled.length);
    
    const question = generateQuestionFromLocation(
      location,
      category,
      questionType,
      questionDifficulty,
      categoryLocations
    );
    
    questions.push(question);
  }

  return questions;
}

/**
 * Get difficulty based on question index (progressively harder)
 */
function getDifficultyForIndex(index: number, total: number): Difficulty {
  const progress = index / total;
  if (progress < 0.3) return 1; // Easy
  if (progress < 0.6) return 2; // Medium
  if (progress < 0.8) return 3; // Hard
  if (progress < 0.95) return 4; // Very hard
  return 5; // Expert
}
