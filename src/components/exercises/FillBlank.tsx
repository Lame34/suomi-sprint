import { useState, useEffect, useMemo, useCallback } from 'react';
import { Check, X } from 'lucide-react';
import type { Exercise, DataItem, ExerciseResult } from '../../types';
import { shuffle } from '../../lib/exercise-generator';

/** Simple deterministic hash from a string to a number 0-1 */
function hashToFloat(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash + s.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) / 2147483647;
}

interface Props {
  exercise: Exercise;
  pool: readonly DataItem[];
  questionStartTime: number;
  onAnswer: (result: ExerciseResult) => void;
  disabled: boolean;
}

type SubType = 'fill-blank' | 'word-order';

/**
 * Fill in the Blank / Word Order exercise.
 * Sub-type A: Finnish sentence with a gap, pick the missing word from 3 options.
 * Sub-type B: Scrambled Finnish words, tap to arrange in order.
 * Randomly alternates. Word-order only for phrases with 3+ words.
 */
export function FillBlank({ exercise, pool, questionStartTime, onAnswer, disabled }: Props) {
  const { item } = exercise;
  const finnishWords = item.finnish.split(/\s+/);

  // Decide sub-type: word-order only for 3+ word phrases
  const subType: SubType = useMemo(() => {
    if (finnishWords.length >= 3 && hashToFloat(item.id + '-subtype') > 0.5) return 'word-order';
    return 'fill-blank';
  }, [item, finnishWords.length]);

  if (subType === 'word-order' && finnishWords.length >= 3) {
    return (
      <WordOrder
        exercise={exercise}
        questionStartTime={questionStartTime}
        onAnswer={onAnswer}
        disabled={disabled}
      />
    );
  }

  return (
    <FillBlankSub
      exercise={exercise}
      pool={pool}
      questionStartTime={questionStartTime}
      onAnswer={onAnswer}
      disabled={disabled}
    />
  );
}

/* ─── Sub-type A: Fill in the Blank ─── */

function FillBlankSub({
  exercise,
  pool,
  questionStartTime,
  onAnswer,
  disabled,
}: Props) {
  const { item } = exercise;
  const finnishWords = item.finnish.split(/\s+/);

  // Pick a word to blank out (deterministic per item)
  const blankIndex = useMemo(
    () => Math.floor(hashToFloat(item.id + '-blank') * finnishWords.length),
    [item, finnishWords.length],
  );
  const correctWord = finnishWords[blankIndex];

  // Build sentence with blank
  const sentenceWithBlank = finnishWords.map((w, i) => (i === blankIndex ? '______' : w)).join(' ');

  // Generate 2 distractor words from other items in the pool
  const options = useMemo(() => {
    const otherWords = pool
      .filter((p) => p.id !== item.id)
      .flatMap((p) => p.finnish.split(/\s+/))
      .filter((w) => w !== correctWord && w.length > 1);
    const uniqueWords = [...new Set(otherWords)];
    const distractors = shuffle(uniqueWords).slice(0, 2);
    return shuffle([correctWord, ...distractors]);
  }, [item.id, pool, correctWord]);

  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    setSelected(null); // eslint-disable-line react-hooks/set-state-in-effect -- reset on prop change
    setAnswered(false);
  }, [item.id]);

  const handleSelect = useCallback(
    (word: string) => {
      if (answered || disabled) return;
      setSelected(word);
      setAnswered(true);

      const isCorrect = word === correctWord;
      const timeMs = Date.now() - questionStartTime;

      onAnswer({
        itemId: item.id,
        exerciseType: 'fill-blank',
        correct: isCorrect,
        almostCorrect: false,
        firstTry: true,
        attempted: true,
        timeMs,
      });
    },
    [answered, disabled, correctWord, questionStartTime, item.id, onAnswer],
  );

  return (
    <div className="space-y-6 page-enter">
      {/* Prompt */}
      <div className="text-center space-y-2">
        <p className="text-sm text-text-secondary font-display">Complete the sentence:</p>
        <p className="text-lg text-text-primary">{item.english}</p>
      </div>

      {/* Sentence with blank */}
      <div className="card text-center py-5">
        <p className="font-serif text-xl text-primary leading-relaxed">
          {sentenceWithBlank.split('______').map((part, i, arr) => (
            <span key={i}>
              {part}
              {i < arr.length - 1 && (
                <span
                  className={`inline-block min-w-[60px] mx-1 px-2 py-0.5 rounded-lg border-2 border-dashed transition-all duration-200 ${
                    answered && selected === correctWord
                      ? 'border-success bg-success-light'
                      : answered && selected !== correctWord
                        ? 'border-error bg-error-light'
                        : 'border-primary'
                  }`}
                >
                  {answered ? (
                    <span className="font-serif font-medium">
                      {selected === correctWord ? correctWord : selected}
                    </span>
                  ) : (
                    <span className="text-text-secondary">?</span>
                  )}
                </span>
              )}
            </span>
          ))}
        </p>
      </div>

      {/* Feedback: show correct word if wrong */}
      {answered && selected !== correctWord && (
        <p className="text-sm text-center">
          <span className="text-error font-display font-semibold">Not quite. </span>
          <span className="text-text-secondary">The answer is </span>
          <span className="font-serif text-primary font-medium">{correctWord}</span>
        </p>
      )}
      {answered && selected === correctWord && (
        <p className="text-sm text-center text-success font-display font-semibold">
          Correct!
        </p>
      )}

      {/* Word options */}
      <div className="flex justify-center gap-3">
        {options.map((word) => {
          let classes = 'border-frost bg-surface-raised hover:border-primary-light';
          let icon = null;

          if (answered) {
            if (word === correctWord) {
              classes = 'border-success bg-success-light';
              icon = <Check className="w-4 h-4 text-success" />;
            } else if (word === selected) {
              classes = 'border-error bg-error-light answer-wrong';
              icon = <X className="w-4 h-4 text-error" />;
            } else {
              classes = 'border-frost bg-surface-raised opacity-40';
            }
          }

          return (
            <button
              key={word}
              onClick={() => handleSelect(word)}
              disabled={answered || disabled}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-2 font-serif text-primary text-base min-h-[48px] transition-all duration-200 ${classes}`}
            >
              {word}
              {icon}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Sub-type B: Word Order ─── */

interface WordOrderProps {
  exercise: Exercise;
  questionStartTime: number;
  onAnswer: (result: ExerciseResult) => void;
  disabled: boolean;
}

function WordOrder({ exercise, questionStartTime, onAnswer, disabled }: WordOrderProps) {
  const { item } = exercise;
  const correctWords = item.finnish.split(/\s+/);

  // Scrambled words — deterministic seed from item.id for stable order
  const scrambled = useMemo(() => {
    // Seeded shuffle using item.id hash
    const seed = hashToFloat(item.id + '-scramble');
    const words = [...correctWords];
    // Fisher-Yates with seeded random
    let s = seed;
    for (let i = words.length - 1; i > 0; i--) {
      s = (s * 16807 + 0.5) % 1; // LCG-like deterministic sequence
      const j = Math.floor(s * (i + 1));
      [words[i], words[j]] = [words[j], words[i]];
    }
    // If accidentally same order, swap first two
    if (words.join(' ') === correctWords.join(' ') && words.length >= 2) {
      [words[0], words[1]] = [words[1], words[0]];
    }
    return words;
  }, [item, correctWords]);

  const [placed, setPlaced] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    setPlaced([]); // eslint-disable-line react-hooks/set-state-in-effect -- reset on prop change
    setChecked(false);
    setIsCorrect(false);
  }, [item.id]);

  // Words in the answer zone (by scrambled index)
  const answerWords = placed.map((i) => scrambled[i]);
  // Words still in the pool (not yet placed)
  const availableIndices = scrambled.map((_, i) => i).filter((i) => !placed.includes(i));

  const handlePlaceWord = useCallback(
    (scrambledIndex: number) => {
      if (checked || disabled) return;
      setPlaced((prev) => [...prev, scrambledIndex]);
    },
    [checked, disabled],
  );

  const handleRemoveWord = useCallback(
    (positionIndex: number) => {
      if (checked || disabled) return;
      setPlaced((prev) => prev.filter((_, i) => i !== positionIndex));
    },
    [checked, disabled],
  );

  const handleCheck = useCallback(() => {
    if (checked || disabled || placed.length !== scrambled.length) return;
    const answer = answerWords.join(' ');
    const correct = correctWords.join(' ');
    const ok = answer === correct;
    setChecked(true);
    setIsCorrect(ok);

    const timeMs = Date.now() - questionStartTime;
    onAnswer({
      itemId: item.id,
      exerciseType: 'fill-blank',
      correct: ok,
      almostCorrect: false,
      firstTry: true,
      attempted: true,
      timeMs,
    });
  }, [checked, disabled, placed, scrambled.length, answerWords, correctWords, questionStartTime, item.id, onAnswer]);

  return (
    <div className="space-y-5 page-enter">
      {/* Prompt */}
      <div className="text-center space-y-2">
        <p className="text-sm text-text-secondary font-display">Arrange in Finnish:</p>
        <p className="text-lg text-text-primary">{item.english}</p>
      </div>

      {/* Answer zone */}
      <div
        className={`min-h-[56px] p-3 rounded-xl border-2 border-dashed flex flex-wrap gap-2 items-center transition-all duration-200 ${
          checked && isCorrect
            ? 'border-success bg-success-light'
            : checked && !isCorrect
              ? 'border-error bg-error-light'
              : 'border-primary bg-ice'
        }`}
      >
        {answerWords.length === 0 && (
          <span className="text-sm text-text-secondary">Tap words below to build the sentence</span>
        )}
        {answerWords.map((word, i) => (
          <button
            key={`placed-${i}`}
            onClick={() => handleRemoveWord(i)}
            disabled={checked || disabled}
            className="px-3 py-1.5 rounded-lg bg-surface-raised border border-frost font-serif text-primary text-sm min-h-[36px] transition-all duration-150 hover:bg-error-light hover:border-error active:scale-95"
          >
            {word}
          </button>
        ))}
        {checked && (
          <span className="ml-auto">
            {isCorrect ? (
              <Check className="w-5 h-5 text-success" />
            ) : (
              <X className="w-5 h-5 text-error" />
            )}
          </span>
        )}
      </div>

      {/* Feedback */}
      {checked && !isCorrect && (
        <p className="text-sm text-center">
          <span className="text-error font-display font-semibold">Not quite. </span>
          <span className="text-text-secondary">Correct: </span>
          <span className="font-serif text-primary font-medium">{item.finnish}</span>
        </p>
      )}
      {checked && isCorrect && (
        <p className="text-sm text-center text-success font-display font-semibold">Correct!</p>
      )}

      {/* Word pool */}
      <div className="flex flex-wrap justify-center gap-2">
        {availableIndices.map((scrIdx) => (
          <button
            key={`pool-${scrIdx}`}
            onClick={() => handlePlaceWord(scrIdx)}
            disabled={checked || disabled}
            className="px-4 py-2.5 rounded-xl border-2 border-frost bg-surface-raised font-serif text-primary text-base min-h-[48px] transition-all duration-200 hover:border-primary-light active:scale-95"
          >
            {scrambled[scrIdx]}
          </button>
        ))}
      </div>

      {/* Check button (only when all words placed) */}
      {!checked && placed.length === scrambled.length && (
        <button onClick={handleCheck} className="btn-primary">
          Check Answer
        </button>
      )}
    </div>
  );
}
