# CLAUDE.md — SuomiSprint 🇫🇮

> Finnish language learning PWA — Vocabulary & Phrases — English → Finnish

## 🎯 Project Identity

**Name**: SuomiSprint
**Purpose**: Personal PWA to learn Finnish through English, inspired by Duolingo's UX but stripped of gamification bloat.
**User**: Single user (Lilian), installed on Pixel A9.
**Philosophy**: Learn by doing — spaced repetition + free practice, no distractions.

---

## 🏗️ Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React 18 + TypeScript | Modern, typed, PWA-ready |
| Build | Vite 5 | Fast dev, PWA plugin available |
| PWA | vite-plugin-pwa (Workbox) | Offline-first, installable on Pixel A9 |
| Styling | Tailwind CSS 3 | Utility-first, fast iteration |
| Storage | IndexedDB (via Dexie.js) | Local persistence, no backend needed |
| State | React Context + useReducer | Simple, no external state lib |
| Hosting | Vercel OR Cloudflare Pages | 100% free tier |
| Testing | Vitest + React Testing Library | Fast, Vite-native |

### Zero Backend Architecture
- **NO server, NO database, NO API, NO authentication**
- ALL data stored locally in IndexedDB via Dexie.js
- Vocabulary/phrases data bundled as static JSON in `/src/data/`
- Progress, scores, spaced repetition state → IndexedDB
- App works 100% offline after first load

### PWA Requirements
- Service Worker via vite-plugin-pwa with `registerType: 'autoUpdate'`
- Manifest with `display: 'standalone'`, `theme_color: '#003580'`
- Icons: 192x192 and 512x512 PNG
- Offline fallback page
- Install prompt handling for Chrome/Android

---

## 🎨 Design System — "Nordic Blue"

### Colors (Finnish Flag)
```
--color-primary:        #003580    /* Finnish blue — main actions, headers */
--color-primary-light:  #1a5fb4    /* Hover states, secondary elements */
--color-primary-dark:   #002455    /* Active states, deep accents */
--color-white:          #FFFFFF    /* Background, cards */
--color-ice:            #F0F4F8    /* Light background, subtle sections */
--color-frost:          #D6E4F0    /* Borders, dividers, inactive */
--color-text-primary:   #1A1A2E    /* Main text — near-black with blue undertone */
--color-text-secondary: #5A6678    /* Secondary text, hints */
--color-success:        #2E7D32    /* Correct answer */
--color-success-light:  #E8F5E9    /* Correct answer background */
--color-error:          #C62828    /* Wrong answer */
--color-error-light:    #FFEBEE    /* Wrong answer background */
--color-warning:        #F57F17    /* Review needed, attention */
```

### Typography
- **Display / Headers**: `"Instrument Sans"` (Google Fonts) — geometric, Nordic feel
- **Body / UI**: `"Source Sans 3"` (Google Fonts) — clean readability
- **Finnish words**: `"Source Serif 4"` (Google Fonts) — serif distinction for target language
- Font sizes: Use Tailwind scale (`text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, `text-3xl`)

### Spacing & Layout
- Mobile-first, max-width 480px centered
- Bottom navigation bar (4 tabs)
- Card-based content areas with rounded-xl corners
- Generous padding (p-4 minimum on cards)
- Touch targets minimum 48x48px

### Feedback & Micro-interactions
- ✅ Correct: green flash + subtle scale pulse + slide to next
- ❌ Wrong: red shake + show correct answer for 2s
- Transitions: 200ms ease-out on all interactive elements
- Progress bar animation during sessions
- No sounds, no haptics

### Icons
- Lucide React icons only (already available)
- No emoji in UI (clean professional feel)

---

## 📁 Project Structure

```
suomi-sprint/
├── public/
│   ├── icons/                    # PWA icons (192, 512)
│   ├── favicon.svg               # Finnish flag inspired
│   └── offline.html              # Offline fallback
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── BottomNav.tsx     # Main navigation
│   │   │   ├── Header.tsx        # Top bar with title
│   │   │   └── AppShell.tsx      # Layout wrapper
│   │   ├── exercises/
│   │   │   ├── MCQ.tsx           # Multiple choice (4 options)
│   │   │   ├── MatchPairs.tsx    # Drag/tap to match pairs
│   │   │   ├── FreeTranslation.tsx # Type the translation
│   │   │   ├── FillBlank.tsx     # Fill in the blank / word order
│   │   │   ├── ExerciseShell.tsx # Shared wrapper (progress bar, feedback)
│   │   │   └── SessionComplete.tsx # End-of-session summary
│   │   ├── vocabulary/
│   │   │   ├── CategoryList.tsx  # Browse categories
│   │   │   ├── WordCard.tsx      # Individual word display
│   │   │   └── WordList.tsx      # Words in a category
│   │   ├── review/
│   │   │   ├── ReviewDashboard.tsx # Spaced repetition overview
│   │   │   └── ReviewSession.tsx   # Auto-generated review
│   │   ├── stats/
│   │   │   ├── StatsOverview.tsx # Main stats page
│   │   │   └── ProgressChart.tsx # Visual progress
│   │   └── settings/
│   │       └── SettingsPage.tsx  # Session length, reset, etc.
│   ├── data/
│   │   ├── vocabulary/           # JSON files per category
│   │   │   ├── _index.ts         # Category registry
│   │   │   ├── greetings.json
│   │   │   ├── numbers.json
│   │   │   ├── pronouns.json
│   │   │   ├── food-drink.json
│   │   │   ├── family.json
│   │   │   ├── colors.json
│   │   │   ├── animals.json
│   │   │   ├── body.json
│   │   │   ├── home.json
│   │   │   ├── transport.json
│   │   │   ├── time-calendar.json
│   │   │   ├── weather-nature.json
│   │   │   ├── shopping.json
│   │   │   ├── work-study.json
│   │   │   ├── travel.json
│   │   │   ├── emotions.json
│   │   │   ├── verbs-common.json
│   │   │   ├── adjectives.json
│   │   │   └── phrases-essential.json
│   │   └── phrases/              # Phrase collections
│   │       ├── _index.ts
│   │       ├── survival.json     # Most essential phrases
│   │       ├── conversation.json # Small talk
│   │       ├── restaurant.json
│   │       ├── directions.json
│   │       ├── emergency.json
│   │       └── daily-life.json
│   ├── hooks/
│   │   ├── useExercise.ts        # Exercise session logic
│   │   ├── useSpacedRepetition.ts # SM-2 algorithm
│   │   ├── useProgress.ts        # Stats & progress tracking
│   │   └── useSettings.ts       # User settings
│   ├── lib/
│   │   ├── db.ts                 # Dexie.js database schema
│   │   ├── sm2.ts                # SM-2 spaced repetition algorithm
│   │   ├── exercise-generator.ts # Generate exercises from data
│   │   └── utils.ts              # Shared utilities
│   ├── pages/
│   │   ├── HomePage.tsx          # Dashboard / welcome
│   │   ├── VocabularyPage.tsx    # Browse & learn vocabulary
│   │   ├── PhrasesPage.tsx       # Browse & learn phrases
│   │   ├── PracticePage.tsx      # Free practice sessions
│   │   ├── ReviewPage.tsx        # Spaced repetition sessions
│   │   ├── StatsPage.tsx         # Progress & statistics
│   │   └── SettingsPage.tsx      # App settings
│   ├── types/
│   │   └── index.ts              # All TypeScript interfaces
│   ├── App.tsx                   # Router + providers
│   ├── main.tsx                  # Entry point
│   └── index.css                 # Tailwind + custom properties
├── docs/                         # Project documentation
│   ├── ADR/                      # Architecture Decision Records
│   └── phases/                   # Phase journals
├── CLAUDE.md                     # THIS FILE
├── index.html
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
└── package.json
```

---

## 📊 Data Schema

### Vocabulary Entry (JSON)
```typescript
interface VocabEntry {
  id: string;                    // e.g., "greetings-001"
  finnish: string;               // "Hei"
  english: string;               // "Hello"
  category: string;              // "greetings"
  partOfSpeech: "noun" | "verb" | "adjective" | "adverb" | "pronoun" | "phrase" | "number" | "other";
  difficulty: 1 | 2 | 3;        // 1=beginner, 2=intermediate, 3=advanced
  notes?: string;                // Grammar hints, usage notes
  examples?: string[];           // Example sentences
}
```

### Phrase Entry (JSON)
```typescript
interface PhraseEntry {
  id: string;                    // e.g., "survival-001"
  finnish: string;               // "Missä on vessa?"
  english: string;               // "Where is the toilet?"
  category: string;              // "survival"
  difficulty: 1 | 2 | 3;
  literalTranslation?: string;   // "Where is toilet?"
  notes?: string;                // Context, formality level
  words: string[];               // Word IDs used in this phrase
}
```

### Progress Record (IndexedDB via Dexie)
```typescript
interface ProgressRecord {
  itemId: string;                // vocab or phrase ID
  itemType: "vocab" | "phrase";
  // SM-2 fields
  easeFactor: number;            // Starting at 2.5
  interval: number;              // Days until next review
  repetitions: number;           // Consecutive correct answers
  nextReview: Date;              // When to review next
  // Stats
  totalAttempts: number;
  correctAttempts: number;
  lastAttempted: Date;
  lastCorrect: boolean;
}
```

### Settings (IndexedDB)
```typescript
interface UserSettings {
  questionsPerSession: number;   // Default: 15, range: 5-30
  exerciseTypes: ExerciseType[]; // Which types are enabled
  showHints: boolean;            // Show grammar notes during exercises
  autoAdvance: boolean;          // Auto-advance after correct answer
  reviewMode: "mixed" | "vocabOnly" | "phrasesOnly";
}
```

---

## 🧠 Spaced Repetition — SM-2 Algorithm

Implement the **SM-2 algorithm** (SuperMemo 2) for review scheduling:

1. **New items** start with: `easeFactor=2.5`, `interval=0`, `repetitions=0`
2. After each review, user rates quality 0-5 (mapped from exercise results):
   - Correct on first try → quality 5
   - Correct after hesitation → quality 4
   - Correct after hint → quality 3
   - Wrong but close → quality 1
   - Wrong → quality 0
3. If quality >= 3 (correct):
   - `repetitions += 1`
   - If rep 1: `interval = 1`
   - If rep 2: `interval = 6`
   - If rep 3+: `interval = interval * easeFactor`
   - `easeFactor = max(1.3, easeFactor + (0.1 - (5-quality) * (0.08 + (5-quality) * 0.02)))`
4. If quality < 3 (wrong):
   - `repetitions = 0`, `interval = 1`
   - `easeFactor` unchanged
5. `nextReview = now + interval days`

### Review Session Logic
- Fetch all items where `nextReview <= now`
- Sort by: overdue items first, then by lowest easeFactor (hardest items)
- Mix vocabulary and phrases
- Limit to `questionsPerSession` setting

---

## 🏋️ Exercise Types

### 1. MCQ (Multiple Choice — 4 options)
- Show English word/phrase → pick correct Finnish from 4 options
- OR show Finnish → pick correct English
- Distractors: same category, similar difficulty, never repeated in session
- Direction randomized per question

### 2. Match Pairs
- Show 5 pairs (English ↔ Finnish) simultaneously
- Tap one side, then tap matching other side
- Matched pairs disappear with animation
- Timer optional (not for v1)

### 3. Free Translation
- Show English → type Finnish translation
- Fuzzy matching: ignore accents on first pass, accept common typos (Levenshtein distance ≤ 1)
- Show "Almost correct!" for near-misses with the right answer highlighted
- Virtual keyboard hint for ä, ö, å (Finnish special characters)

### 4. Fill in the Blank / Word Order
- **Fill blank**: Finnish sentence with one word missing → type or pick the word
- **Word order**: English shown, Finnish words scrambled → arrange in correct order
- Alternate between both sub-types randomly

### Exercise Session Flow
1. Select mode: Practice (free) or Review (spaced repetition)
2. For Practice: pick category or "All"
3. Session generates N questions (from settings), mixing exercise types
4. Each question: show → answer → feedback (green/red) → next
5. Progress bar at top shows completion
6. End: summary screen (correct/total, new words learned, words to review)

---

## 📱 Navigation Structure

Bottom navigation (4 tabs):
1. **Home** (🏠 House icon) — Dashboard with quick stats, "Start Review" CTA, recent activity
2. **Learn** (📖 BookOpen icon) — Browse vocabulary categories + phrase categories, tap to explore/learn
3. **Practice** (🎯 Target icon) — Start a free practice session, pick category/type
4. **Stats** (📊 BarChart icon) — Progress overview, words mastered, accuracy, category breakdown

Settings accessible via gear icon in header (not a tab).

---

## 🔧 Coding Standards

### Naming
- **Files**: PascalCase for components (`MCQ.tsx`), camelCase for utilities (`exercise-generator.ts`)
- **Components**: PascalCase (`ExerciseShell`)
- **Hooks**: camelCase with `use` prefix (`useSpacedRepetition`)
- **Variables/functions**: camelCase English
- **Business terms**: English throughout (this is not a French-domain app)
- **CSS classes**: Tailwind utilities, custom classes in kebab-case

### TypeScript
- Strict mode enabled
- No `any` — use `unknown` + type guards
- All props interfaces explicitly defined
- Prefer `interface` over `type` for object shapes
- Enums → string union types

### React Patterns
- Functional components only
- Custom hooks for all business logic
- Context for global state (settings, db instance)
- Lazy loading for page components
- Error boundaries around exercise components
- Keys on all list renders

### Performance
- Static JSON data imported at build time (tree-shaken per category)
- Dexie.js for IndexedDB (lightweight, typed)
- Memoize expensive computations (exercise generation)
- Virtual scrolling for word lists > 100 items (if needed)

### Documentation
- **Every action → log in `/docs/phases/`** with date, decision, rationale
- **Architecture decisions → ADR** in `/docs/ADR/`
- JSDoc on all public functions
- README.md with install/deploy instructions

---

## 🚀 Deployment — Vercel (Free)

1. Push to GitHub repository
2. Connect to Vercel (free tier)
3. Build command: `npm run build`
4. Output directory: `dist`
5. PWA service worker auto-registered
6. Custom domain optional (Vercel provides `.vercel.app` subdomain)
7. HTTPS included (required for PWA)

### Install on Pixel A9
1. Open the Vercel URL in Chrome on Pixel A9
2. Chrome shows "Add to Home Screen" banner (or use menu → "Install app")
3. App installs as standalone PWA
4. Works offline after first load

---

## 📜 Phase Plan

| Phase | Description | Key Deliverables |
|-------|------------|------------------|
| 1 | Project init + tooling | Vite + React + TS + Tailwind + PWA config |
| 2 | Design system | Colors, fonts, components, layout shell |
| 3 | Data layer | Dexie.js schema, JSON data files (all categories) |
| 4 | Vocabulary browsing | Category list, word list, word cards |
| 5 | Phrase browsing | Phrase categories, phrase display |
| 6 | Exercise engine | Core exercise logic, MCQ component |
| 7 | All exercise types | Pairs, free translation, fill-blank |
| 8 | Spaced repetition | SM-2 implementation, review sessions |
| 9 | Stats & progress | Dashboard, charts, progress tracking |
| 10 | Settings | Configurable session length, exercise types |
| 11 | PWA polish | Offline, install prompt, icons, manifest |
| 12 | Testing & deploy | Tests, Vercel deployment, Pixel A9 install |

---

## ⚠️ Rules for Claude Code

1. **READ this CLAUDE.md entirely before every task**
2. **READ the relevant SKILL file** before coding any feature
3. **Log every action** in `/docs/phases/phase-XX.md` with timestamp
4. **No shortcuts** — implement features fully, not as stubs
5. **Mobile-first always** — every component must look right at 360px width
6. **Test on each phase** — `npm run build` must succeed, no TypeScript errors
7. **Finnish accuracy matters** — double-check all Finnish translations and grammar
8. **No external APIs** — everything is local/static
9. **No emoji in UI** — Lucide icons only
10. **Commit messages** in English, conventional format: `feat:`, `fix:`, `docs:`, `style:`
