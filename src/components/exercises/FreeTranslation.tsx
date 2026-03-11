import { useState, useEffect, useRef, useCallback } from 'react';
import { Check, X } from 'lucide-react';
import type { Exercise, ExerciseResult } from '../../types';
import { checkTranslation } from '../../lib/utils';

interface Props {
  exercise: Exercise;
  questionStartTime: number;
  onAnswer: (result: ExerciseResult) => void;
  disabled: boolean;
}

const specialChars = ['ä', 'ö', 'å', 'Ä', 'Ö', 'Å'];

/**
 * Free Translation exercise.
 * Shows English prompt, user types Finnish answer.
 * Finnish special chars bar for ä, ö, å.
 * Fuzzy matching: exact → correct, missing accents / typo → almost, else → wrong.
 */
export function FreeTranslation({ exercise, questionStartTime, onAnswer, disabled }: Props) {
  const { item, direction } = exercise;
  const [input, setInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<'correct' | 'almost' | 'wrong' | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Direction: en-to-fi = show English, type Finnish. fi-to-en = show Finnish, type English.
  const prompt = direction === 'en-to-fi' ? item.english : item.finnish;
  const correctAnswer = direction === 'en-to-fi' ? item.finnish : item.english;
  const promptLabel =
    direction === 'en-to-fi' ? 'Translate to Finnish:' : 'Translate to English:';
  const isPromptFinnish = direction === 'fi-to-en';
  const showSpecialChars = direction === 'en-to-fi';

  // Reset and auto-focus on new exercise
  useEffect(() => {
    setInput(''); // eslint-disable-line react-hooks/set-state-in-effect -- reset on prop change
    setSubmitted(false);
    setResult(null);
    // Small delay to let the DOM settle
    const t = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(t);
  }, [item.id]);

  const handleSubmit = useCallback(() => {
    if (submitted || disabled || input.trim().length === 0) return;

    const matchResult = checkTranslation(input, correctAnswer);
    setSubmitted(true);
    setResult(matchResult);

    const timeMs = Date.now() - questionStartTime;

    onAnswer({
      itemId: item.id,
      exerciseType: 'free-translation',
      correct: matchResult === 'correct',
      almostCorrect: matchResult === 'almost',
      firstTry: true,
      attempted: true,
      timeMs,
    });
  }, [submitted, disabled, input, correctAnswer, questionStartTime, item.id, onAnswer]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  const insertChar = useCallback((char: string) => {
    const el = inputRef.current;
    if (!el) return;

    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? start;
    const before = el.value.slice(0, start);
    const after = el.value.slice(end);
    const newValue = before + char + after;

    setInput(newValue);

    // Restore cursor position after React re-render
    requestAnimationFrame(() => {
      el.selectionStart = start + char.length;
      el.selectionEnd = start + char.length;
      el.focus();
    });
  }, []);

  // Feedback message
  let feedbackMessage = '';
  let feedbackColor = '';
  if (result === 'correct') {
    feedbackMessage = 'Correct!';
    feedbackColor = 'text-success';
  } else if (result === 'almost') {
    // Determine if it was accent issue or typo
    const inputLower = input.trim().toLowerCase();
    const correctLower = correctAnswer.toLowerCase();
    const deAccent = (s: string) =>
      s.replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/å/g, 'a');
    if (deAccent(inputLower) === deAccent(correctLower)) {
      feedbackMessage = 'Almost! Watch the ä/ö';
    } else {
      feedbackMessage = 'Almost! Check spelling';
    }
    feedbackColor = 'text-warning';
  } else if (result === 'wrong') {
    feedbackMessage = 'Not quite.';
    feedbackColor = 'text-error';
  }

  // Input border classes
  let inputClasses = 'border-frost focus:border-primary';
  if (result === 'correct' || result === 'almost') {
    inputClasses = 'border-success bg-success-light';
  } else if (result === 'wrong') {
    inputClasses = 'border-error bg-error-light';
  }

  return (
    <div className="space-y-5 page-enter">
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

      {/* Input */}
      <div className="space-y-2">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your answer..."
            disabled={submitted || disabled}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            className={`w-full px-4 py-3 rounded-xl border-2 text-base transition-all duration-200 focus:outline-none ${
              direction === 'en-to-fi' ? 'font-serif text-primary' : ''
            } ${inputClasses}`}
          />
          {submitted && (result === 'correct' || result === 'almost') && (
            <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-success" />
          )}
          {submitted && result === 'wrong' && (
            <X className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-error" />
          )}
        </div>

        {/* Feedback */}
        {submitted && (
          <div className="space-y-1">
            <p className={`text-sm font-display font-semibold ${feedbackColor}`}>
              {feedbackMessage}
            </p>
            {(result === 'wrong' || result === 'almost') && (
              <p className="text-sm">
                <span className="text-text-secondary">Correct answer: </span>
                <span className="font-serif text-primary font-medium">{correctAnswer}</span>
              </p>
            )}
          </div>
        )}
      </div>

      {/* Special characters bar */}
      {showSpecialChars && !submitted && (
        <div className="flex justify-center gap-2">
          {specialChars.map((char) => (
            <button
              key={char}
              onClick={() => insertChar(char)}
              disabled={disabled}
              className="w-10 h-10 rounded-lg bg-ice border border-frost font-serif text-primary text-lg flex items-center justify-center transition-colors duration-150 hover:bg-frost active:scale-95"
              aria-label={`Insert ${char}`}
            >
              {char}
            </button>
          ))}
        </div>
      )}

      {/* Submit / Continue */}
      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={disabled || input.trim().length === 0}
          className="btn-primary"
        >
          Check Answer
        </button>
      ) : null}
    </div>
  );
}
