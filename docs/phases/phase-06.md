# Phase 06 — Exercise Engine & MCQ Component

## Started: 2026-03-11

### Actions
- [19:00] Read CLAUDE.md, skills/SKILL-exercises.md, skills/SKILL-frontend.md
- [19:01] Read existing exercise-generator.ts, utils.ts, sm2.ts, db.ts, PracticePage.tsx, types/index.ts, data/index.ts
- [19:05] Rewrote `src/lib/exercise-generator.ts`:
  - Kept existing `shuffle()` and `generateExercises()` functions
  - Added `generateMCQOptions(correct, pool)`: generates 4 shuffled options with 3 distractors from same category ± 1 difficulty, falls back to other categories if needed
- [19:10] Created `src/hooks/useExercise.ts`:
  - `useReducer`-based session state: START_SESSION → ANSWER → feedback → NEXT → ... → COMPLETE
  - Actions: START_SESSION, ANSWER, NEXT, COMPLETE
  - Tracks: currentIndex, results[], sessionStartTime, questionStartTime
  - Auto-advances after 1.5s delay on feedback (clearable via `advance()`)
  - Persists progress to IndexedDB via SM-2 after each answer
  - `mapResultToQuality()` per SKILL-exercises.md: 5=fast correct, 4=correct, 3=almost, 1=wrong+tried, 0=wrong/skipped
  - Computes SessionSummary on COMPLETE: correctAnswers, newWordsLearned, wordsToReview, bestStreak
- [19:15] Created `src/components/exercises/MCQ.tsx`:
  - Shows prompt (English or Finnish based on direction)
  - 4 option buttons with A/B/C/D circle labels
  - Finnish options use serif font (Source Serif 4)
  - Tap → immediate correct/wrong feedback with green/red borders
  - Correct: green border + check icon + `answer-correct` animation
  - Wrong: red border + X icon + `answer-wrong` animation + correct answer highlighted
  - Unselected options dim to 50% opacity after answer
  - `role="option"` + `aria-selected` for accessibility
  - All touch targets min 48px
- [19:20] Created `src/components/exercises/ExerciseShell.tsx`:
  - Progress bar (current/total) with percentage
  - Animated width transition (500ms ease-out)
  - "Tap to continue" skip-wait button during feedback
  - Renders MCQ for `type === 'mcq'`, placeholder for other types (Phase 7)
  - Error boundary wrapping exercise content: catches errors, shows "Try Again" button
- [19:22] Created `src/components/exercises/SessionComplete.tsx`:
  - Trophy icon header
  - Score display: correct/total, percentage (green/yellow/red based on score)
  - 3-column stats grid: new words, to review, best streak
  - Actions: Practice Again, Review Mistakes (only if mistakes > 0), Back to Home
- [19:25] Rewrote `src/pages/PracticePage.tsx`:
  - Category picker dropdown with All Categories / Vocabulary / Phrases sections
  - Deep-link support: `?category=greetings&type=vocab` from WordCard/PhraseCard
  - Loads user settings (questionsPerSession) from IndexedDB on mount
  - Shows session info: questions count, available items
  - Start button disabled if pool < 4 items (need 4 for MCQ options)
  - On start: generates MCQ exercises and launches ExerciseShell
  - Active session renders ExerciseShell in place of setup UI
- [19:27] Build — 2 TypeScript errors:
  - `useRef()` needs explicit initial value in strict mode → added `undefined`
  - Status type narrowing for ExerciseShell prop → explicit union check
- [19:28] Fixed both errors, final build — zero TypeScript errors

### Files Created/Modified
| File | Action | Description |
|------|--------|-------------|
| `src/lib/exercise-generator.ts` | Modified | Added `generateMCQOptions()` |
| `src/hooks/useExercise.ts` | Created | Session state via useReducer + SM-2 persistence |
| `src/components/exercises/MCQ.tsx` | Created | Multiple choice with A/B/C/D, feedback animations |
| `src/components/exercises/ExerciseShell.tsx` | Created | Progress bar, error boundary, exercise routing |
| `src/components/exercises/SessionComplete.tsx` | Created | End-of-session summary with stats |
| `src/pages/PracticePage.tsx` | Rewritten | Category picker, session launcher, exercise display |

### Design Decisions
- **MCQ distractors from same category**: Distractors prioritize same category + similar difficulty (±1). If category has < 4 items, borrows from other categories to always have 4 options.
- **SM-2 quality mapping**: Uses SKILL-exercises.md spec — correct+fast=5, correct=4, almost=3, wrong+tried=1, skipped=0.
- **Auto-advance with skip**: 1.5s feedback delay with "Tap to continue" overlay. Timer is cleared on advance to prevent stale state.
- **Error boundary in ExerciseShell**: Class component error boundary wraps exercise content. On error, shows retry button that resets the session.
- **Phase 7 placeholder**: Non-MCQ exercise types show a placeholder card with "coming in Phase 7" and a skip button that submits a non-attempt result.
- **Deep-link from Learn page**: WordCard/PhraseCard "Practice this category" buttons navigate to `/practice?category=X&type=vocab|phrase`, which pre-selects the category in the picker.
- **Progress bar shows completed questions**: Width = (currentIndex - 1) / total, so it starts empty and fills as questions are completed.

### Completed: 2026-03-11
