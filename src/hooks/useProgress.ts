import { useState, useEffect, useCallback } from 'react';
import type { ProgressRecord, SessionRecord } from '../types';
import { db } from '../lib/db';

interface OverallProgress {
  totalAttempted: number;
  totalCorrect: number;
  totalAttempts: number;
  accuracy: number;
  mastered: number;
  learning: number;
  dueForReview: number;
}

export interface CategoryProgress {
  category: string;
  label: string;
  totalItems: number;
  attempted: number;
  mastered: number;
  accuracy: number;
  dueCount: number;
}

interface WeekActivity {
  sessions: number;
  wordsReviewed: number;
  accuracy: number;
}

interface TodayStats {
  wordsToday: number;
  sessionsToday: number;
}

interface UseProgressReturn {
  overall: OverallProgress;
  loading: boolean;
  refresh: () => Promise<void>;
  getProgressForItem: (itemId: string) => Promise<ProgressRecord | undefined>;
  getCategoryProgress: (category: string, label: string, itemIds: string[]) => Promise<CategoryProgress>;
  getAllCategoryProgress: (categories: { id: string; label: string; itemIds: string[] }[]) => Promise<CategoryProgress[]>;
  getWeekActivity: () => Promise<WeekActivity>;
  getTodayStats: () => Promise<TodayStats>;
  getStreak: () => Promise<number>;
  getRecentSessions: (limit: number) => Promise<SessionRecord[]>;
  getSessionCount: () => Promise<number>;
}

/**
 * Hook for querying aggregate progress stats from IndexedDB.
 */
export function useProgress(): UseProgressReturn {
  const [overall, setOverall] = useState<OverallProgress>({
    totalAttempted: 0,
    totalCorrect: 0,
    totalAttempts: 0,
    accuracy: 0,
    mastered: 0,
    learning: 0,
    dueForReview: 0,
  });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const now = new Date();
    const allProgress = await db.progress.toArray();

    let totalAttempted = 0;
    let totalCorrect = 0;
    let totalAttempts = 0;
    let mastered = 0;
    let learning = 0;
    let dueForReview = 0;

    for (const record of allProgress) {
      if (record.totalAttempts > 0) {
        totalAttempted++;
        totalCorrect += record.correctAttempts;
        totalAttempts += record.totalAttempts;
      }
      if (record.repetitions >= 3) {
        mastered++;
      } else if (record.totalAttempts > 0) {
        learning++;
      }
      if (record.nextReview <= now) {
        dueForReview++;
      }
    }

    const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

    setOverall({
      totalAttempted,
      totalCorrect,
      totalAttempts,
      accuracy,
      mastered,
      learning,
      dueForReview,
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh(); // eslint-disable-line react-hooks/set-state-in-effect -- async data load on mount
  }, [refresh]);

  const getProgressForItem = useCallback(
    async (itemId: string): Promise<ProgressRecord | undefined> => {
      return db.progress.get(itemId);
    },
    [],
  );

  const getCategoryProgress = useCallback(
    async (category: string, label: string, itemIds: string[]): Promise<CategoryProgress> => {
      const now = new Date();
      let attempted = 0;
      let mastered = 0;
      let correct = 0;
      let total = 0;
      let dueCount = 0;

      for (const id of itemIds) {
        const record = await db.progress.get(id);
        if (record && record.totalAttempts > 0) {
          attempted++;
          correct += record.correctAttempts;
          total += record.totalAttempts;
          if (record.repetitions >= 3) mastered++;
          if (record.nextReview <= now) dueCount++;
        }
      }

      return {
        category,
        label,
        totalItems: itemIds.length,
        attempted,
        mastered,
        accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
        dueCount,
      };
    },
    [],
  );

  const getAllCategoryProgress = useCallback(
    async (categories: { id: string; label: string; itemIds: string[] }[]): Promise<CategoryProgress[]> => {
      const now = new Date();
      const allProgress = await db.progress.toArray();
      const progressMap = new Map<string, ProgressRecord>();
      for (const record of allProgress) {
        progressMap.set(record.itemId, record);
      }

      return categories.map(({ id, label, itemIds }) => {
        let attempted = 0;
        let mastered = 0;
        let correct = 0;
        let total = 0;
        let dueCount = 0;

        for (const itemId of itemIds) {
          const record = progressMap.get(itemId);
          if (record && record.totalAttempts > 0) {
            attempted++;
            correct += record.correctAttempts;
            total += record.totalAttempts;
            if (record.repetitions >= 3) mastered++;
            if (record.nextReview <= now) dueCount++;
          }
        }

        return {
          category: id,
          label,
          totalItems: itemIds.length,
          attempted,
          mastered,
          accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
          dueCount,
        };
      });
    },
    [],
  );

  const getWeekActivity = useCallback(async (): Promise<WeekActivity> => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const sessions = await db.sessions.where('date').aboveOrEqual(weekAgo).toArray();

    const totalQuestions = sessions.reduce((s, r) => s + r.totalQuestions, 0);
    const totalCorrect = sessions.reduce((s, r) => s + r.correctAnswers, 0);

    return {
      sessions: sessions.length,
      wordsReviewed: totalQuestions,
      accuracy: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
    };
  }, []);

  const getTodayStats = useCallback(async (): Promise<TodayStats> => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sessions = await db.sessions.where('date').aboveOrEqual(startOfDay).toArray();

    return {
      wordsToday: sessions.reduce((s, r) => s + r.itemCount, 0),
      sessionsToday: sessions.length,
    };
  }, []);

  const getStreak = useCallback(async (): Promise<number> => {
    const sessions = await db.sessions.orderBy('date').reverse().toArray();
    if (sessions.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    let checkDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Check if there's a session today
    const hasToday = sessions.some((s) => {
      const sd = new Date(s.date);
      return sd.getFullYear() === checkDate.getFullYear() &&
        sd.getMonth() === checkDate.getMonth() &&
        sd.getDate() === checkDate.getDate();
    });

    if (!hasToday) {
      // Check yesterday — if no session yesterday, streak is 0
      checkDate = new Date(checkDate.getTime() - 24 * 60 * 60 * 1000);
      const hasYesterday = sessions.some((s) => {
        const sd = new Date(s.date);
        return sd.getFullYear() === checkDate.getFullYear() &&
          sd.getMonth() === checkDate.getMonth() &&
          sd.getDate() === checkDate.getDate();
      });
      if (!hasYesterday) return 0;
    }

    // Count consecutive days backwards
    while (true) {
      const dayMatch = sessions.some((s) => {
        const sd = new Date(s.date);
        return sd.getFullYear() === checkDate.getFullYear() &&
          sd.getMonth() === checkDate.getMonth() &&
          sd.getDate() === checkDate.getDate();
      });
      if (!dayMatch) break;
      streak++;
      checkDate = new Date(checkDate.getTime() - 24 * 60 * 60 * 1000);
    }

    return streak;
  }, []);

  const getRecentSessions = useCallback(async (limit: number): Promise<SessionRecord[]> => {
    return db.sessions.orderBy('date').reverse().limit(limit).toArray();
  }, []);

  const getSessionCount = useCallback(async (): Promise<number> => {
    return db.sessions.count();
  }, []);

  return {
    overall,
    loading,
    refresh,
    getProgressForItem,
    getCategoryProgress,
    getAllCategoryProgress,
    getWeekActivity,
    getTodayStats,
    getStreak,
    getRecentSessions,
    getSessionCount,
  };
}
