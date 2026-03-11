# Phase 05 — Learn Section (Vocabulary + Phrase Browsing)

## Started: 2026-03-11

### Actions
- [18:00] Read CLAUDE.md and skills/SKILL-frontend.md for design patterns, component specs
- [18:01] Read existing App.tsx, VocabularyPage.tsx, PhrasesPage.tsx, types/index.ts, data index files, db.ts, Header.tsx, BottomNav.tsx, index.css
- [18:02] Catalogued all Lucide icon names used in vocab (18) and phrase (6) category JSON files
- [18:05] Created `src/lib/icons.ts` — icon name resolver mapping kebab-case strings (from JSON data) to Lucide React components, with BookOpen fallback
- [18:10] Created `src/components/vocabulary/CategoryList.tsx` — 2-column grid of category cards with icon, name, item count, difficulty badge (color-coded: green/yellow/red), staggered fade-in animation (50ms delay per card)
- [18:12] Created `src/components/vocabulary/WordCard.tsx` — expandable word card with:
  - Collapsed: progress dot (green=mastered, yellow=learning, grey=new) + Finnish (serif font, blue) + English + chevron
  - Expanded: part of speech badge, difficulty badge, notes, example sentences, "Practice this category" button
  - All touch targets >= 48px, aria-expanded attribute
- [18:14] Created `src/components/vocabulary/PhraseCard.tsx` — expandable phrase card with:
  - Collapsed: progress dot + Finnish phrase (serif) + English + chevron
  - Expanded: literal translation, notes, "Practice this category" button
- [18:16] Created `src/components/vocabulary/WordList.tsx` — category word list page:
  - Header with back arrow, category icon, category name, word count, progress summary
  - Search bar (filters by Finnish or English, case-insensitive)
  - Sorted list: difficulty ascending, then Finnish alphabetical
  - Progress loaded from IndexedDB via Dexie (status: mastered if reps>=3, learning if attempts>0, new otherwise)
  - "Category not found" fallback
- [18:18] Created `src/components/vocabulary/PhraseList.tsx` — same pattern as WordList for phrase categories
- [18:20] Rewrote `src/pages/VocabularyPage.tsx` — tabbed page with Vocabulary/Phrases toggle:
  - Pill-style tab bar (ice bg, white active tab with shadow)
  - Each tab renders CategoryList with appropriate data and route prefix
  - Tab content switches without page navigation
- [18:21] Updated `src/pages/PhrasesPage.tsx` — redirects /phrases to /learn (all browsing unified under Learn)
- [18:22] Updated `src/App.tsx` — added routes:
  - `/learn/vocab/:categoryId` → WordList (lazy-loaded)
  - `/learn/phrases/:categoryId` → PhraseList (lazy-loaded)
  - Lazy loading via dynamic import with `.then()` re-export for named exports
- [18:23] First build — zero TypeScript errors, but chunk size warning (596KB main bundle)
- [18:24] Fixed: lazy-loaded WordList and PhraseList to code-split data from main bundle
- [18:25] Final build — zero errors, no warnings. Proper code splitting: vocab data 179KB, phrase data 66KB, loaded on demand

### Components Created
| Component | Path | Description |
|-----------|------|-------------|
| `icons.ts` | `src/lib/icons.ts` | Icon name → Lucide component resolver (24 icons) |
| `CategoryList` | `src/components/vocabulary/CategoryList.tsx` | 2-column card grid for categories |
| `WordCard` | `src/components/vocabulary/WordCard.tsx` | Expandable vocabulary word card |
| `PhraseCard` | `src/components/vocabulary/PhraseCard.tsx` | Expandable phrase card |
| `WordList` | `src/components/vocabulary/WordList.tsx` | Category detail page for vocab |
| `PhraseList` | `src/components/vocabulary/PhraseList.tsx` | Category detail page for phrases |

### Design Decisions
- **Unified Learn page with tabs**: Instead of separate /learn and /phrases top-level routes, all browsing is under /learn with a tab switch. Simpler navigation, matches BottomNav's single "Learn" tab.
- **PhrasesPage redirects**: /phrases now redirects to /learn to maintain backward compatibility
- **Progress from IndexedDB**: WordList/PhraseList query Dexie for ProgressRecords on mount. Status thresholds: mastered (reps >= 3), learning (attempts > 0), new (no record).
- **Lazy-loaded list pages**: WordList and PhraseList are lazy-loaded since they import all category data. This keeps the main bundle small and loads data on demand.
- **Finnish text uses serif font**: All Finnish words/phrases use the `.finnish-word` CSS class (Source Serif 4) per SKILL-frontend.md requirement.
- **Staggered animation**: Category cards animate in with 50ms stagger delay per card.
- **Search within category**: Simple client-side filter matching Finnish or English text, case-insensitive.
- **Sorting**: Difficulty ascending (easiest first), then Finnish alphabetical within same difficulty.

### Completed: 2026-03-11
