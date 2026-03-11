# Phase 01 — Project Init + Tooling

## Started: 2026-03-11

### Actions
- [14:18] Read CLAUDE.md and all SKILL files (principal, frontend, data, exercises)
- [14:20] Scaffolded Vite + React 19 + TypeScript project via `npm create vite@latest`
- [14:21] Installed runtime dependencies: react-router-dom, dexie, lucide-react
- [14:21] Installed dev dependencies: tailwindcss, @tailwindcss/vite (v4), vite-plugin-pwa
- [14:22] Configured Tailwind v4 via @tailwindcss/vite plugin (CSS-first config, no tailwind.config.ts)
- [14:22] Set up CSS custom properties in src/index.css with full Finnish flag color palette
- [14:22] Added @theme block for Tailwind v4 with custom colors (primary, ice, frost, success, error, warning) and font families (display, body, serif)
- [14:23] Configured vite-plugin-pwa in vite.config.ts with manifest (name: SuomiSprint, theme_color: #003580, display: standalone)
- [14:23] Updated index.html with Google Fonts (Instrument Sans, Source Sans 3, Source Serif 4), meta tags, and PWA links
- [14:24] Created full directory structure per CLAUDE.md spec (components/layout, exercises, vocabulary, review, stats, settings; data/vocabulary, phrases; hooks; lib; pages; types; docs/ADR, phases; public/icons)
- [14:25] Created src/types/index.ts with all TypeScript interfaces: VocabEntry, PhraseEntry, DataItem, CategoryMeta, ProgressRecord, ExerciseType, ExerciseResult, Exercise, UserSettings, SessionSummary
- [14:25] Created src/lib/db.ts with Dexie.js database (tables: progress, settings; default settings: questionsPerSession=15, all exercise types enabled)
- [14:26] Created src/lib/sm2.ts with full SM-2 spaced repetition algorithm
- [14:26] Created src/lib/exercise-generator.ts with Fisher-Yates shuffle and exercise generation
- [14:26] Created src/lib/utils.ts with Levenshtein distance, checkTranslation (exact/almost/wrong), formatRelativeDate
- [14:27] Created data registry files: src/data/vocabulary/_index.ts, src/data/phrases/_index.ts
- [14:28] Created all 7 page components (lazy-loaded): HomePage, VocabularyPage, PhrasesPage, PracticePage, ReviewPage, StatsPage, SettingsPage
- [14:29] Created layout components: Header.tsx (fixed top, back button, settings icon), BottomNav.tsx (4-tab nav: Home, Learn, Practice, Stats), AppShell.tsx (layout wrapper with Outlet)
- [14:30] Created App.tsx with React Router (BrowserRouter, lazy-loaded routes, Suspense with loading spinner)
- [14:30] Created PWA assets: favicon.svg, offline.html, placeholder icon SVGs (192x192, 512x512)
- [14:31] Ran `npm run build` — zero TypeScript errors, successful Vite build, PWA service worker generated (19 precache entries, 253.52 KiB)

### Decisions
- **Tailwind v4 over v3**: Installed version is 4.2.1, uses CSS-first configuration with @theme directive instead of tailwind.config.ts. Simpler setup, no PostCSS config needed.
- **SVG icons for now**: Created SVG placeholder icons instead of PNG. Real PNG icons will be generated in Phase 11 (PWA polish).
- **React 19**: Vite scaffolded with React 19.2.0 (latest). All hooks and patterns are compatible.
- **react-router-dom v7**: Installed latest version. Uses same Routes/Route API.

### Issues
- Vite create command fails in non-empty directory — resolved by scaffolding to temp directory and copying files.

### Completed: 2026-03-11
