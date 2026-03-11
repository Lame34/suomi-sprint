import type { DataItem, Exercise, ExerciseType } from '../types';

/**
 * Shuffle an array using Fisher-Yates algorithm.
 * Returns a new array (does not mutate original).
 */
export function shuffle<T>(array: readonly T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Check if a type is viable for a given item and pool size.
 * - MCQ: needs 4+ items in pool
 * - Match pairs: needs 5+ items in pool
 * - Free translation: always works
 * - Fill blank: always works (adapts sub-type based on word count)
 */
function isTypeViable(type: ExerciseType, poolSize: number): boolean {
  if (type === 'mcq') return poolSize >= 4;
  if (type === 'match-pairs') return poolSize >= 5;
  return true;
}

/**
 * Generate a practice session of exercises from a pool of data items.
 * Distributes exercise types evenly and randomizes direction.
 * Validates that each assigned type is viable for the pool.
 *
 * @param items - Pool of vocabulary/phrase items to create exercises from
 * @param count - Number of exercises to generate
 * @param enabledTypes - Which exercise types are enabled
 * @returns Shuffled array of exercises ready for a session
 */
export function generateExercises(
  items: readonly DataItem[],
  count: number,
  enabledTypes: readonly ExerciseType[],
): Exercise[] {
  if (items.length === 0 || enabledTypes.length === 0) return [];

  // Filter to only viable types for this pool
  const viableTypes = enabledTypes.filter((t) => isTypeViable(t, items.length));
  if (viableTypes.length === 0) return [];

  const selected = shuffle(items).slice(0, count);

  const exercises: Exercise[] = selected.map((item, i) => ({
    item,
    type: viableTypes[i % viableTypes.length],
    direction: Math.random() > 0.5 ? 'en-to-fi' : 'fi-to-en',
  }));

  return shuffle(exercises);
}

/**
 * Generate 4 MCQ options for a given correct item.
 * Returns a shuffled array with the correct item and 3 distractors.
 *
 * Distractors: same category + similar difficulty (±1).
 * If not enough in category, borrows from the full pool.
 */
export function generateMCQOptions(
  correct: DataItem,
  pool: readonly DataItem[],
): DataItem[] {
  // Prefer same category, similar difficulty
  const sameCat = pool.filter(
    (item) =>
      item.id !== correct.id &&
      item.category === correct.category &&
      Math.abs(item.difficulty - correct.difficulty) <= 1,
  );

  // If not enough, expand to full pool (excluding correct)
  const fallback = pool.filter(
    (item) => item.id !== correct.id && item.category !== correct.category,
  );

  const candidates = shuffle([...sameCat, ...fallback]);
  const distractors = candidates.slice(0, 3);

  // Ensure we always have 4 options (pad with any available if needed)
  while (distractors.length < 3 && pool.length > 1) {
    const remaining = pool.filter(
      (item) => item.id !== correct.id && !distractors.some((d) => d.id === item.id),
    );
    if (remaining.length === 0) break;
    distractors.push(remaining[0]);
  }

  return shuffle([correct, ...distractors]);
}
