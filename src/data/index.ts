/**
 * Master data index — unified access to all vocabulary and phrase data.
 */
import type { DataItem } from '../types';
import { isVocabEntry } from '../types';

import {
  categories as vocabCategories,
  allVocabulary,
  getVocabByCategory,
  getCategoryMeta as getVocabCategoryMeta,
} from './vocabulary/_index';
import type { VocabCategoryMeta } from './vocabulary/_index';

import {
  categories as phraseCategories,
  allPhrases,
  getPhrasesByCategory,
  getPhraseCategoryMeta,
} from './phrases/_index';
import type { PhraseCategoryMeta } from './phrases/_index';

// Re-export everything
export {
  vocabCategories,
  allVocabulary,
  getVocabByCategory,
  getVocabCategoryMeta,
  phraseCategories,
  allPhrases,
  getPhrasesByCategory,
  getPhraseCategoryMeta,
  isVocabEntry,
};
export type { VocabCategoryMeta, PhraseCategoryMeta };

/** All items (vocab + phrases) combined */
const _allItems: DataItem[] = [...allVocabulary, ...allPhrases];

/** ID lookup map built once for O(1) access */
const _idMap = new Map<string, DataItem>();
for (const item of _allItems) {
  _idMap.set(item.id, item);
}

/**
 * Get all data items (vocabulary + phrases) unified.
 */
export function getAllItems(): readonly DataItem[] {
  return _allItems;
}

/**
 * Look up any item (vocab or phrase) by its ID.
 * @returns The item, or undefined if not found.
 */
export function getItemById(id: string): DataItem | undefined {
  return _idMap.get(id);
}

/**
 * Search items by query string. Matches against finnish and english fields.
 * Case-insensitive partial match.
 * @returns Matching items, sorted by relevance (exact match first, then prefix, then contains).
 */
export function searchItems(query: string): DataItem[] {
  if (!query || query.trim().length === 0) return [];

  const q = query.trim().toLowerCase();

  const exact: DataItem[] = [];
  const prefix: DataItem[] = [];
  const contains: DataItem[] = [];

  for (const item of _allItems) {
    const fi = item.finnish.toLowerCase();
    const en = item.english.toLowerCase();

    if (fi === q || en === q) {
      exact.push(item);
    } else if (fi.startsWith(q) || en.startsWith(q)) {
      prefix.push(item);
    } else if (fi.includes(q) || en.includes(q)) {
      contains.push(item);
    }
  }

  return [...exact, ...prefix, ...contains];
}

/**
 * Get total counts for display.
 */
export function getDataStats(): {
  totalVocab: number;
  totalPhrases: number;
  totalItems: number;
  vocabCategoryCount: number;
  phraseCategoryCount: number;
} {
  return {
    totalVocab: allVocabulary.length,
    totalPhrases: allPhrases.length,
    totalItems: _allItems.length,
    vocabCategoryCount: vocabCategories.length,
    phraseCategoryCount: phraseCategories.length,
  };
}
