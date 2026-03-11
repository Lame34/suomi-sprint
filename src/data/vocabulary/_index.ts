import type { VocabEntry } from '../../types';

import greetingsData from './greetings.json';
import pronounsData from './pronouns.json';
import numbersData from './numbers.json';
import colorsData from './colors.json';
import familyData from './family.json';
import foodDrinkData from './food-drink.json';
import bodyData from './body.json';
import homeData from './home.json';
import animalsData from './animals.json';
import timeCalendarData from './time-calendar.json';
import weatherNatureData from './weather-nature.json';
import transportData from './transport.json';
import shoppingData from './shopping.json';
import workStudyData from './work-study.json';
import travelData from './travel.json';
import emotionsData from './emotions.json';
import verbsCommonData from './verbs-common.json';
import adjectivesData from './adjectives.json';

/** Metadata for a vocabulary category (without items for lightweight listing) */
export interface VocabCategoryMeta {
  id: string;
  label: string;
  icon: string;
  description: string;
  difficulty: number;
  itemCount: number;
}

/** Full category data including items */
interface VocabCategoryData {
  meta: VocabCategoryMeta;
  items: VocabEntry[];
}

/** All category data, keyed by category ID */
const categoryMap: Record<string, VocabCategoryData> = {};

/** Register a raw JSON import into the category map */
function register(data: {
  category: string;
  categoryLabel: string;
  icon: string;
  description: string;
  difficulty: number;
  items: VocabEntry[];
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

// Register all categories
register(greetingsData as unknown as Parameters<typeof register>[0]);
register(pronounsData as unknown as Parameters<typeof register>[0]);
register(numbersData as unknown as Parameters<typeof register>[0]);
register(colorsData as unknown as Parameters<typeof register>[0]);
register(familyData as unknown as Parameters<typeof register>[0]);
register(foodDrinkData as unknown as Parameters<typeof register>[0]);
register(bodyData as unknown as Parameters<typeof register>[0]);
register(homeData as unknown as Parameters<typeof register>[0]);
register(animalsData as unknown as Parameters<typeof register>[0]);
register(timeCalendarData as unknown as Parameters<typeof register>[0]);
register(weatherNatureData as unknown as Parameters<typeof register>[0]);
register(transportData as unknown as Parameters<typeof register>[0]);
register(shoppingData as unknown as Parameters<typeof register>[0]);
register(workStudyData as unknown as Parameters<typeof register>[0]);
register(travelData as unknown as Parameters<typeof register>[0]);
register(emotionsData as unknown as Parameters<typeof register>[0]);
register(verbsCommonData as unknown as Parameters<typeof register>[0]);
register(adjectivesData as unknown as Parameters<typeof register>[0]);

/**
 * Ordered list of all vocabulary category metadata.
 * Order matches the learning priority from SKILL-data.md.
 */
export const categories: VocabCategoryMeta[] = [
  categoryMap['greetings'].meta,
  categoryMap['pronouns'].meta,
  categoryMap['numbers'].meta,
  categoryMap['colors'].meta,
  categoryMap['family'].meta,
  categoryMap['food-drink'].meta,
  categoryMap['body'].meta,
  categoryMap['home'].meta,
  categoryMap['animals'].meta,
  categoryMap['time-calendar'].meta,
  categoryMap['weather-nature'].meta,
  categoryMap['transport'].meta,
  categoryMap['shopping'].meta,
  categoryMap['work-study'].meta,
  categoryMap['travel'].meta,
  categoryMap['emotions'].meta,
  categoryMap['verbs-common'].meta,
  categoryMap['adjectives'].meta,
];

/** Flat array of ALL vocabulary items across all categories */
export const allVocabulary: VocabEntry[] = Object.values(categoryMap).flatMap(
  (cat) => cat.items,
);

/**
 * Get all vocabulary items for a specific category.
 * @returns Array of VocabEntry, or empty array if category not found.
 */
export function getVocabByCategory(categoryId: string): VocabEntry[] {
  return categoryMap[categoryId]?.items ?? [];
}

/**
 * Get category metadata by ID.
 */
export function getCategoryMeta(categoryId: string): VocabCategoryMeta | undefined {
  return categoryMap[categoryId]?.meta;
}
