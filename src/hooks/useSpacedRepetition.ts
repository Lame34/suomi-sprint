import { useState, useEffect, useCallback } from 'react';
import type { DataItem, ProgressRecord } from '../types';
import { isVocabEntry } from '../types';
import { db } from '../lib/db';
import { updateSM2, createInitialProgress } from '../lib/sm2';
import { getItemById } from '../data/index';

interface DueItem {
  item: DataItem;
  progress: ProgressRecord;
  overdueDays: number;
}

interface UseSpacedRepetitionReturn {
  dueItems: DueItem[];
  dueCount: number;
  loading: boolean;
  refresh: () => Promise<void>;
  getItemsDueForReview: () => Promise<DataItem[]>;
  updateAfterExercise: (itemId: string, quality: number) => Promise<void>;
  getNextReviewDate: (itemId: string) => Promise<Date | null>;
}

/**
 * Hook for querying and managing spaced repetition state.
 * Fetches items due for review from IndexedDB, sorted by overdue first then lowest easeFactor.
 */
export function useSpacedRepetition(): UseSpacedRepetitionReturn {
  const [dueItems, setDueItems] = useState<DueItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const now = new Date();

    // Get all progress records where nextReview <= now
    const allProgress = await db.progress
      .where('nextReview')
      .belowOrEqual(now)
      .toArray();

    const items: DueItem[] = [];
    for (const progress of allProgress) {
      const item = getItemById(progress.itemId);
      if (!item) continue;

      const overdueDays = Math.max(
        0,
        (now.getTime() - progress.nextReview.getTime()) / (24 * 60 * 60 * 1000),
      );
      items.push({ item, progress, overdueDays });
    }

    // Sort: overdue first, then lowest easeFactor (hardest items)
    items.sort((a, b) => {
      if (Math.abs(a.overdueDays - b.overdueDays) > 0.5) {
        return b.overdueDays - a.overdueDays;
      }
      return a.progress.easeFactor - b.progress.easeFactor;
    });

    setDueItems(items);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh(); // eslint-disable-line react-hooks/set-state-in-effect -- async data load on mount
  }, [refresh]);

  const getItemsDueForReview = useCallback(async (): Promise<DataItem[]> => {
    const now = new Date();
    const allProgress = await db.progress
      .where('nextReview')
      .belowOrEqual(now)
      .toArray();

    const items: { item: DataItem; overdueDays: number; easeFactor: number }[] = [];
    for (const progress of allProgress) {
      const item = getItemById(progress.itemId);
      if (!item) continue;
      const overdueDays = (now.getTime() - progress.nextReview.getTime()) / (24 * 60 * 60 * 1000);
      items.push({ item, overdueDays, easeFactor: progress.easeFactor });
    }

    items.sort((a, b) => {
      if (Math.abs(a.overdueDays - b.overdueDays) > 0.5) {
        return b.overdueDays - a.overdueDays;
      }
      return a.easeFactor - b.easeFactor;
    });

    return items.map((i) => i.item);
  }, []);

  const updateAfterExercise = useCallback(
    async (itemId: string, quality: number) => {
      const item = getItemById(itemId);
      if (!item) return;

      const itemType = isVocabEntry(item) ? ('vocab' as const) : ('phrase' as const);
      const existing = await db.progress.get(itemId);
      const record = existing ?? createInitialProgress(itemId, itemType);
      const updated = updateSM2(record, quality);
      await db.progress.put(updated);
    },
    [],
  );

  const getNextReviewDate = useCallback(async (itemId: string): Promise<Date | null> => {
    const record = await db.progress.get(itemId);
    return record?.nextReview ?? null;
  }, []);

  return {
    dueItems,
    dueCount: dueItems.length,
    loading,
    refresh,
    getItemsDueForReview,
    updateAfterExercise,
    getNextReviewDate,
  };
}
