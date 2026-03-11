# Phase 07 — All Exercise Types

## Started: 2026-03-11

### Actions
- [20:00] Read skills/SKILL-exercises.md and skills/SKILL-frontend.md for exercise specs
- [20:01] Read existing exercise-generator.ts, ExerciseShell.tsx, MCQ.tsx, PracticePage.tsx, utils.ts, types/index.ts
- [20:10] Created `src/components/exercises/MatchPairs.tsx`:
  - Selects 5 items: exercise item + 4 from same category (fallback to full pool)
  - Left column: English (shuffled), Right column: Finnish (shuffled independently)
  - Tap left → highlight blue, tap right → check match
  - Correct: both flash green (answer-correct), dim to 40% with line-through
  - Wrong: both flash red + shake (answer-wrong), auto-reset after 600ms
  - Tracks wrong attempts count; complete when all 5 matched
  - Scoring: correct=no wrong attempts, almost=1-2 wrong, wrong=3+
  - Finnish words in serif font, hint text shown when left selected
- [20:20] Created `src/components/exercises/FreeTranslation.tsx`:
  - Direction-aware: en-to-fi (type Finnish) or fi-to-en (type English)
  - Auto-focus input on question load (100ms delay for DOM settle)
  - Finnish special chars bar: ä, ö, å, Ä, Ö, Å — pill buttons, bg-ice border-frost
  - Each char button inserts at cursor position via inputRef.selectionStart
  - Submit via button or Enter key
  - Fuzzy matching via `checkTranslation()` from utils.ts:
    - Exact match → "Correct!" (green)
    - Missing accents (ä→a) → "Almost! Watch the ä/ö" (warning)
    - Levenshtein ≤ 1 → "Almost! Check spelling" (warning)
    - Otherwise → "Not quite." + correct answer shown (red)
  - Input styling: green border for correct/almost, red for wrong
  - Check/X icons inside input after submit
  - Special chars bar hidden after submit and when direction is fi-to-en
- [20:30] Created `src/components/exercises/FillBlank.tsx`:
  - Randomly alternates between sub-type A (fill blank) and sub-type B (word order)
  - Word-order only for phrases with 3+ Finnish words
  - **Sub-type A (Fill Blank)**:
    - Picks random word from Finnish sentence to blank out
    - Shows sentence with dashed border blank, 3 word options (1 correct + 2 distractors)
    - Distractors: random Finnish words from other pool items
    - Tap option → fills blank, immediate correct/wrong feedback
    - Finnish sentence in serif font
  - **Sub-type B (Word Order)**:
    - Scrambles Finnish words (re-shuffles if accidentally correct order)
    - Answer zone: dashed border area, tap to place/remove words
    - Word pool: pill buttons with Finnish words in serif
    - "Check Answer" button appears when all words placed
    - Correct: green answer zone with check icon
    - Wrong: red answer zone with X icon + correct sentence shown
- [20:35] Updated `src/components/exercises/ExerciseShell.tsx`:
  - Removed Phase 7 placeholder fallback
  - Routes to all 4 exercise types: MCQ, MatchPairs, FreeTranslation, FillBlank
  - Each receives exercise, pool, questionStartTime, onAnswer, disabled props
- [20:37] Updated `src/lib/exercise-generator.ts`:
  - Added `isTypeViable()` function: MCQ needs 4+ items, match-pairs needs 5+, others always work
  - `generateExercises()` now filters enabled types to only viable ones for pool size
  - Prevents errors from assigning MCQ/match-pairs when pool is too small
- [20:40] Updated `src/pages/PracticePage.tsx`:
  - Added exercise type toggle grid (2x2): MCQ, Match Pairs, Free Translation, Fill the Blank
  - Each type toggleable on/off (minimum 1 must remain enabled)
  - Types loaded from user settings on mount
  - Uses all enabled types in `generateExercises()` call
  - Start button now requires minimum 2 items (down from 4, since free-translation works with any count)
  - Added Lucide icons for each type (Target, Shuffle, Type, AlignLeft)
- [20:42] Build — zero TypeScript errors, PracticePage 29KB code-split

### Files Created/Modified
| File | Action | Description |
|------|--------|-------------|
| `src/components/exercises/MatchPairs.tsx` | Created | 5-pair matching with tap-to-match flow |
| `src/components/exercises/FreeTranslation.tsx` | Created | Type answer + Finnish chars bar + fuzzy matching |
| `src/components/exercises/FillBlank.tsx` | Created | Fill-blank + word-order dual sub-types |
| `src/components/exercises/ExerciseShell.tsx` | Modified | Routes all 4 exercise types |
| `src/lib/exercise-generator.ts` | Modified | Type viability checks |
| `src/pages/PracticePage.tsx` | Modified | Type toggle grid, all types enabled |

### Design Decisions
- **MatchPairs picks from pool**: Component generates its own 5 pairs from the item pool, preferring same category. Falls back to other categories if needed.
- **FreeTranslation direction-aware**: en-to-fi shows special chars bar (user types Finnish), fi-to-en hides it (user types English). Input styled with serif font for Finnish direction.
- **FillBlank adapts to content**: For phrases with 3+ words, randomly picks fill-blank or word-order. For short phrases or vocab words, always uses fill-blank.
- **Word-order scramble guarantee**: Re-shuffles up to 5 times to ensure scrambled order differs from correct order.
- **Type viability filtering**: Generator automatically excludes MCQ/match-pairs when pool is too small, preventing empty options or missing pairs.
- **Minimum 1 type enforced**: Toggle grid prevents deselecting the last type.

### Completed: 2026-03-11
