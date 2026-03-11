import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ChevronDown, Target, Shuffle, Type, AlignLeft } from 'lucide-react';
import type { DataItem, ExerciseType, UserSettings } from '../types';
import {
  vocabCategories,
  phraseCategories,
  getVocabByCategory,
  getPhrasesByCategory,
  getAllItems,
} from '../data/index';
import { getSettings } from '../lib/db';
import { generateExercises } from '../lib/exercise-generator';
import { useExercise } from '../hooks/useExercise';
import { ExerciseShell } from '../components/exercises/ExerciseShell';

type CategoryOption = { id: string; label: string; type: 'vocab' | 'phrase' };

const exerciseTypeOptions = [
  { id: 'mcq' as ExerciseType, label: 'Multiple Choice', icon: Target },
  { id: 'match-pairs' as ExerciseType, label: 'Match Pairs', icon: Shuffle },
  { id: 'free-translation' as ExerciseType, label: 'Free Translation', icon: Type },
  { id: 'fill-blank' as ExerciseType, label: 'Fill the Blank', icon: AlignLeft },
] as const;

/** Build the full list of category options for the picker */
function buildCategoryOptions(): CategoryOption[] {
  const vocabOpts: CategoryOption[] = vocabCategories.map((c) => ({
    id: c.id,
    label: c.label,
    type: 'vocab',
  }));
  const phraseOpts: CategoryOption[] = phraseCategories.map((c) => ({
    id: c.id,
    label: c.label,
    type: 'phrase',
  }));
  return [...vocabOpts, ...phraseOpts];
}

/**
 * Free practice session page.
 * Category picker → Start → ExerciseShell with MCQ → SessionComplete.
 */
export function PracticePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { state, progress, summary, startSession, submitAnswer, advance } = useExercise();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'vocab' | 'phrase' | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [questionsPerSession, setQuestionsPerSession] = useState(15);
  const [enabledTypes, setEnabledTypes] = useState<ExerciseType[]>([
    'mcq', 'match-pairs', 'free-translation', 'fill-blank',
  ]);

  const categoryOptions = useMemo(() => buildCategoryOptions(), []);

  // Handle deep-link from WordCard/PhraseCard "Practice this category" button
  useEffect(() => {
    const cat = searchParams.get('category');
    const type = searchParams.get('type');
    if (cat) {
      setSelectedCategory(cat); // eslint-disable-line react-hooks/set-state-in-effect -- sync URL params
      setSelectedType(type === 'phrase' ? 'phrase' : 'vocab');
    }
  }, [searchParams]);

  // Load settings on mount
  useEffect(() => {
    getSettings().then((s: UserSettings) => {
      setQuestionsPerSession(s.questionsPerSession);  
      if (s.exerciseTypes.length > 0) {
        setEnabledTypes(s.exerciseTypes);
      }
    });
  }, []);

  const toggleType = useCallback((type: ExerciseType) => {
    setEnabledTypes((prev) => {
      if (prev.includes(type)) {
        // Don't allow deselecting the last type
        if (prev.length === 1) return prev;
        return prev.filter((t) => t !== type);
      }
      return [...prev, type];
    });
  }, []);

  // Get items for selected category
  const pool: readonly DataItem[] = useMemo(() => {
    if (!selectedCategory) return getAllItems();
    if (selectedType === 'phrase') return getPhrasesByCategory(selectedCategory);
    return getVocabByCategory(selectedCategory);
  }, [selectedCategory, selectedType]);

  const selectedLabel = useMemo(() => {
    if (!selectedCategory) return 'All Categories';
    const opt = categoryOptions.find((c) => c.id === selectedCategory);
    return opt?.label ?? 'All Categories';
  }, [selectedCategory, categoryOptions]);

  const handleStart = useCallback(() => {
    const exercises = generateExercises(pool, questionsPerSession, enabledTypes);
    if (exercises.length > 0) {
      startSession(exercises);
    }
  }, [pool, questionsPerSession, enabledTypes, startSession]);

  const handleRestart = useCallback(() => {
    const exercises = generateExercises(pool, questionsPerSession, enabledTypes);
    if (exercises.length > 0) {
      startSession(exercises);
    }
  }, [pool, questionsPerSession, enabledTypes, startSession]);

  // Active session
  if (state.status === 'active' || state.status === 'feedback' || state.status === 'complete') {
    return (
      <ExerciseShell
        exercises={state.exercises}
        pool={pool}
        currentIndex={state.currentIndex}
        status={state.status}
        progress={progress}
        summary={summary}
        questionStartTime={state.questionStartTime}
        onAnswer={submitAnswer}
        onAdvance={advance}
        onRestart={handleRestart}
        onExit={() => navigate('/')}
      />
    );
  }

  // Setup screen
  return (
    <div className="page-enter space-y-4">
      <div>
        <h2 className="font-display text-2xl font-bold text-primary">Practice</h2>
        <p className="text-text-secondary text-sm mt-1">Start a free practice session.</p>
      </div>

      {/* Category picker */}
      <div className="card space-y-3">
        <h3 className="font-display font-semibold text-xs text-text-secondary uppercase tracking-wide">
          Category
        </h3>
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="w-full flex items-center justify-between p-3 rounded-lg border border-frost bg-surface-raised hover:border-primary-light transition-colors duration-200 min-h-[48px]"
        >
          <span className="font-display font-medium text-sm">{selectedLabel}</span>
          <ChevronDown
            className={`w-4 h-4 text-text-secondary transition-transform duration-200 ${showPicker ? 'rotate-180' : ''}`}
          />
        </button>

        {showPicker && (
          <div className="max-h-64 overflow-y-auto rounded-lg border border-frost divide-y divide-frost">
            {/* All categories option */}
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSelectedType(null);
                setShowPicker(false);
              }}
              className={`w-full text-left px-3 py-2.5 text-sm transition-colors duration-150 min-h-[44px] ${
                !selectedCategory
                  ? 'bg-ice text-primary font-semibold'
                  : 'hover:bg-ice'
              }`}
            >
              All Categories
            </button>

            {/* Vocabulary section */}
            <div className="px-3 py-1.5 bg-ice">
              <span className="text-[10px] font-display font-semibold text-text-secondary uppercase tracking-wider">
                Vocabulary
              </span>
            </div>
            {categoryOptions
              .filter((c) => c.type === 'vocab')
              .map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setSelectedType('vocab');
                    setShowPicker(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 text-sm transition-colors duration-150 min-h-[44px] ${
                    selectedCategory === cat.id
                      ? 'bg-ice text-primary font-semibold'
                      : 'hover:bg-ice'
                  }`}
                >
                  {cat.label}
                </button>
              ))}

            {/* Phrases section */}
            <div className="px-3 py-1.5 bg-ice">
              <span className="text-[10px] font-display font-semibold text-text-secondary uppercase tracking-wider">
                Phrases
              </span>
            </div>
            {categoryOptions
              .filter((c) => c.type === 'phrase')
              .map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setSelectedType('phrase');
                    setShowPicker(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 text-sm transition-colors duration-150 min-h-[44px] ${
                    selectedCategory === cat.id
                      ? 'bg-ice text-primary font-semibold'
                      : 'hover:bg-ice'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
          </div>
        )}
      </div>

      {/* Exercise type filter */}
      <div className="card space-y-3">
        <h3 className="font-display font-semibold text-xs text-text-secondary uppercase tracking-wide">
          Exercise Types
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {exerciseTypeOptions.map(({ id, label, icon: Icon }) => {
            const isEnabled = enabledTypes.includes(id);
            return (
              <button
                key={id}
                onClick={() => toggleType(id)}
                className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 min-h-[48px] ${
                  isEnabled
                    ? 'border-primary bg-[#1A2540]'
                    : 'border-frost bg-surface-raised hover:border-primary-light'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isEnabled ? 'text-primary' : 'text-text-secondary'}`} />
                <span className={`font-display text-xs font-medium ${isEnabled ? 'text-primary' : 'text-text-secondary'}`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Session info */}
      <div className="card">
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">Questions</span>
          <span className="font-display font-semibold text-primary">{questionsPerSession}</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm text-text-secondary">Available items</span>
          <span className="font-display font-semibold text-primary">{pool.length}</span>
        </div>
      </div>

      {/* Start button */}
      <button
        onClick={handleStart}
        className="btn-primary"
        disabled={pool.length < 2}
      >
        Start Practice
      </button>
      {pool.length < 2 && (
        <p className="text-xs text-text-secondary text-center">
          Need at least 2 items to practice.
        </p>
      )}
    </div>
  );
}

export default PracticePage;
