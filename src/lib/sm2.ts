import type { ProgressRecord } from '../types';

/**
 * SM-2 (SuperMemo 2) spaced repetition algorithm.
 * Updates a progress record based on the quality of the user's response.
 *
 * @param record - Current progress record for the item
 * @param quality - User performance rating (0-5)
 * @returns Updated progress record with new scheduling
 */
export function updateSM2(record: ProgressRecord, quality: number): ProgressRecord {
  const clampedQuality = Math.max(0, Math.min(5, Math.round(quality)));
  const now = new Date();

  let { easeFactor, interval, repetitions } = record;

  if (clampedQuality >= 3) {
    // Correct response
    repetitions += 1;
    if (repetitions === 1) {
      interval = 1;
    } else if (repetitions === 2) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    easeFactor = Math.max(
      1.3,
      easeFactor + (0.1 - (5 - clampedQuality) * (0.08 + (5 - clampedQuality) * 0.02)),
    );
  } else {
    // Incorrect response — reset repetitions, keep easeFactor
    repetitions = 0;
    interval = 1;
  }

  const nextReview = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000);

  return {
    ...record,
    easeFactor,
    interval,
    repetitions,
    nextReview,
    totalAttempts: record.totalAttempts + 1,
    correctAttempts: record.correctAttempts + (clampedQuality >= 3 ? 1 : 0),
    lastAttempted: now,
    lastCorrect: clampedQuality >= 3,
  };
}

/**
 * Create a fresh progress record for a newly-encountered item.
 */
export function createInitialProgress(
  itemId: string,
  itemType: 'vocab' | 'phrase',
): ProgressRecord {
  return {
    itemId,
    itemType,
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    nextReview: new Date(),
    totalAttempts: 0,
    correctAttempts: 0,
    lastAttempted: new Date(),
    lastCorrect: false,
  };
}
