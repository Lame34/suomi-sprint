import Dexie, { type Table } from 'dexie';
import type { ProgressRecord, UserSettings, ExerciseType, SessionRecord } from '../types';

/** Default settings for new users */
export const DEFAULT_SETTINGS: UserSettings = {
  questionsPerSession: 15,
  exerciseTypes: ['mcq', 'match-pairs', 'free-translation', 'fill-blank'] as ExerciseType[],
  showHints: true,
  autoAdvance: true,
  reviewMode: 'mixed',
};

/**
 * SuomiSprint IndexedDB database via Dexie.js.
 * Tables: progress (spaced repetition state), settings (user preferences), sessions (history).
 */
export class SuomiSprintDB extends Dexie {
  progress!: Table<ProgressRecord, string>;
  settings!: Table<UserSettings & { id: number }, number>;
  sessions!: Table<SessionRecord, number>;

  constructor() {
    super('SuomiSprintDB');

    this.version(1).stores({
      progress: 'itemId, itemType, nextReview, easeFactor',
      settings: 'id',
    });

    this.version(2).stores({
      progress: 'itemId, itemType, nextReview, easeFactor',
      settings: 'id',
      sessions: '++id, date, mode',
    });
  }
}

export const db = new SuomiSprintDB();

/**
 * Retrieve user settings from IndexedDB, or return defaults if none saved.
 */
export async function getSettings(): Promise<UserSettings> {
  const stored = await db.settings.get(1);
  if (stored) {
    const { id: _id, ...settings } = stored;
    void _id;
    return settings;
  }
  return { ...DEFAULT_SETTINGS };
}

/**
 * Save user settings to IndexedDB.
 */
export async function saveSettings(settings: UserSettings): Promise<void> {
  await db.settings.put({ ...settings, id: 1 });
}
