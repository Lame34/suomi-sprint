import { useReducer, useCallback, useEffect, useRef } from 'react';
import type { Exercise, ExerciseResult, SessionSummary } from '../types';
import { isVocabEntry } from '../types';
import { db } from '../lib/db';
import { updateSM2, createInitialProgress } from '../lib/sm2';

/* ── State ── */

type SessionStatus = 'idle' | 'active' | 'feedback' | 'complete';

interface ExerciseState {
  exercises: Exercise[];
  currentIndex: number;
  results: ExerciseResult[];
  status: SessionStatus;
  sessionStartTime: number;
  questionStartTime: number;
}

const initialState: ExerciseState = {
  exercises: [],
  currentIndex: 0,
  results: [],
  status: 'idle',
  sessionStartTime: 0,
  questionStartTime: 0,
};

/* ── Actions ── */

type ExerciseAction =
  | { type: 'START_SESSION'; exercises: Exercise[] }
  | { type: 'ANSWER'; result: ExerciseResult }
  | { type: 'NEXT' }
  | { type: 'COMPLETE' };

function reducer(state: ExerciseState, action: ExerciseAction): ExerciseState {
  switch (action.type) {
    case 'START_SESSION':
      return {
        exercises: action.exercises,
        currentIndex: 0,
        results: [],
        status: 'active',
        sessionStartTime: Date.now(),
        questionStartTime: Date.now(),
      };
    case 'ANSWER':
      return {
        ...state,
        results: [...state.results, action.result],
        status: 'feedback',
      };
    case 'NEXT': {
      const nextIndex = state.currentIndex + 1;
      if (nextIndex >= state.exercises.length) {
        return { ...state, status: 'complete' };
      }
      return {
        ...state,
        currentIndex: nextIndex,
        status: 'active',
        questionStartTime: Date.now(),
      };
    }
    case 'COMPLETE':
      return { ...state, status: 'complete' };
    default:
      return state;
  }
}

/* ── Quality mapping (SKILL-exercises.md) ── */

function mapResultToQuality(result: ExerciseResult): number {
  if (result.correct && result.firstTry && result.timeMs < 5000) return 5;
  if (result.correct && result.firstTry) return 4;
  if (result.almostCorrect) return 3;
  if (!result.correct && result.attempted) return 1;
  return 0;
}

/* ── Persistent state across navigation ── */

const persistedStates = new Map<string, ExerciseState>();
const sessionSavedFlags = new Map<string, boolean>();

/* ── Hook ── */

interface UseExerciseReturn {
  state: ExerciseState;
  currentExercise: Exercise | undefined;
  progress: { current: number; total: number };
  startSession: (exercises: Exercise[]) => void;
  submitAnswer: (result: ExerciseResult) => void;
  advance: () => void;
  summary: SessionSummary | undefined;
}

/**
 * Manages exercise session state via useReducer.
 * Handles: START → ANSWER → feedback delay → NEXT → ... → COMPLETE.
 * Persists progress to IndexedDB via SM-2 after each answer.
 * State survives navigation via module-level cache keyed by sessionKey.
 */
export function useExercise(sessionKey: string = 'practice'): UseExerciseReturn {
  const [state, dispatch] = useReducer(
    reducer,
    null,
    () => persistedStates.get(sessionKey) ?? initialState,
  );

  // Sync state back to persistent store
  useEffect(() => {
    persistedStates.set(sessionKey, state);
  }, [sessionKey, state]);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  const startSession = useCallback((exercises: Exercise[]) => {
    dispatch({ type: 'START_SESSION', exercises });
  }, []);

  const submitAnswer = useCallback(
    (result: ExerciseResult) => {
      dispatch({ type: 'ANSWER', result });

      // Persist to IndexedDB
      const item = state.exercises[state.currentIndex]?.item;
      if (item) {
        const quality = mapResultToQuality(result);
        const itemType = isVocabEntry(item) ? 'vocab' as const : 'phrase' as const;

        db.progress
          .get(item.id)
          .then((existing) => {
            const record = existing ?? createInitialProgress(item.id, itemType);
            const updated = updateSM2(record, quality);
            return db.progress.put(updated);
          });
      }

      // Auto-advance after 1.5s
      feedbackTimerRef.current = setTimeout(() => {
        dispatch({ type: 'NEXT' });
      }, 1500);
    },
    [state.exercises, state.currentIndex],
  );

  const advance = useCallback(() => {
    // Skip the feedback wait timer
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    dispatch({ type: 'NEXT' });
  }, []);

  const currentExercise =
    state.status !== 'idle' && state.status !== 'complete'
      ? state.exercises[state.currentIndex]
      : undefined;

  // Compute summary when complete
  let summary: SessionSummary | undefined;
  if (state.status === 'complete' && state.results.length > 0) {
    const correctCount = state.results.filter((r) => r.correct || r.almostCorrect).length;
    const newWords = state.results.filter((r) => r.correct && r.firstTry).length;
    const toReview = state.results.filter((r) => !r.correct && !r.almostCorrect).length;

    // Best streak
    let bestStreak = 0;
    let currentStreak = 0;
    for (const r of state.results) {
      if (r.correct || r.almostCorrect) {
        currentStreak++;
        bestStreak = Math.max(bestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    summary = {
      totalQuestions: state.exercises.length,
      correctAnswers: correctCount,
      newWordsLearned: newWords,
      wordsToReview: toReview,
      bestStreak,
      results: state.results,
    };
  }

  // Persist session record to IndexedDB when session completes
  useEffect(() => {
    if (state.status === 'complete' && state.results.length > 0 && !sessionSavedFlags.get(sessionKey)) {
      sessionSavedFlags.set(sessionKey, true);
      const correctCount = state.results.filter((r) => r.correct || r.almostCorrect).length;
      const uniqueItems = new Set(state.results.map((r) => r.itemId)).size;
      db.sessions.add({
        date: new Date(),
        mode: 'practice',
        totalQuestions: state.exercises.length,
        correctAnswers: correctCount,
        accuracy: Math.round((correctCount / state.exercises.length) * 100),
        durationMs: Date.now() - state.sessionStartTime,
        itemCount: uniqueItems,
      });
    }
    if (state.status === 'idle') {
      sessionSavedFlags.set(sessionKey, false);
    }
  }, [sessionKey, state.status, state.results, state.exercises.length, state.sessionStartTime]);

  return {
    state,
    currentExercise,
    progress: {
      current: state.currentIndex + 1,
      total: state.exercises.length,
    },
    startSession,
    submitAnswer,
    advance,
    summary,
  };
}
