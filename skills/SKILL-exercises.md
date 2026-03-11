# SKILL — Exercises (Exercise Mechanics & Generation)

> Read this skill before implementing ANY exercise type or session logic.

## Exercise Type Specifications

### 1. MCQ (Multiple Choice Question)

**Display**:
```
┌─────────────────────────────────┐
│  ━━━━━━━━━━━━━━━━━░░░░░░░░░░░  │  ← Progress bar
│  3 / 15                         │
│                                 │
│  What is the Finnish word for:  │
│                                 │
│      "Thank you"                │  ← English prompt (large)
│                                 │
│  ┌─────────────────────────┐    │
│  │  A) Kiitos              │    │  ← Option (Finnish serif font)
│  └─────────────────────────┘    │
│  ┌─────────────────────────┐    │
│  │  B) Anteeksi            │    │
│  └─────────────────────────┘    │
│  ┌─────────────────────────┐    │
│  │  C) Ole hyvä            │    │
│  └─────────────────────────┘    │
│  ┌─────────────────────────┐    │
│  │  D) Tervetuloa           │    │
│  └─────────────────────────┘    │
└─────────────────────────────────┘
```

**Logic**:
- Direction: randomly alternate EN→FI and FI→EN within a session
- Distractors: pick 3 wrong answers from SAME category + SAME difficulty (±1)
- If category has < 4 items, borrow from related categories
- Shuffle option order every time
- On tap: immediately highlight correct/wrong, wait 1.5s, advance
- Track: `firstTryCorrect` boolean for SM-2 scoring

### 2. Match Pairs

**Display**:
```
┌─────────────────────────────────┐
│  Match the pairs                │
│  ━━━━━━━━━━━━━━━━━░░░░░░░░░░░  │
│                                 │
│  ┌──────────┐  ┌──────────┐    │
│  │  Hello   │  │  Kiitos  │    │  ← Left: English, Right: Finnish
│  └──────────┘  └──────────┘    │
│  ┌──────────┐  ┌──────────┐    │
│  │  Thanks  │  │  Hei     │    │
│  └──────────┘  └──────────┘    │
│  ┌──────────┐  ┌──────────┐    │
│  │  Yes     │  │  Ei      │    │
│  └──────────┘  └──────────┘    │
│  ┌──────────┐  ┌──────────┐    │
│  │  No      │  │  Kyllä   │    │
│  └──────────┘  └──────────┘    │
│  ┌──────────┐  ┌──────────┐    │
│  │  Please  │  │  Olkaa   │    │
│  └──────────┘  │  hyvä    │    │
│                 └──────────┘    │
└─────────────────────────────────┘
```

**Logic**:
- Show 5 pairs per round
- Left column: English (shuffled), Right column: Finnish (shuffled independently)
- Tap logic: tap left → highlight blue. Tap right → check match
  - Correct: both flash green, shrink and disappear (200ms)
  - Wrong: both flash red + shake, deselect
- When all 5 matched, auto-advance to next question/round
- Count as 1 "question" worth 5 mini-answers for scoring
- Track: number of wrong attempts per round

### 3. Free Translation (Type the answer)

**Display**:
```
┌─────────────────────────────────┐
│  ━━━━━━━━━━━━━━━━━░░░░░░░░░░░  │
│  7 / 15                         │
│                                 │
│  Translate to Finnish:          │
│                                 │
│      "Good morning"             │
│                                 │
│  ┌─────────────────────────┐    │
│  │  Type your answer...    │    │  ← Text input
│  └─────────────────────────┘    │
│                                 │
│  ┌───┬───┬───┬───┬───┬───┐     │
│  │ ä │ ö │ å │ Ä │ Ö │ Å │     │  ← Special chars bar
│  └───┴───┴───┴───┴───┴───┘     │
│                                 │
│  [    Check Answer    ]         │  ← Submit button
│                                 │
└─────────────────────────────────┘
```

**After submit (correct)**:
```
│  ┌─────────────────────────┐    │
│  │  ✓ Hyvää huomenta      │    │  ← Green border, checkmark
│  └─────────────────────────┘    │
│       Correct!                  │
```

**After submit (wrong)**:
```
│  ┌─────────────────────────┐    │
│  │  ✗ Hyvä huomenta       │    │  ← Red border, X mark
│  └─────────────────────────┘    │
│  Correct answer:                │
│  Hyvää huomenta                 │  ← Finnish serif, green
│                                 │
│  [    Continue    ]             │
```

**Matching Logic** (critical — be generous):
```typescript
function checkTranslation(input: string, correct: string): MatchResult {
  const normalize = (s: string) => s.trim().toLowerCase();
  const inputN = normalize(input);
  const correctN = normalize(correct);
  
  // Exact match
  if (inputN === correctN) return 'correct';
  
  // Accept without special chars (ä→a, ö→o) as "almost correct"
  const deAccent = (s: string) => s.replace(/ä/g,'a').replace(/ö/g,'o').replace(/å/g,'a');
  if (deAccent(inputN) === deAccent(correctN)) return 'almost'; // show "Almost! Watch the ä/ö"
  
  // Levenshtein distance ≤ 1: typo tolerance
  if (levenshtein(inputN, correctN) <= 1) return 'almost';
  
  // Multiple correct answers (if english has "Hello / Hi", accept both Finnish forms)
  // Handle via acceptedAnswers array in data
  
  return 'wrong';
}
```

- "Almost correct" → counts as correct for progression, but shows the right spelling
- Always show correct answer after wrong
- Auto-focus input when question appears
- Submit on Enter key

### 4. Fill in the Blank / Word Order

**Sub-type A: Fill in the Blank**
```
┌─────────────────────────────────┐
│  Complete the sentence:         │
│                                 │
│  "Where is the toilet?"        │  ← English reference
│                                 │
│  Missä on _____ ?               │  ← Sentence with blank
│                                 │
│  ┌──────┐ ┌──────┐ ┌──────┐   │
│  │ talo │ │vessa │ │koira │   │  ← Word options (tap to fill)
│  └──────┘ └──────┘ └──────┘   │
└─────────────────────────────────┘
```

**Sub-type B: Word Order**
```
┌─────────────────────────────────┐
│  Arrange in Finnish:            │
│                                 │
│  "I don't speak Finnish"        │  ← English reference
│                                 │
│  ┌─────────────────────────┐    │
│  │  (drop zone)            │    │  ← Answer area
│  └─────────────────────────┘    │
│                                 │
│  ┌──────┐ ┌──────┐ ┌──────┐   │
│  │puhu  │ │suomea│ │ En   │   │  ← Draggable/tappable words
│  └──────┘ └──────┘ └──────┘   │
└─────────────────────────────────┘
```

**Logic**:
- Alternate 50/50 between fill-blank and word-order within a session
- Fill-blank: show 3 options (1 correct + 2 distractors from same sentence context)
- Word-order: scramble the Finnish words, user taps to place in order
  - Tap a word → moves to answer zone (in order of taps)
  - Tap word in answer zone → returns to pool
  - "Check" button validates
- Only use phrases that have 3+ words for word-order

## Session Generation Algorithm

```typescript
function generateSession(
  mode: 'practice' | 'review',
  settings: UserSettings,
  category?: string
): Exercise[] {
  const count = settings.questionsPerSession;
  const enabledTypes = settings.exerciseTypes;
  
  let pool: DataItem[];
  
  if (mode === 'review') {
    // Spaced repetition: items due for review
    pool = getItemsDueForReview(); // nextReview <= now
    pool.sort((a, b) => {
      // Overdue first, then lowest easeFactor
      const aOverdue = daysSince(a.nextReview);
      const bOverdue = daysSince(b.nextReview);
      if (aOverdue !== bOverdue) return bOverdue - aOverdue;
      return a.easeFactor - b.easeFactor;
    });
  } else {
    // Practice: from selected category or all
    pool = category ? getItemsByCategory(category) : getAllItems();
    // Prioritize unseen items, then low-accuracy items
    pool.sort((a, b) => {
      if (!a.progress && b.progress) return -1; // New items first
      if (a.progress && !b.progress) return 1;
      const aAcc = a.progress ? a.progress.correctAttempts / a.progress.totalAttempts : 0;
      const bAcc = b.progress ? b.progress.correctAttempts / b.progress.totalAttempts : 0;
      return aAcc - bAcc; // Lowest accuracy first
    });
  }
  
  // Take top N items
  const items = pool.slice(0, count);
  
  // Assign exercise types: distribute evenly across enabled types
  // Shuffle the final list
  return shuffle(items.map((item, i) => ({
    item,
    type: enabledTypes[i % enabledTypes.length],
    direction: Math.random() > 0.5 ? 'en-to-fi' : 'fi-to-en'
  })));
}
```

## Scoring & SM-2 Integration

After each exercise answer:
```typescript
function processAnswer(itemId: string, result: ExerciseResult): void {
  const quality = mapResultToQuality(result);
  // quality: 5=instant correct, 4=correct after thought, 3=almost correct
  //          1=wrong but tried, 0=wrong/skipped
  
  updateSM2(itemId, quality);
  updateStats(itemId, result);
}

function mapResultToQuality(result: ExerciseResult): number {
  if (result.correct && result.firstTry && result.timeMs < 5000) return 5;
  if (result.correct && result.firstTry) return 4;
  if (result.almostCorrect) return 3;
  if (!result.correct && result.attempted) return 1;
  return 0;
}
```

## Session Complete Screen

After all questions answered:
```
┌─────────────────────────────────┐
│                                 │
│        Session Complete!        │
│                                 │
│     ┌───────────────────┐       │
│     │    12 / 15         │       │
│     │    80% correct     │       │
│     └───────────────────┘       │
│                                 │
│  New words learned: 4           │
│  Words to review: 3             │
│  Best streak: 7 in a row        │
│                                 │
│  [  Practice Again  ]           │
│  [  Review Mistakes ]           │  ← Only if mistakes > 0
│  [  Back to Home    ]           │
│                                 │
└─────────────────────────────────┘
```

## Edge Cases to Handle

1. **Not enough items for MCQ distractors**: Borrow from adjacent categories/difficulties
2. **All items mastered**: Show "You've mastered this category!" with option to reset
3. **No items due for review**: Show "Nothing to review! Try learning new words."
4. **Very short phrases (1-2 words)**: Skip word-order for these, use fill-blank or MCQ instead
5. **Network offline**: Everything works — no network needed after install
6. **IndexedDB full/unavailable**: Warn user, app still works for browsing (no progress saving)
7. **Session interrupted** (user closes app): Don't save partial session, no penalty
