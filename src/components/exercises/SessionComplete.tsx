import { Trophy, RotateCcw, Home } from 'lucide-react';
import type { SessionSummary } from '../../types';

interface Props {
  summary: SessionSummary;
  onPracticeAgain: () => void;
  onExit: () => void;
}

/**
 * End-of-session summary screen.
 * Shows score, stats, and action buttons.
 */
export function SessionComplete({ summary, onPracticeAgain, onExit }: Props) {
  const { totalQuestions, correctAnswers, newWordsLearned, wordsToReview, bestStreak } =
    summary;
  const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  const hasMistakes = wordsToReview > 0;

  // Score color
  let scoreColor = 'text-success';
  if (percentage < 50) scoreColor = 'text-error';
  else if (percentage < 75) scoreColor = 'text-warning';

  return (
    <div className="page-enter space-y-6 py-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-full bg-success-light flex items-center justify-center mx-auto">
          <Trophy className="w-8 h-8 text-success" />
        </div>
        <h2 className="font-display text-2xl font-bold text-text-primary">
          Session Complete!
        </h2>
      </div>

      {/* Score card */}
      <div className="card text-center space-y-1">
        <p className={`font-display text-4xl font-bold ${scoreColor}`}>
          {correctAnswers} / {totalQuestions}
        </p>
        <p className="text-text-secondary text-sm">{percentage}% correct</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card text-center py-3">
          <p className="font-display text-xl font-bold text-primary">{newWordsLearned}</p>
          <p className="text-[10px] text-text-secondary uppercase tracking-wider font-display mt-0.5">
            New words
          </p>
        </div>
        <div className="card text-center py-3">
          <p className="font-display text-xl font-bold text-warning">{wordsToReview}</p>
          <p className="text-[10px] text-text-secondary uppercase tracking-wider font-display mt-0.5">
            To review
          </p>
        </div>
        <div className="card text-center py-3">
          <p className="font-display text-xl font-bold text-success">{bestStreak}</p>
          <p className="text-[10px] text-text-secondary uppercase tracking-wider font-display mt-0.5">
            Best streak
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button onClick={onPracticeAgain} className="btn-primary flex items-center justify-center gap-2">
          <RotateCcw className="w-4 h-4" />
          Practice Again
        </button>

        {hasMistakes && (
          <button onClick={onPracticeAgain} className="btn-secondary flex items-center justify-center gap-2">
            <RotateCcw className="w-4 h-4" />
            Review Mistakes
          </button>
        )}

        <button onClick={onExit} className="btn-secondary flex items-center justify-center gap-2">
          <Home className="w-4 h-4" />
          Back to Home
        </button>
      </div>
    </div>
  );
}
