import { useCallback, useEffect, useRef } from 'react';
import type { Exercise, ExerciseResult, SessionSummary } from '../types';
import { isVocabEntry } from '../types';
import { db } from '../lib/db';
import { updateSM2, createInitialProgress } from '../lib/sm2';
import { useExerciseContext, type SessionKey, type ExerciseState } from '../context/ExerciseContext';

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
 * Map the result of an exercise to an SM-2 quality score (0–5).
 * Higher quality means the item will be reviewed less often.
 */
function mapResultToQuality(result: ExerciseResult): number {
  if (result.correct && result.firstTry && result.timeMs < 5000) return 5;
  if (result.correct && result.firstTry) return 4;
  if (result.almostCorrect) return 3;
  if (!result.correct && result.attempted) return 1;
  return 0;
}

/**
 * Manages one exercise session (practice or review).
 * State lives in ExerciseContext so it persists across page navigation.
 */
export function useExercise(sessionKey: SessionKey = 'practice'): UseExerciseReturn {
  const { state, dispatch, savedSessions } = useExerciseContext(sessionKey);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Clean up the feedback timer on unmount
  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  const startSession = useCallback(
    (exercises: Exercise[]) => {
      savedSessions.current.delete(sessionKey);
      dispatch({ type: 'START_SESSION', exercises });
    },
    [dispatch, sessionKey, savedSessions],
  );

  const submitAnswer = useCallback(
    (result: ExerciseResult) => {
      dispatch({ type: 'ANSWER', result });

      // Persist progress to IndexedDB (SM-2 spaced repetition)
      const item = state.exercises[state.currentIndex]?.item;
      if (item) {
        const quality = mapResultToQuality(result);
        const itemType = isVocabEntry(item) ? ('vocab' as const) : ('phrase' as const);
        db.progress.get(item.id).then((existing) => {
          const record = existing ?? createInitialProgress(item.id, itemType);
          const updated = updateSM2(record, quality);
          return db.progress.put(updated);
        });
      }

      // Auto-advance to the next exercise after 1.5s
      feedbackTimerRef.current = setTimeout(() => {
        dispatch({ type: 'NEXT' });
      }, 1500);
    },
    [dispatch, state.exercises, state.currentIndex],
  );

  const advance = useCallback(() => {
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    dispatch({ type: 'NEXT' });
  }, [dispatch]);

  const currentExercise =
    state.status !== 'idle' && state.status !== 'complete'
      ? state.exercises[state.currentIndex]
      : undefined;

  // Compute summary when the session is complete
  let summary: SessionSummary | undefined;
  if (state.status === 'complete' && state.results.length > 0) {
    const correctCount = state.results.filter((r) => r.correct || r.almostCorrect).length;
    const newWords = state.results.filter((r) => r.correct && r.firstTry).length;
    const toReview = state.results.filter((r) => !r.correct && !r.almostCorrect).length;

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

  // Save the session to IndexedDB once, when it completes
  useEffect(() => {
    if (state.status === 'complete' && state.results.length > 0 && !savedSessions.current.has(sessionKey)) {
      savedSessions.current.add(sessionKey);
      const correctCount = state.results.filter((r) => r.correct || r.almostCorrect).length;
      const uniqueItems = new Set(state.results.map((r) => r.itemId)).size;
      db.sessions.add({
        date: new Date(),
        mode: sessionKey,
        totalQuestions: state.exercises.length,
        correctAnswers: correctCount,
        accuracy: Math.round((correctCount / state.exercises.length) * 100),
        durationMs: Date.now() - state.sessionStartTime,
        itemCount: uniqueItems,
      });
    }
  }, [sessionKey, state.status, state.results, state.exercises.length, state.sessionStartTime, savedSessions]);

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
