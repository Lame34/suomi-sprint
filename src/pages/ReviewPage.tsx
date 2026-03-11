import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';
import type { DataItem, ExerciseType, UserSettings } from '../types';
import { useSpacedRepetition } from '../hooks/useSpacedRepetition';
import { useExercise } from '../hooks/useExercise';
import { getSettings } from '../lib/db';
import { generateExercises } from '../lib/exercise-generator';
import { getAllItems } from '../data/index';
import { ExerciseShell } from '../components/exercises/ExerciseShell';
import { formatRelativeDate } from '../lib/utils';

/**
 * Spaced repetition review session page.
 * Shows due count, starts review session using ExerciseShell, or "All caught up!" when empty.
 */
export function ReviewPage() {
  const navigate = useNavigate();
  const { dueItems, dueCount, loading, refresh } = useSpacedRepetition();
  const { state, progress, summary, startSession, submitAnswer, advance } = useExercise();

  const [settings, setSettings] = useState<UserSettings | null>(null);

  // Load settings lazily
  useState(() => {
    getSettings().then(setSettings);
  });

  // Full pool for exercise generation (needed for MCQ distractors etc.)
  const fullPool: readonly DataItem[] = useMemo(() => getAllItems(), []);

  // Pool is the due items
  const reviewPool: DataItem[] = useMemo(
    () => dueItems.map((d) => d.item),
    [dueItems],
  );

  const handleStart = useCallback(() => {
    if (!settings || reviewPool.length === 0) return;
    const count = Math.min(settings.questionsPerSession, reviewPool.length);
    const enabledTypes: ExerciseType[] =
      settings.exerciseTypes.length > 0
        ? settings.exerciseTypes
        : ['mcq', 'match-pairs', 'free-translation', 'fill-blank'];

    const exercises = generateExercises(reviewPool, count, enabledTypes);
    if (exercises.length > 0) {
      startSession(exercises);
    }
  }, [settings, reviewPool, startSession]);

  const handleRestart = useCallback(() => {
    // Refresh due items and start a new review
    refresh().then(() => {
      if (!settings) return;
      // Re-query since refresh updates state asynchronously
      // Just restart with what we have
      handleStart();
    });
  }, [refresh, settings, handleStart]);

  // Active session — show exercise shell
  if (state.status === 'active' || state.status === 'feedback' || state.status === 'complete') {
    return (
      <ExerciseShell
        exercises={state.exercises}
        pool={fullPool}
        currentIndex={state.currentIndex}
        status={state.status}
        progress={progress}
        summary={summary}
        questionStartTime={state.questionStartTime}
        onAnswer={submitAnswer}
        onAdvance={advance}
        onRestart={handleRestart}
        onExit={() => {
          refresh();
          navigate('/');
        }}
      />
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="page-enter space-y-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-primary">Review</h2>
          <p className="text-text-secondary mt-1">Loading review items...</p>
        </div>
      </div>
    );
  }

  // No items due — all caught up
  if (dueCount === 0) {
    return (
      <div className="page-enter space-y-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-primary">Review</h2>
          <p className="text-text-secondary mt-1">Spaced repetition review.</p>
        </div>

        <div className="card text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-success-light flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          <div>
            <p className="font-display font-semibold text-lg">All caught up!</p>
            <p className="text-sm text-text-secondary mt-1">
              No items due for review right now.
            </p>
          </div>
        </div>

        <div className="card">
          <h3 className="font-display font-semibold text-sm text-text-secondary uppercase tracking-wide mb-3">
            What to do next
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => navigate('/practice')}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-ice transition-colors duration-200 min-h-[48px]"
            >
              <AlertCircle className="w-5 h-5 text-primary shrink-0" />
              <div className="text-left">
                <p className="font-display font-medium text-sm">Free Practice</p>
                <p className="text-xs text-text-secondary">Practice new words to build your review schedule</p>
              </div>
            </button>
            <button
              onClick={() => navigate('/learn')}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-ice transition-colors duration-200 min-h-[48px]"
            >
              <Clock className="w-5 h-5 text-primary shrink-0" />
              <div className="text-left">
                <p className="font-display font-medium text-sm">Browse Vocabulary</p>
                <p className="text-xs text-text-secondary">Discover new words and phrases</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Items due — show review setup
  return (
    <div className="page-enter space-y-4">
      <div>
        <h2 className="font-display text-2xl font-bold text-primary">Review</h2>
        <p className="text-text-secondary mt-1">Spaced repetition review.</p>
      </div>

      {/* Due count card */}
      <div className="card text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-ice flex items-center justify-center mx-auto">
          <Clock className="w-8 h-8 text-primary" />
        </div>
        <div>
          <p className="text-3xl font-display font-bold text-primary">{dueCount}</p>
          <p className="text-sm text-text-secondary mt-1">
            {dueCount === 1 ? 'item' : 'items'} due for review
          </p>
        </div>
      </div>

      {/* Session info */}
      <div className="card">
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">Questions</span>
          <span className="font-display font-semibold text-primary">
            {settings ? Math.min(settings.questionsPerSession, dueCount) : dueCount}
          </span>
        </div>
      </div>

      {/* Preview of due items */}
      <div className="card space-y-2">
        <h3 className="font-display font-semibold text-xs text-text-secondary uppercase tracking-wide">
          Due for review
        </h3>
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {dueItems.slice(0, 10).map(({ item, progress }) => (
            <div
              key={item.id}
              className="flex items-center justify-between py-1.5 text-sm"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-serif text-primary truncate">{item.finnish}</span>
                <span className="text-text-secondary truncate">{item.english}</span>
              </div>
              <span className="text-xs text-text-secondary shrink-0 ml-2">
                {formatRelativeDate(progress.nextReview)}
              </span>
            </div>
          ))}
          {dueCount > 10 && (
            <p className="text-xs text-text-secondary text-center pt-1">
              +{dueCount - 10} more
            </p>
          )}
        </div>
      </div>

      {/* Start button */}
      <button onClick={handleStart} className="btn-primary" disabled={!settings}>
        Start Review
      </button>
    </div>
  );
}

export default ReviewPage;
