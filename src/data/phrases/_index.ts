import type { PhraseEntry } from '../../types';

import survivalData from './survival.json';
import conversationData from './conversation.json';
import restaurantData from './restaurant.json';
import directionsData from './directions.json';
import emergencyData from './emergency.json';
import dailyLifeData from './daily-life.json';

/** Metadata for a phrase category (without items for lightweight listing) */
export interface PhraseCategoryMeta {
  id: string;
  label: string;
  icon: string;
  description: string;
  difficulty: number;
  itemCount: number;
}

/** Full category data including items */
interface PhraseCategoryData {
  meta: PhraseCategoryMeta;
  items: PhraseEntry[];
}

/** All phrase category data, keyed by category ID */
const categoryMap: Record<string, PhraseCategoryData> = {};

/** Register a raw JSON import into the category map */
function register(data: {
  category: string;
  categoryLabel: string;
  icon: string;
  description: string;
  difficulty: number;
  items: PhraseEntry[];
}): void {
  categoryMap[data.category] = {
    meta: {
      id: data.category,
      label: data.categoryLabel,
      icon: data.icon,
      description: data.description,
      difficulty: data.difficulty,
      itemCount: data.items.length,
    },
    items: data.items,
  };
}

// Register all phrase categories
register(survivalData as unknown as Parameters<typeof register>[0]);
register(conversationData as unknown as Parameters<typeof register>[0]);
register(restaurantData as unknown as Parameters<typeof register>[0]);
register(directionsData as unknown as Parameters<typeof register>[0]);
register(emergencyData as unknown as Parameters<typeof register>[0]);
register(dailyLifeData as unknown as Parameters<typeof register>[0]);

/**
 * Ordered list of all phrase category metadata.
 * Order matches learning priority from SKILL-data.md.
 */
export const categories: PhraseCategoryMeta[] = [
  categoryMap['survival'].meta,
  categoryMap['conversation'].meta,
  categoryMap['restaurant'].meta,
  categoryMap['directions'].meta,
  categoryMap['emergency'].meta,
  categoryMap['daily-life'].meta,
];

/** Flat array of ALL phrase items across all categories */
export const allPhrases: PhraseEntry[] = Object.values(categoryMap).flatMap(
  (cat) => cat.items,
);

/**
 * Get all phrase items for a specific category.
 * @returns Array of PhraseEntry, or empty array if category not found.
 */
export function getPhrasesByCategory(categoryId: string): PhraseEntry[] {
  return categoryMap[categoryId]?.items ?? [];
}

/**
 * Get phrase category metadata by ID.
 */
export function getPhraseCategoryMeta(categoryId: string): PhraseCategoryMeta | undefined {
  return categoryMap[categoryId]?.meta;
}
