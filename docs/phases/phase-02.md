# Phase 02 — Design System & App Layout

## Started: 2026-03-11

### Actions
- [15:00] Read CLAUDE.md and skills/SKILL-frontend.md for design system specs
- [15:01] Read all existing Phase 1 files to understand current state
- [15:05] Rewrote src/index.css with complete design system:
  - `:root` CSS custom properties for all 15 color tokens
  - `@theme` block for Tailwind v4: colors, font families (display/body/serif), custom animations (animate-correct, animate-shake, animate-fade-in, animate-spin-slow)
  - Keyframes: correct-pulse (scale 1.02), shake (translateX ±6px), fade-slide-in (opacity + translateY 8px)
  - `@layer base`: safe area insets on html, body font/color/overscroll, #root flex layout, focus-visible ring on all elements
  - `@layer components`: .card, .btn-primary, .btn-secondary, .finnish-word, .finnish-word-lg, .progress-bar/.progress-bar-fill, .answer-correct, .answer-wrong, .page-enter, .stagger-enter
  - `@media (prefers-reduced-motion: reduce)`: disables all animations
- [15:06] Updated index.html: added `viewport-fit=cover` to viewport meta for safe area inset support
- [15:07] Rewrote BottomNav.tsx:
  - Added `relative` to NavLink for correct active dot positioning
  - Moved `pb-[env(safe-area-inset-bottom)]` inside the inner flex container
  - Active state: Finnish blue icon (strokeWidth 2.5) + label + dot indicator (absolute bottom-2)
  - Inactive state: grey icon (strokeWidth 2) + label
  - 4 tabs: Home, Learn, Practice, Stats (lucide-react icons)
- [15:08] Rewrote Header.tsx:
  - Back button hidden on home page (ChevronLeft icon, w-6 h-6)
  - Settings gear hidden on settings page to avoid redundancy
  - All touch targets min-h-[48px] min-w-[48px]
  - Hover states with bg-ice, focus-visible ring
- [15:09] Updated AppShell.tsx:
  - Background changed from bg-white to bg-ice for subtle section distinction
  - Content area: pt-14 (56px header clearance) pb-20 (80px nav clearance)
  - max-w-[480px] mx-auto px-4 py-4 centered content
- [15:10] Built HomePage.tsx with full design system showcase:
  - "Tervetuloa!" welcome heading
  - 2x2 stats grid (words learned, accuracy, due for review, sessions done) using .card component
  - "Start Review" CTA using .btn-primary
  - Quick actions card with Browse Vocabulary and Free Practice buttons
  - "Word of the day" card using .finnish-word-lg for Finnish text (Source Serif 4)
- [15:11] Built VocabularyPage.tsx (/learn):
  - 6 placeholder categories with stagger-enter animation (50ms delay per card)
  - Each card: icon + label + word count + difficulty badge
  - Hover state: border-primary-light transition
- [15:12] Built PhrasesPage.tsx (/phrases):
  - 6 phrase categories with stagger-enter animation
  - Same card pattern as vocabulary for consistency
- [15:13] Built PracticePage.tsx (/practice):
  - Category picker (btn-secondary placeholder)
  - 2x2 exercise type grid: MCQ, Match Pairs, Free Translation, Fill in the Blank
  - Disabled Start Practice button with explanatory text
- [15:14] Built ReviewPage.tsx (/review):
  - "All caught up!" status with CheckCircle icon
  - Upcoming reviews section
  - Mastery progress bar using .progress-bar component
- [15:15] Built StatsPage.tsx (/stats):
  - 2x2 summary grid: sessions, accuracy, words reviewed, words mastered
  - Category breakdown card
  - Accuracy over time chart placeholder
- [15:16] Built SettingsPage.tsx (/settings):
  - Questions per session control (stepper: 5-30 range, step 5)
  - Exercise type checkboxes (4 types)
  - Options: show hints, auto-advance toggles
  - Reset All Progress button (btn-secondary with error text color)
- [15:17] Ran `npm run build` — zero TypeScript errors, zero warnings, successful build
- [15:18] Ran dev server smoke test — HTTP 200 confirmed

### Decisions
- **No tailwind.config.ts**: Tailwind v4 uses CSS-first configuration via `@theme` in index.css instead of a JS/TS config file. All colors, fonts, and animations are defined in `@theme` block and available as Tailwind classes (e.g., `bg-primary`, `font-display`, `animate-correct`).
- **bg-ice for AppShell**: Changed app background from white to ice (#F0F4F8) so white cards have visual distinction against the background, per SKILL-frontend color application rules.
- **Stagger animation for category lists**: Used `.stagger-enter` with increasing `animationDelay` per SKILL-frontend card stagger pattern.
- **Settings gear hidden on settings page**: Avoids confusing circular navigation.
- **viewport-fit=cover**: Required for `env(safe-area-inset-*)` to work on iOS (notch, home indicator).

### Mobile Viewport Verification (393px / Pixel A9)
- Header: fixed top, 56px, does not overlap content (content has pt-14 = 56px top padding)
- Bottom nav: fixed bottom, 64px + safe-area-inset, content has pb-20 = 80px clearance
- Content area: max-w-480px centered, px-4 padding, scrolls independently
- All touch targets: minimum 48x48px on buttons, 44px on checkbox labels
- Category cards: full width, text truncation on narrow screens
- Stats grid: 2-column responsive, gap-3

### Completed: 2026-03-11
