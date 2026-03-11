/* ── Vocabulary & Phrase Types ── */

export type PartOfSpeech =
  | 'noun'
  | 'verb'
  | 'adjective'
  | 'adverb'
  | 'pronoun'
  | 'phrase'
  | 'number'
  | 'other';

export type Difficulty = 1 | 2 | 3;

export interface VocabEntry {
  id: string;
  finnish: string;
  english: string;
  category: string;
  partOfSpeech: PartOfSpeech;
  difficulty: Difficulty;
  notes?: string;
  examples?: string[];
}

export interface PhraseEntry {
  id: string;
  finnish: string;
  english: string;
  category: string;
  difficulty: Difficulty;
  literalTranslation?: string;
  notes?: string;
  words: string[];
}

/** Union of items that can appear in exercises */
export type DataItem = VocabEntry | PhraseEntry;

/** Type guard: is this a VocabEntry? */
export function isVocabEntry(item: DataItem): item is VocabEntry {
  return 'partOfSpeech' in item;
}

/* ── Category Metadata ── */

export interface CategoryMeta {
  category: string;
  categoryLabel: string;
  icon: string;
  description: string;
  difficulty: Difficulty;
  items: VocabEntry[] | PhraseEntry[];
}

/* ── Progress & Spaced Repetition ── */

export interface ProgressRecord {
  itemId: string;
  itemType: 'vocab' | 'phrase';
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: Date;
  totalAttempts: number;
  correctAttempts: number;
  lastAttempted: Date;
  lastCorrect: boolean;
}

/* ── Exercises ── */

export type ExerciseType = 'mcq' | 'match-pairs' | 'free-translation' | 'fill-blank';

export type ExerciseDirection = 'en-to-fi' | 'fi-to-en';

export type MatchResult = 'correct' | 'almost' | 'wrong';

export interface ExerciseResult {
  itemId: string;
  exerciseType: ExerciseType;
  correct: boolean;
  almostCorrect: boolean;
  firstTry: boolean;
  attempted: boolean;
  timeMs: number;
}

export interface Exercise {
  item: DataItem;
  type: ExerciseType;
  direction: ExerciseDirection;
}

/* ── Settings ── */

export interface UserSettings {
  questionsPerSession: number;
  exerciseTypes: ExerciseType[];
  showHints: boolean;
  autoAdvance: boolean;
  reviewMode: 'mixed' | 'vocabOnly' | 'phrasesOnly';
}

/* ── Session ── */

export interface SessionSummary {
  totalQuestions: number;
  correctAnswers: number;
  newWordsLearned: number;
  wordsToReview: number;
  bestStreak: number;
  results: ExerciseResult[];
}

/** Persisted session history record in IndexedDB */
export interface SessionRecord {
  id?: number;
  date: Date;
  mode: 'practice' | 'review';
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  durationMs: number;
  itemCount: number;
}
