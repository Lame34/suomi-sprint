import { Component, type ReactNode } from 'react';
import type { Exercise, DataItem, ExerciseResult } from '../../types';
import type { SessionSummary } from '../../types';
import { MCQ } from './MCQ';
import { MatchPairs } from './MatchPairs';
import { FreeTranslation } from './FreeTranslation';
import { FillBlank } from './FillBlank';
import { SessionComplete } from './SessionComplete';

/* ── Error Boundary ── */

interface ErrorBoundaryState {
  hasError: boolean;
}

class ExerciseErrorBoundary extends Component<
  { children: ReactNode; onReset: () => void },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="card text-center space-y-4">
          <p className="text-error font-display font-semibold">Something went wrong</p>
          <p className="text-sm text-text-secondary">
            An error occurred in the exercise. Try again.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              this.props.onReset();
            }}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ── ExerciseShell ── */

interface Props {
  exercises: Exercise[];
  pool: readonly DataItem[];
  currentIndex: number;
  status: 'active' | 'feedback' | 'complete';
  progress: { current: number; total: number };
  summary: SessionSummary | undefined;
  questionStartTime: number;
  onAnswer: (result: ExerciseResult) => void;
  onAdvance: () => void;
  onRestart: () => void;
  onExit: () => void;
}

/**
 * Wraps all exercise types with progress bar, feedback flow, and error boundary.
 */
export function ExerciseShell({
  exercises,
  pool,
  currentIndex,
  status,
  progress,
  summary,
  questionStartTime,
  onAnswer,
  onAdvance,
  onRestart,
  onExit,
}: Props) {
  // Complete state
  if (status === 'complete' && summary) {
    return (
      <SessionComplete
        summary={summary}
        onPracticeAgain={onRestart}
        onExit={onExit}
      />
    );
  }

  const currentExercise = exercises[currentIndex];
  if (!currentExercise) return null;

  const isFeedback = status === 'feedback';

  return (
    <div className="space-y-4 page-enter">
      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-text-secondary font-display">
          <span>
            {progress.current} / {progress.total}
          </span>
          <span>{Math.round((progress.current / progress.total) * 100)}%</span>
        </div>
        <div className="w-full h-2 bg-frost rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((progress.current - 1) / progress.total) * 100}%` }}
          />
        </div>
      </div>

      {/* Tap to skip feedback wait */}
      {isFeedback && (
        <button
          onClick={onAdvance}
          className="w-full text-center text-xs text-text-secondary py-1"
          aria-label="Skip to next question"
        >
          Tap to continue
        </button>
      )}

      {/* Exercise content */}
      <ExerciseErrorBoundary onReset={onRestart}>
        {currentExercise.type === 'mcq' && (
          <MCQ
            exercise={currentExercise}
            pool={pool}
            questionStartTime={questionStartTime}
            onAnswer={onAnswer}
            disabled={isFeedback}
          />
        )}

        {currentExercise.type === 'match-pairs' && (
          <MatchPairs
            exercise={currentExercise}
            pool={pool}
            questionStartTime={questionStartTime}
            onAnswer={onAnswer}
            disabled={isFeedback}
          />
        )}

        {currentExercise.type === 'free-translation' && (
          <FreeTranslation
            exercise={currentExercise}
            questionStartTime={questionStartTime}
            onAnswer={onAnswer}
            disabled={isFeedback}
          />
        )}

        {currentExercise.type === 'fill-blank' && (
          <FillBlank
            exercise={currentExercise}
            pool={pool}
            questionStartTime={questionStartTime}
            onAnswer={onAnswer}
            disabled={isFeedback}
          />
        )}
      </ExerciseErrorBoundary>
    </div>
  );
}
