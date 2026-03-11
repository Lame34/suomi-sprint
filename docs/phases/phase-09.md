# Phase 09 — Stats & Progress Tracking

## Started: 2026-03-11

### Actions
- [22:00] Read skills/SKILL-frontend.md for chart/stats patterns and design tokens
- [22:01] Read existing StatsPage.tsx (placeholder), db.ts, types/index.ts, useProgress.ts, useExercise.ts
- [22:02] Read vocabulary/_index.ts and phrases/_index.ts for category metadata structure
- [22:05] Added `SessionRecord` type to `src/types/index.ts`:
  - Fields: id (auto-increment), date, mode (practice/review), totalQuestions, correctAnswers, accuracy, durationMs, itemCount
- [22:07] Updated `src/lib/db.ts`:
  - Added `sessions` table to Dexie schema (version 2 migration)
  - Indexed on `++id, date, mode` for efficient queries
  - Version 1 → 2 upgrade is non-destructive (adds table only)
- [22:10] Updated `src/hooks/useExercise.ts`:
  - Persists `SessionRecord` to IndexedDB when session completes
  - Uses `sessionSavedRef` to prevent duplicate writes on re-renders
  - Resets flag on session restart (status → idle)
  - Records: date, mode, questions, correct count, accuracy%, duration, unique item count
- [22:15] Rewrote `src/hooks/useProgress.ts`:
  - Expanded `CategoryProgress` type: now includes label, totalItems, dueCount
  - Added `getAllCategoryProgress()`: batch query using single `db.progress.toArray()` + Map for O(1) lookups — avoids N+1 queries
  - Added `getWeekActivity()`: sessions in last 7 days, total questions, accuracy
  - Added `getTodayStats()`: words practiced today, sessions today
  - Added `getStreak()`: consecutive days with activity (checks today, then backwards)
  - Added `getRecentSessions(limit)` and `getSessionCount()`
  - Exported `CategoryProgress` type for use by ProgressChart and StatsPage
- [22:20] Created `src/components/stats/ProgressChart.tsx`:
  - Pure CSS horizontal bar chart — no chart library
  - Shows accuracy per category with colored bars
  - Color coding: green (>=80%), yellow (50-80%), red (<50%)
  - Sub-text shows practiced/total count and mastered count
  - Sorted by most practiced categories first
  - Empty state message when no categories practiced
- [22:25] Rewrote `src/pages/StatsPage.tsx`:
  - Overall stats grid (2x2): total sessions, accuracy%, words practiced, words mastered
  - Learning status breakdown: mastered (green dot), learning (yellow dot), new (grey dot) with counts
  - Stacked progress bar showing mastered/learning as fraction of total items
  - Last 7 days activity card: sessions, questions, accuracy (color-coded)
  - Accuracy by Category section using ProgressChart component
  - Category Details: expandable sections per category with practiced/total, mastered, accuracy, due count, mini progress bar
  - Color-coded dots per category row matching accuracy level
  - Refreshes on tab visibility change
- [22:30] Rewrote `src/pages/HomePage.tsx`:
  - Quick stats: mastered, accuracy%, words today, day streak (with flame icon)
  - Streak shown in warning color when active (>0)
  - Review CTA with Clock icon and count badge when items due
  - "Continue Learning" button when nothing due
  - Focus Areas card: up to 3 categories with accuracy <70%, sorted worst first
  - Focus areas link directly to practice with that category pre-selected
  - Quick Actions: Browse Vocabulary, Free Practice
  - Word of the day (deterministic daily pick)
  - All data refreshes on visibility change
- [22:32] Build — zero TypeScript errors

### Files Created/Modified
| File | Action | Description |
|------|--------|-------------|
| `src/types/index.ts` | Modified | Added `SessionRecord` interface |
| `src/lib/db.ts` | Modified | Added `sessions` table (v2 migration) |
| `src/hooks/useExercise.ts` | Modified | Persists session records on completion |
| `src/hooks/useProgress.ts` | Rewritten | Category progress, week activity, streak, today stats |
| `src/components/stats/ProgressChart.tsx` | Created | Pure CSS horizontal bar chart by category |
| `src/pages/StatsPage.tsx` | Rewritten | Full stats with breakdown, chart, expandable categories |
| `src/pages/HomePage.tsx` | Rewritten | Dashboard with today stats, streak, focus areas |

### Design Decisions
- **Session history in IndexedDB**: Added `sessions` table (Dexie v2) to persist session records. Enables streak calculation, weekly activity, and session count without re-deriving from progress records.
- **Batch category queries**: `getAllCategoryProgress()` loads all progress records once into a Map, then iterates categories — O(N) total instead of O(N*M) individual queries. Critical for the stats page which queries 24 categories.
- **Pure CSS bars over chart library**: ProgressChart uses simple div bars with Tailwind classes. No bundle size impact, perfect for the 3-tier color coding needed.
- **Streak logic**: Counts consecutive days backwards from today. If no session today, checks yesterday — if missing, streak is 0. Handles timezone by using local date comparisons.
- **Focus areas threshold**: Categories below 70% accuracy shown as focus areas on HomePage. Links go directly to PracticePage with `?category=X&type=vocab/phrase` deep-link.
- **Dexie v2 migration**: Non-destructive upgrade — only adds the sessions table. Existing progress and settings data preserved automatically.

### Completed: 2026-03-11
