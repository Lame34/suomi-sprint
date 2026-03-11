# Phase 08 — Spaced Repetition System

## Started: 2026-03-11

### Actions
- [21:00] Read CLAUDE.md SM-2 section and skills/SKILL-exercises.md for review session specs
- [21:01] Read existing sm2.ts (already fully implemented), db.ts, useExercise.ts, types/index.ts
- [21:02] Read existing ReviewPage.tsx (placeholder), HomePage.tsx (hardcoded zeros)
- [21:05] Created `src/hooks/useSpacedRepetition.ts`:
  - `useSpacedRepetition()` hook queries IndexedDB for items where `nextReview <= now`
  - Returns `dueItems` (with DataItem + ProgressRecord + overdueDays), `dueCount`, `loading`
  - `getItemsDueForReview()`: async query sorted by overdue first, then lowest easeFactor
  - `updateAfterExercise(itemId, quality)`: looks up/creates progress record, applies SM-2
  - `getNextReviewDate(itemId)`: returns next review date for any item
  - `refresh()`: re-queries due items (called on mount and after sessions)
- [21:10] Created `src/hooks/useProgress.ts`:
  - `useProgress()` hook computes aggregate stats from all progress records
  - Returns `overall`: totalAttempted, totalCorrect, totalAttempts, accuracy%, mastered, learning, dueForReview
  - Mastery threshold: `repetitions >= 3` (SM-2 standard)
  - `getProgressForItem(itemId)`: single item lookup
  - `getCategoryProgress(category, itemIds)`: category-level aggregate
  - `refresh()`: re-computes stats from IndexedDB
- [21:15] Rewrote `src/pages/ReviewPage.tsx`:
  - Three states: loading → due items (start review) → all caught up
  - Due state: shows count, session question count, preview of up to 10 due items with relative dates
  - "Start Review" button generates exercises from due items using `generateExercises()`
  - Active review session delegates to ExerciseShell (same UX as practice)
  - SM-2 updates already happen in useExercise.ts `submitAnswer()` — no duplication needed
  - "All caught up" state: checkmark icon, links to practice and browse
  - Full pool passed to ExerciseShell for MCQ distractor generation
- [21:20] Rewrote `src/pages/HomePage.tsx`:
  - Live stats from `useProgress()`: words mastered, accuracy%, due for review, words practiced
  - Due count from `useSpacedRepetition()` — updates on visibility change
  - Contextual review CTA: "Review N items" button when due > 0, "All caught up" message when 0
  - Word of the day: deterministic daily pick from all items using date-based index
  - Quick actions: Browse Vocabulary, Free Practice
  - Loading state shows "-" placeholders
- [21:22] Build — zero TypeScript errors, ReviewPage 5.6KB code-split, HomePage 5.6KB code-split

### Files Created/Modified
| File | Action | Description |
|------|--------|-------------|
| `src/hooks/useSpacedRepetition.ts` | Created | Due items query, SM-2 integration hook |
| `src/hooks/useProgress.ts` | Created | Aggregate progress stats hook |
| `src/pages/ReviewPage.tsx` | Rewritten | Full review session with due count, ExerciseShell |
| `src/pages/HomePage.tsx` | Rewritten | Live dashboard stats, contextual review CTA |

### Design Decisions
- **No duplicate SM-2 writes**: useExercise.ts already persists SM-2 updates after each answer. ReviewPage reuses the same hook, so review sessions get SM-2 tracking for free.
- **Full pool for distractors**: ReviewPage passes `getAllItems()` as pool to ExerciseShell so MCQ and match-pairs have enough items for distractors, even if only a few items are due.
- **Visibility refresh**: HomePage refreshes stats when the tab regains focus, so returning from a practice/review session shows updated numbers.
- **Deterministic word of day**: Uses date-based index mod total items, giving a consistent word per day without storing state.
- **Due item preview**: Shows up to 10 items with relative dates ("today", "2 days overdue") so the user knows what to expect.

### Completed: 2026-03-11
