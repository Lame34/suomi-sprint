# Prompts Claude Code — SuomiSprint

> Copie-colle chaque prompt dans Claude Code, un par un, dans l'ordre.
> Chaque prompt correspond à une phase du projet.
> Attends que chaque phase soit terminée et validée avant de passer à la suivante.

---

## PROMPT 1 — Initialisation du projet

```
Read CLAUDE.md and all SKILL files in /skills/ before doing anything.

Initialize the SuomiSprint project:

1. Create a new Vite + React + TypeScript project with:
   - `npm create vite@latest suomi-sprint -- --template react-ts`
   - Install dependencies: tailwindcss, postcss, autoprefixer, dexie, react-router-dom, lucide-react, vite-plugin-pwa
   - Configure Tailwind with the Finnish flag color palette from CLAUDE.md
   - Set up CSS custom properties in index.css for all design tokens
   - Configure vite-plugin-pwa with manifest (name: "SuomiSprint", theme_color: "#003580", display: "standalone")
   - Add Google Fonts link in index.html (Instrument Sans, Source Sans 3, Source Serif 4)

2. Create the full project folder structure as defined in CLAUDE.md

3. Set up TypeScript interfaces in /src/types/index.ts:
   - VocabEntry, PhraseEntry, ProgressRecord, UserSettings, ExerciseType, ExerciseResult
   - All interfaces exactly as specified in CLAUDE.md data schema

4. Set up Dexie.js database in /src/lib/db.ts:
   - Tables: progress, settings
   - Default settings: questionsPerSession=15, all exercise types enabled, showHints=true

5. Create the basic App.tsx with React Router:
   - Routes: /, /learn, /practice, /review, /stats, /settings
   - Lazy-loaded pages with Suspense

6. Create a docs/phases/phase-01.md log with everything you did.

Run `npm run build` at the end to verify zero errors.
```

---

## PROMPT 2 — Design System & Layout Shell

```
Read CLAUDE.md and skills/SKILL-frontend.md before starting.

Implement the design system and app layout:

1. Complete the index.css with:
   - All CSS custom properties from the color palette
   - Font-family classes (.font-display, .font-body, .font-finnish)
   - Animation keyframes: correct-pulse, shake, fade-slide-in
   - Tailwind @layer components for common patterns (cards, buttons)
   - Safe area insets for mobile

2. Update tailwind.config.ts:
   - Extend colors with all Finnish palette tokens
   - Extend fontFamily with the 3 font stacks
   - Add custom animations

3. Build layout components:
   - AppShell.tsx: flex column, header + scrollable content + bottom nav
   - Header.tsx: fixed top, title centered, settings gear icon (right)
   - BottomNav.tsx: 4 tabs (Home/BookOpen/Target/BarChart icons from lucide-react)
     - Active state: Finnish blue icon + label + dot indicator
     - Inactive: grey icon + label
     - Uses react-router NavLink for active detection

4. Build placeholder pages (just titles for now):
   - HomePage.tsx, VocabularyPage.tsx (route: /learn), PracticePage.tsx, ReviewPage.tsx (/review), StatsPage.tsx, SettingsPage.tsx

5. Test on mobile viewport (393px width):
   - Bottom nav must be usable with thumb
   - Header must not overlap content
   - Content must scroll independently

6. Log everything in docs/phases/phase-02.md

Run `npm run build` — zero errors.
```

---

## PROMPT 3 — Finnish Language Data (Vocabulary)

```
Read CLAUDE.md and skills/SKILL-data.md carefully before starting.

Generate ALL vocabulary data files. This is the most important phase — accuracy matters.

For each of the 18 vocabulary categories defined in SKILL-data.md:
1. Create a JSON file in /src/data/vocabulary/{category}.json
2. Follow the exact JSON format from SKILL-data.md
3. Generate the target number of items per category (see the table)
4. Ensure:
   - Every Finnish word is accurate and correctly spelled (ä, ö, å where needed)
   - IDs follow the pattern: {category}-{3-digit-number}
   - No duplicate words across categories
   - Notes field populated for difficulty 2+ items
   - At least 1 example sentence for every item
   - partOfSpeech is correct
   - difficulty rating is appropriate (1=absolute beginner, 2=elementary, 3=pre-intermediate)

5. Create /src/data/vocabulary/_index.ts that:
   - Imports all JSON files
   - Exports a categories array with metadata (id, label, icon, description, itemCount)
   - Exports a flat allVocabulary array
   - Exports a getVocabByCategory(categoryId) function

6. Verify: run a script that checks:
   - No duplicate IDs
   - All required fields present
   - No empty strings
   - Total item count matches expectations (550-650 items)

Log everything in docs/phases/phase-03.md including total counts per category.
```

---

## PROMPT 4 — Finnish Language Data (Phrases)

```
Read CLAUDE.md and skills/SKILL-data.md before starting.

Generate ALL phrase data files:

For each of the 6 phrase categories in SKILL-data.md:
1. Create /src/data/phrases/{category}.json
2. Follow the exact phrase JSON format
3. Generate target count per category
4. Ensure:
   - Every Finnish phrase is natural and accurate
   - literalTranslation provided for non-obvious phrases
   - notes include formality level (formal/informal) where relevant
   - words array references actual vocabulary that exists in the vocab data
   - Phrases range from 2 words to full sentences

5. Create /src/data/phrases/_index.ts:
   - Same pattern as vocabulary index
   - Exports categories, allPhrases, getPhrasesByCategory

6. Create /src/data/index.ts — master data index:
   - Exports everything from both vocab and phrases
   - Exports getAllItems() that returns both types unified
   - Exports getItemById(id) that searches both datasets
   - Exports searchItems(query) for future search feature

7. Verify: validation script for phrases same as vocab.

Log in docs/phases/phase-04.md with total phrase counts.
```

---

## PROMPT 5 — Vocabulary & Phrase Browsing

```
Read CLAUDE.md and skills/SKILL-frontend.md before starting.

Build the Learn section (vocabulary + phrase browsing):

1. VocabularyPage.tsx (/learn):
   - Two tabs at top: "Vocabulary" | "Phrases"
   - Tab content switches without page navigation

2. CategoryList.tsx:
   - Grid of category cards (2 columns)
   - Each card: icon (lucide), category name, item count, difficulty badge
   - Card style: white bg, frost border, rounded-xl
   - Tap → navigates to word list for that category
   - Staggered fade-in animation on load

3. WordList.tsx (/learn/vocab/:categoryId):
   - Header: category name + back arrow
   - Search/filter bar (search within category)
   - List of word cards, sorted by difficulty then alphabetical
   - Progress indicator per word (if attempted before): green dot = mastered, yellow = learning, grey = new

4. WordCard.tsx:
   - Tap to expand/collapse
   - Collapsed: Finnish word (serif font, blue) + English translation
   - Expanded: + part of speech, notes, example sentences, difficulty badge
   - "Practice this word" button → starts a mini-session with just this word's category

5. Same pattern for phrases:
   - PhraseList.tsx (/learn/phrases/:categoryId)
   - PhraseCard.tsx: Finnish phrase (serif), English, literal translation, notes

6. All Finnish text must use the serif font (Source Serif 4).
7. Touch targets min 48px.
8. Test scrolling performance with large lists.

Log in docs/phases/phase-05.md.
Build must pass.
```

---

## PROMPT 6 — Exercise Engine & MCQ

```
Read CLAUDE.md, skills/SKILL-exercises.md, and skills/SKILL-frontend.md.

Build the core exercise engine and MCQ component:

1. /src/lib/exercise-generator.ts:
   - generateSession(mode, settings, category?): creates array of Exercise objects
   - Implements the algorithm from SKILL-exercises.md
   - Handles both practice and review modes
   - Distributes exercise types evenly
   - Randomizes direction (EN→FI / FI→EN)
   - Generates distractors for MCQ from same category

2. /src/hooks/useExercise.ts:
   - Manages session state via useReducer
   - Actions: START_SESSION, ANSWER, NEXT, COMPLETE
   - Tracks: currentIndex, answers[], score, startTime
   - Auto-advances after correct (with delay)
   - Computes final stats on COMPLETE

3. ExerciseShell.tsx:
   - Wraps all exercise types
   - Shows progress bar (current/total) at top
   - Handles the answer → feedback → next flow
   - Green/red feedback animations
   - Error boundary

4. MCQ.tsx:
   - Shows prompt (English or Finnish based on direction)
   - 4 option buttons with A/B/C/D labels
   - Tap option → immediately show correct/wrong
   - Correct: green border + pulse animation
   - Wrong: red border + shake + highlight correct answer
   - 1.5s delay then auto-advance (or tap to skip wait)
   - Finnish options use serif font

5. PracticePage.tsx:
   - Category picker (or "All categories")
   - "Start Practice" button
   - Launches ExerciseShell with MCQ exercises
   - Shows SessionComplete at end

6. SessionComplete.tsx:
   - Score display (correct/total, percentage)
   - Stats: new words, words to review, best streak
   - Actions: Practice Again, Review Mistakes, Back to Home

Log in docs/phases/phase-06.md.
```

---

## PROMPT 7 — Remaining Exercise Types

```
Read skills/SKILL-exercises.md and skills/SKILL-frontend.md.

Implement the 3 remaining exercise types:

1. MatchPairs.tsx:
   - Display 5 English words (left) and 5 Finnish words (right), shuffled
   - Tap left word → highlight blue
   - Tap right word → check if match
   - Correct match: both flash green, shrink and disappear
   - Wrong match: both flash red + shake, deselect
   - Complete when all 5 pairs matched
   - Track wrong attempts count

2. FreeTranslation.tsx:
   - Show English prompt, text input for Finnish answer
   - Finnish special characters bar (ä, ö, å, Ä, Ö, Å) above keyboard area
   - Each char button inserts at cursor position
   - Submit button or Enter key to check
   - Implement fuzzy matching from SKILL-exercises.md:
     - Exact match → correct
     - Missing accents (ä→a) → "Almost! Watch the ä/ö"
     - Levenshtein ≤ 1 → "Almost! Check spelling"
     - Otherwise → wrong, show correct answer
   - Auto-focus input on question load

3. FillBlank.tsx:
   - Sub-type A (Fill blank): sentence with ___ gap, 3 word options to pick
   - Sub-type B (Word order): scrambled Finnish words, tap to arrange
   - Randomly alternate between sub-types
   - Fill blank: tap correct word → fills the gap, green flash
   - Word order: tap words to build sentence in answer zone
     - Tap word in answer zone → returns to pool
     - Check button to validate order
   - Only use word-order for phrases with 3+ words

4. Update exercise-generator.ts:
   - Support all 4 types in session generation
   - Generate appropriate data for each type (distractors, blanks, scrambled words)
   - Ensure each type has enough data to function

5. Update PracticePage.tsx:
   - Exercise type filter option (or "All types")
   - Session mixes all enabled types

6. Test all 4 types work correctly with real Finnish data.

Log in docs/phases/phase-07.md.
```

---

## PROMPT 8 — Spaced Repetition System

```
Read CLAUDE.md (SM-2 section) and skills/SKILL-exercises.md.

Implement the complete spaced repetition system:

1. /src/lib/sm2.ts:
   - Implement SM-2 algorithm exactly as specified in CLAUDE.md
   - Function: calculateNextReview(current: ProgressRecord, quality: number) → updated ProgressRecord
   - Quality mapping from exercise results (5=instant, 4=thought, 3=almost, 1=wrong-tried, 0=wrong)
   - New items start with easeFactor=2.5, interval=0, repetitions=0

2. /src/hooks/useSpacedRepetition.ts:
   - getItemsDueForReview(): query IndexedDB for items where nextReview <= now
   - getDueCount(): number of items due
   - updateAfterExercise(itemId, quality): update SM-2 fields in IndexedDB
   - getNextReviewDate(itemId): when this item is next due

3. /src/hooks/useProgress.ts:
   - updateProgress(itemId, result): save attempt to IndexedDB
   - getProgressForItem(itemId): fetch progress record
   - getCategoryProgress(categoryId): aggregate stats for a category
   - getOverallProgress(): total stats across everything

4. ReviewPage.tsx (/review):
   - Shows count of items due for review
   - "Start Review" button if items due
   - "Nothing to review!" message with suggestion to learn new words
   - Review session uses ExerciseShell with items from spaced repetition queue
   - After review, items get rescheduled based on performance

5. Update ExerciseShell to call SM-2 update after each answer in review mode.

6. Update HomePage dashboard:
   - "X items due for review" card with CTA
   - If 0 due: "You're all caught up!" message

Log in docs/phases/phase-08.md.
```

---

## PROMPT 9 — Stats & Progress Dashboard

```
Read skills/SKILL-frontend.md for chart and stats patterns.

Build the statistics and progress tracking:

1. StatsPage.tsx (/stats):
   - Overall stats card: total words learned, total phrases learned, overall accuracy %
   - "Words Mastered" count (items with easeFactor > 2.5 and repetitions >= 5)
   - "Learning" count (items attempted but not mastered)
   - "New" count (items never attempted)

2. ProgressChart.tsx:
   - Simple bar chart showing accuracy per category
   - Use pure CSS/SVG bars (no chart library needed for this)
   - Horizontal bars: category name | bar | percentage
   - Color: Finnish blue fill, frost background
   - Sort by most practiced categories first

3. Category progress breakdown:
   - Expandable sections per category
   - Shows: items learned/total, accuracy %, next review count
   - Color coding: green (>80%), yellow (50-80%), red (<50%)

4. Activity summary:
   - "Last 7 days" activity: sessions completed, words reviewed, accuracy trend
   - Store session history in IndexedDB (date, score, duration, itemCount)

5. HomePage.tsx updates:
   - Quick stats: words learned today, streak (consecutive days with activity)
   - "Continue Learning" → goes to last practiced category or review
   - "Start Review" if items due (with count badge)
   - Categories with lowest accuracy highlighted as "Focus areas"

Log in docs/phases/phase-09.md.
```

---

## PROMPT 10 — Settings & Configuration

```
Build the settings page and configuration system:

1. SettingsPage.tsx (/settings):
   - Accessible via gear icon in Header

2. Settings sections:

   a) Session Settings:
      - Questions per session: slider or stepper (5-30, default 15)
      - Exercise types toggle: checkboxes for each of the 4 types (min 1 must be on)
      - Show hints during exercises: toggle
      - Auto-advance after correct: toggle (with delay slider 1-3s)

   b) Review Settings:
      - Review mode: Vocabulary only / Phrases only / Mixed (radio)
      - New items per session: slider (1-10, default 3)

   c) Data & Progress:
      - "Reset All Progress" button with double confirmation dialog
      - "Reset Category Progress" with category picker
      - Export progress as JSON (download file)
      - Import progress from JSON

   d) About:
      - App version
      - "SuomiSprint — Learn Finnish"
      - Total content: X words, Y phrases across Z categories

3. All settings persisted to IndexedDB via useSettings hook.
4. Settings changes take effect immediately (no save button).
5. Back button returns to previous page.

Log in docs/phases/phase-10.md.
```

---

## PROMPT 11 — PWA Polish & Install Experience

```
Read CLAUDE.md (PWA section).

Polish the PWA for Pixel A9 installation:

1. PWA Manifest (vite-plugin-pwa config):
   - name: "SuomiSprint"
   - short_name: "Suomi"
   - description: "Learn Finnish through English"
   - theme_color: "#003580"
   - background_color: "#131214"
   - display: "standalone"
   - orientation: "portrait"
   - start_url: "/"
   - scope: "/"

2. Generate PWA icons:
   - Create a simple SVG icon: Finnish flag blue background, white "S" letter in Instrument Sans font
   - Generate sizes: 72, 96, 128, 144, 152, 192, 384, 512 (PNG)
   - Also create maskable versions (with padding for Android adaptive icons)
   - Favicon.svg in public/

3. Service Worker config:
   - registerType: 'autoUpdate'
   - Cache: all static assets, all JSON data files, Google Fonts
   - Runtime caching for fonts with CacheFirst strategy
   - Offline fallback page at /offline.html

4. Install prompt:
   - Listen for beforeinstallprompt event
   - Show custom install banner on first visit (dismissible)
   - Store "dismissed" flag in localStorage to not show again
   - Banner design per SKILL-frontend.md

5. Offline indicator:
   - Listen for online/offline events
   - Show subtle top bar when offline: "Offline — All features work"
   - Auto-dismiss when back online

6. Meta tags in index.html:
   - apple-mobile-web-app-capable, apple-mobile-web-app-status-bar-style
   - viewport with viewport-fit=cover for safe areas
   - og:image for sharing

7. Test:
   - `npm run build && npx serve dist` — test in Chrome DevTools mobile emulation
   - Lighthouse PWA audit should score 90+
   - Verify installable on Chrome Android

Log in docs/phases/phase-11.md.
```

---

## PROMPT 12 — Testing, Polish & Deployment

```
Final phase — testing, polish, and deployment preparation.

1. Fix any TypeScript errors: `npx tsc --noEmit`
2. Fix any linting issues

3. Manual testing checklist (verify each):
   - [ ] All 18 vocab categories load and display correctly
   - [ ] All 6 phrase categories load and display correctly
   - [ ] MCQ works in both directions (EN→FI, FI→EN)
   - [ ] Match pairs: matches work, wrong pairs shake, completed pairs disappear
   - [ ] Free translation: fuzzy matching works, special chars bar works
   - [ ] Fill blank: word selection works
   - [ ] Word order: tap to arrange, tap to remove, check works
   - [ ] Progress saves to IndexedDB after exercises
   - [ ] Spaced repetition: items appear for review on schedule
   - [ ] Stats page shows accurate data
   - [ ] Settings persist across page reloads
   - [ ] Reset progress works
   - [ ] PWA installs on Chrome mobile
   - [ ] App works fully offline
   - [ ] Bottom nav highlights correct active tab
   - [ ] All Finnish text uses serif font
   - [ ] Animations work (correct pulse, wrong shake, page transitions)
   - [ ] Touch targets are all ≥ 48px

4. Performance:
   - Bundle size check: `npm run build` — report sizes
   - Lazy loading working for all pages
   - No unnecessary re-renders in exercise components

5. Create README.md:
   - Project description
   - Tech stack
   - How to install and run locally
   - How to deploy to Vercel
   - How to install on Pixel A9

6. Create deployment files:
   - vercel.json with SPA rewrite config
   - .gitignore (node_modules, dist, .env)

7. Final `npm run build` — zero errors, zero warnings.

Log in docs/phases/phase-12.md with full checklist results.
```

---

## PROMPTS BONUS — Maintenance & Contenu

### Ajouter une catégorie de vocabulaire
```
Read CLAUDE.md and skills/SKILL-data.md.

Add a new vocabulary category: "[CATEGORY_NAME]"

1. Create /src/data/vocabulary/[category-id].json with 25-30 items following the exact format
2. Update /src/data/vocabulary/_index.ts to include the new category
3. Verify no duplicate IDs with existing data
4. Run build to check for errors
5. Log in docs/phases/ what was added
```

### Ajouter une catégorie de phrases
```
Read CLAUDE.md and skills/SKILL-data.md.

Add a new phrase category: "[CATEGORY_NAME]"

1. Create /src/data/phrases/[category-id].json with 20-30 phrases
2. Update /src/data/phrases/_index.ts
3. Cross-reference words with existing vocabulary
4. Verify accuracy of all Finnish phrases
5. Run build, log in docs/phases/
```

### Modifier le design
```
Read CLAUDE.md and skills/SKILL-frontend.md.

Update the design: [DESCRIBE CHANGE]

Apply the change consistently across all components.
Update SKILL-frontend.md if the change affects the design system.
Run build, test visually at 393px width.
```
