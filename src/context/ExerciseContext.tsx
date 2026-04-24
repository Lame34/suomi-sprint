/* eslint-disable react-refresh/only-export-components -- context file co-locates types, reducer and hook */
import { createContext, useContext, useReducer, useRef, type ReactNode, type Dispatch, type MutableRefObject } from 'react';
import type { Exercise, ExerciseResult } from '../types';

export type SessionStatus = 'idle' | 'active' | 'feedback' | 'complete';
export type SessionKey = 'practice' | 'review';

export interface ExerciseState {
  exercises: Exercise[];
  currentIndex: number;
  results: ExerciseResult[];
  status: SessionStatus;
  sessionStartTime: number;
  questionStartTime: number;
}

export type ExerciseAction =
  | { type: 'START_SESSION'; exercises: Exercise[] }
  | { type: 'ANSWER'; result: ExerciseResult }
  | { type: 'NEXT' };

export const initialState: ExerciseState = {
  exercises: [],
  currentIndex: 0,
  results: [],
  status: 'idle',
  sessionStartTime: 0,
  questionStartTime: 0,
};

export function reducer(state: ExerciseState, action: ExerciseAction): ExerciseState {
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
    default:
      return state;
  }
}

interface ExerciseContextValue {
  practiceState: ExerciseState;
  reviewState: ExerciseState;
  practiceDispatch: Dispatch<ExerciseAction>;
  reviewDispatch: Dispatch<ExerciseAction>;
  savedSessions: MutableRefObject<Set<SessionKey>>;
}

const ExerciseContext = createContext<ExerciseContextValue | null>(null);

/**
 * Provides exercise session state at the App level so sessions persist
 * when the user navigates between tabs.
 */
export function ExerciseProvider({ children }: { children: ReactNode }) {
  const [practiceState, practiceDispatch] = useReducer(reducer, initialState);
  const [reviewState, reviewDispatch] = useReducer(reducer, initialState);
  const savedSessions = useRef(new Set<SessionKey>());

  return (
    <ExerciseContext.Provider
      value={{ practiceState, reviewState, practiceDispatch, reviewDispatch, savedSessions }}
    >
      {children}
    </ExerciseContext.Provider>
  );
}

/**
 * Read the exercise state and dispatch for a given session key.
 */
export function useExerciseContext(sessionKey: SessionKey) {
  const ctx = useContext(ExerciseContext);
  if (!ctx) throw new Error('useExerciseContext must be used inside ExerciseProvider');
  const state = sessionKey === 'practice' ? ctx.practiceState : ctx.reviewState;
  const dispatch = sessionKey === 'practice' ? ctx.practiceDispatch : ctx.reviewDispatch;
  return { state, dispatch, savedSessions: ctx.savedSessions };
}
