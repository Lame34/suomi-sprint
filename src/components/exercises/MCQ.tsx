import { useState, useEffect, useMemo, useCallback } from 'react';
import { Check, X } from 'lucide-react';
import type { Exercise, DataItem, ExerciseResult } from '../../types';
import { generateMCQOptions } from '../../lib/exercise-generator';

interface Props {
  exercise: Exercise;
  pool: readonly DataItem[];
  questionStartTime: number;
  onAnswer: (result: ExerciseResult) => void;
  disabled: boolean;
}

const labels = ['A', 'B', 'C', 'D'];

/**
 * Multiple Choice Question exercise.
 * Shows prompt (English or Finnish) and 4 option buttons.
 * Tap → immediate feedback → auto-advance handled by parent.
 */
export function MCQ({ exercise, pool, questionStartTime, onAnswer, disabled }: Props) {
  const { item, direction } = exercise;
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  // Generate options once per exercise item
  const options = useMemo(
    () => generateMCQOptions(item, pool),
    [item, pool],
  );

  const correctIndex = options.findIndex((o) => o.id === item.id);

  // Reset state when exercise changes
  useEffect(() => {
    setSelected(null); // eslint-disable-line react-hooks/set-state-in-effect -- reset on prop change
    setAnswered(false);
  }, [item.id]);

  const handleSelect = useCallback(
    (index: number) => {
      if (answered || disabled) return;

      setSelected(index);
      setAnswered(true);

      const isCorrect = index === correctIndex;
      const timeMs = Date.now() - questionStartTime;

      onAnswer({
        itemId: item.id,
        exerciseType: 'mcq',
        correct: isCorrect,
        almostCorrect: false,
        firstTry: true,
        attempted: true,
        timeMs,
      });
    },
    [answered, disabled, correctIndex, questionStartTime, item.id, onAnswer],
  );

  // Prompt and option text depend on direction
  const prompt = direction === 'en-to-fi' ? item.english : item.finnish;
  const promptLabel =
    direction === 'en-to-fi'
      ? 'What is the Finnish word for:'
      : 'What does this mean in English:';
  const isPromptFinnish = direction === 'fi-to-en';
  const isOptionFinnish = direction === 'en-to-fi';

  return (
    <div className="space-y-6 page-enter">
      {/* Prompt */}
      <div className="text-center space-y-2">
        <p className="text-sm text-text-secondary font-display">{promptLabel}</p>
        <p
          className={`text-2xl font-medium ${
            isPromptFinnish ? 'font-serif text-primary' : 'font-display text-text-primary'
          }`}
        >
          {prompt}
        </p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {options.map((option, index) => {
          const isCorrectOption = index === correctIndex;
          const isSelected = index === selected;

          let stateClasses = 'border-frost bg-white hover:border-primary-light';
          let icon = null;

          if (answered) {
            if (isCorrectOption) {
              stateClasses = 'border-success bg-success-light answer-correct';
              icon = <Check className="w-5 h-5 text-success shrink-0" />;
            } else if (isSelected && !isCorrectOption) {
              stateClasses = 'border-error bg-error-light answer-wrong';
              icon = <X className="w-5 h-5 text-error shrink-0" />;
            } else {
              stateClasses = 'border-frost bg-white opacity-50';
            }
          }

          const optionText = isOptionFinnish ? option.finnish : option.english;

          return (
            <button
              key={option.id}
              onClick={() => handleSelect(index)}
              disabled={answered || disabled}
              className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 min-h-[48px] text-left ${stateClasses}`}
              role="option"
              aria-selected={isSelected}
            >
              {/* Label */}
              <span className="w-7 h-7 rounded-full bg-ice flex items-center justify-center shrink-0 font-display text-sm font-semibold text-text-secondary">
                {labels[index]}
              </span>

              {/* Option text */}
              <span
                className={`flex-1 ${
                  isOptionFinnish
                    ? 'font-serif text-lg text-primary'
                    : 'text-base text-text-primary'
                }`}
              >
                {optionText}
              </span>

              {/* Feedback icon */}
              {icon}
            </button>
          );
        })}
      </div>
    </div>
  );
}
