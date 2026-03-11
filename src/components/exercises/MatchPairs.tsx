import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { Exercise, DataItem, ExerciseResult } from '../../types';
import { shuffle } from '../../lib/exercise-generator';

interface Props {
  exercise: Exercise;
  pool: readonly DataItem[];
  questionStartTime: number;
  onAnswer: (result: ExerciseResult) => void;
  disabled: boolean;
}

type PairStatus = 'default' | 'matched' | 'wrong';

/**
 * Match Pairs exercise.
 * 5 English words (left) ↔ 5 Finnish words (right), shuffled independently.
 * Tap left → highlight blue → tap right → check match.
 */
export function MatchPairs({ exercise, pool, questionStartTime, onAnswer, disabled }: Props) {
  const { item } = exercise;

  // Pick 5 items: the exercise item + 4 from pool
  const pairs = useMemo(() => {
    const others = shuffle(
      pool.filter((p) => p.id !== item.id && p.category === item.category),
    ).slice(0, 4);
    // If not enough in category, fill from full pool
    if (others.length < 4) {
      const more = shuffle(
        pool.filter(
          (p) => p.id !== item.id && !others.some((o) => o.id === p.id),
        ),
      ).slice(0, 4 - others.length);
      others.push(...more);
    }
    return shuffle([item, ...others]).slice(0, 5);
  }, [item, pool]);

  const leftOrder = useMemo(() => shuffle(pairs.map((_, i) => i)), [pairs]);
  const rightOrder = useMemo(() => shuffle(pairs.map((_, i) => i)), [pairs]);

  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [pairStatus, setPairStatus] = useState<Map<number, PairStatus>>(new Map());
  const [wrongRight, setWrongRight] = useState<number | null>(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [completed, setCompleted] = useState(false);
  const wrongTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Reset state when exercise changes
  useEffect(() => {
    setSelectedLeft(null); // eslint-disable-line react-hooks/set-state-in-effect -- reset on prop change
    setMatched(new Set());
    setPairStatus(new Map());
    setWrongRight(null);
    setWrongAttempts(0);
    setCompleted(false);
  }, [item.id]);

  // Clean up timer
  useEffect(() => {
    return () => {
      if (wrongTimerRef.current) clearTimeout(wrongTimerRef.current);
    };
  }, []);

  const handleLeftTap = useCallback(
    (pairIndex: number) => {
      if (disabled || completed || matched.has(pairIndex)) return;
      setSelectedLeft(pairIndex);
    },
    [disabled, completed, matched],
  );

  const handleRightTap = useCallback(
    (pairIndex: number) => {
      if (disabled || completed || matched.has(pairIndex) || selectedLeft === null) return;

      if (pairIndex === selectedLeft) {
        // Correct match
        const newMatched = new Set(matched);
        newMatched.add(pairIndex);
        setMatched(newMatched);

        const statusMap = new Map(pairStatus);
        statusMap.set(pairIndex, 'matched');
        setPairStatus(statusMap);
        setSelectedLeft(null);

        // Check if all matched
        if (newMatched.size === pairs.length) {
          setCompleted(true);
          const timeMs = Date.now() - questionStartTime;
          onAnswer({
            itemId: item.id,
            exerciseType: 'match-pairs',
            correct: wrongAttempts === 0,
            almostCorrect: wrongAttempts > 0 && wrongAttempts <= 2,
            firstTry: wrongAttempts === 0,
            attempted: true,
            timeMs,
          });
        }
      } else {
        // Wrong match — flash only the tapped right-side item red
        setWrongAttempts((prev) => prev + 1);
        setWrongRight(pairIndex);
        setSelectedLeft(null);
        if (wrongTimerRef.current) clearTimeout(wrongTimerRef.current);
        wrongTimerRef.current = setTimeout(() => {
          setWrongRight(null);
        }, 600);
      }
    },
    [disabled, completed, matched, selectedLeft, pairs.length, pairStatus, wrongAttempts, questionStartTime, item.id, onAnswer],
    // pairStatus and wrongAttempts kept for correct-match path
  );

  return (
    <div className="space-y-4 page-enter">
      <p className="text-sm text-text-secondary font-display text-center">
        Match the pairs
      </p>

      <div className="flex gap-3">
        {/* Left column: English */}
        <div className="flex-1 space-y-2">
          {leftOrder.map((pairIdx) => {
            const p = pairs[pairIdx];
            const isMatched = matched.has(pairIdx);
            const isSelected = selectedLeft === pairIdx;
            const status = pairStatus.get(pairIdx) ?? 'default';

            if (isMatched && status === 'matched') {
              return (
                <div
                  key={`l-${p.id}`}
                  className="p-3 rounded-xl border-2 border-success bg-success-light min-h-[48px] flex items-center justify-center transition-all duration-200 opacity-40"
                >
                  <span className="text-sm text-success line-through">{p.english}</span>
                </div>
              );
            }

            let classes = 'border-frost bg-surface-raised hover:border-primary-light';
            if (isSelected) classes = 'border-primary bg-selected';

            return (
              <button
                key={`l-${p.id}`}
                onClick={() => handleLeftTap(pairIdx)}
                disabled={disabled || completed || isMatched}
                className={`w-full p-3 rounded-xl border-2 min-h-[48px] flex items-center justify-center transition-all duration-200 text-sm ${classes}`}
              >
                {p.english}
              </button>
            );
          })}
        </div>

        {/* Right column: Finnish */}
        <div className="flex-1 space-y-2">
          {rightOrder.map((pairIdx) => {
            const p = pairs[pairIdx];
            const isMatched = matched.has(pairIdx);
            const status = pairStatus.get(pairIdx) ?? 'default';

            if (isMatched && status === 'matched') {
              return (
                <div
                  key={`r-${p.id}`}
                  className="p-3 rounded-xl border-2 border-success bg-success-light min-h-[48px] flex items-center justify-center transition-all duration-200 opacity-40"
                >
                  <span className="font-serif text-sm text-success line-through">{p.finnish}</span>
                </div>
              );
            }

            const isWrong = wrongRight === pairIdx;
            let classes = 'border-frost bg-surface-raised hover:border-primary-light';
            if (isWrong) classes = 'border-error bg-error-light answer-wrong';

            return (
              <button
                key={`r-${p.id}`}
                onClick={() => handleRightTap(pairIdx)}
                disabled={disabled || completed || isMatched || selectedLeft === null}
                className={`w-full p-3 rounded-xl border-2 min-h-[48px] flex items-center justify-center transition-all duration-200 font-serif text-sm text-primary ${classes}`}
              >
                {p.finnish}
              </button>
            );
          })}
        </div>
      </div>

      {/* Hint */}
      {selectedLeft !== null && !completed && (
        <p className="text-xs text-text-secondary text-center">
          Now tap the matching Finnish word
        </p>
      )}
      {wrongAttempts > 0 && !completed && (
        <p className="text-xs text-warning text-center">
          {wrongAttempts} wrong {wrongAttempts === 1 ? 'attempt' : 'attempts'}
        </p>
      )}
    </div>
  );
}
