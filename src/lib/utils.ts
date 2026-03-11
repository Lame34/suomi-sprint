import type { MatchResult } from '../types';

/**
 * Compute Levenshtein distance between two strings.
 */
export function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0) as number[]);

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }

  return dp[m][n];
}

/**
 * Normalize a string for comparison: trim + lowercase.
 */
function normalize(s: string): string {
  return s.trim().toLowerCase();
}

/**
 * Remove Finnish diacritics for lenient comparison.
 */
function deAccent(s: string): string {
  return s.replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/å/g, 'a');
}

/**
 * Check a user's free-translation answer against the correct answer.
 * Returns 'correct', 'almost' (typo/missing diacritics), or 'wrong'.
 */
export function checkTranslation(input: string, correct: string): MatchResult {
  const inputN = normalize(input);
  const correctN = normalize(correct);

  if (inputN === correctN) return 'correct';
  if (deAccent(inputN) === deAccent(correctN)) return 'almost';
  if (levenshtein(inputN, correctN) <= 1) return 'almost';

  return 'wrong';
}

/**
 * Format a date relative to now (e.g. "in 2 days", "overdue by 3 days").
 */
export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'tomorrow';
  if (diffDays > 1) return `in ${diffDays} days`;
  if (diffDays === -1) return 'yesterday';
  return `${Math.abs(diffDays)} days overdue`;
}
