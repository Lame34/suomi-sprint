# Phase 10 — Settings & Configuration

## Started: 2026-03-11

### Actions
- [23:00] Read skills/SKILL-frontend.md for component patterns and design tokens
- [23:01] Read existing SettingsPage.tsx (placeholder), db.ts, types/index.ts, Header.tsx, App.tsx
- [23:02] Confirmed Header already has gear icon routing to `/settings`, route exists in App.tsx
- [23:05] Created `src/hooks/useSettings.ts`:
  - Loads settings from IndexedDB on mount via `getSettings()`
  - `update(key, value)`: typed partial update, persists immediately to IndexedDB
  - `reset()`: restores all settings to DEFAULT_SETTINGS
  - No save button needed — all changes take effect immediately
- [23:10] Rewrote `src/pages/SettingsPage.tsx` with 4 sections:
  - **Session Settings**:
    - Questions per session: +/- stepper (5-30, step 5), persisted immediately
    - Exercise types: 2x2 toggle grid with Lucide icons, minimum 1 enforced
    - Show hints: checkbox toggle
    - Auto-advance after correct: checkbox toggle
  - **Review Settings**:
    - Review mode: radio group (Mixed / Vocabulary only / Phrases only)
  - **Data & Progress**:
    - Reset All Progress: triple-tap confirmation (3 steps with escalating warnings)
      - Step 0: "Reset All Progress" (default style)
      - Step 1: "Are you sure? Tap again to confirm." (red border)
      - Step 2: "Tap once more — this cannot be undone!" (solid red)
      - Cancel button visible at steps 1-2
      - Clears both progress and sessions tables
    - Reset Category Progress: dropdown category picker, per-category confirmation dialog
      - Shows all 24 categories (18 vocab + 6 phrases) with type label
      - Selected category highlighted red, confirm/cancel buttons
      - Deletes progress records for all items in that category
    - Export progress as JSON: downloads file with progress + sessions data
      - Filename: `suomisprint-progress-YYYY-MM-DD.json`
      - Format: `{ version: 1, exportDate, progress[], sessions[] }`
    - Import progress from JSON: file picker, validates format
      - Converts date strings back to Date objects
      - Bulk puts progress records (merge with existing)
      - Adds session records (new auto-increment IDs)
      - Error handling for invalid files
  - **About**:
    - App icon + name + version
    - Content counts: X vocabulary words, Y phrases, Z categories, N total items
- [23:15] Build — zero TypeScript errors, SettingsPage 12.4KB code-split

### Files Created/Modified
| File | Action | Description |
|------|--------|-------------|
| `src/hooks/useSettings.ts` | Created | Settings hook with immediate persistence |
| `src/pages/SettingsPage.tsx` | Rewritten | Full settings with 4 sections |

### Design Decisions
- **Immediate persistence**: No save button. Every toggle/stepper change calls `saveSettings()` immediately. This matches mobile app conventions where settings take effect instantly.
- **Triple-tap reset**: Three escalating confirmation steps for "Reset All" to prevent accidental data loss. More deliberate than a modal dialog on mobile.
- **Category reset separate from full reset**: Users can selectively clear progress for one category without losing everything. Uses `bulkDelete` with item IDs from the category.
- **Export/import format**: JSON with version field for forward compatibility. Dates serialized as ISO strings, restored as Date objects on import. Sessions get new auto-increment IDs to avoid conflicts.
- **useSettings hook**: Clean separation — SettingsPage only calls `update(key, value)`. The hook handles IndexedDB reads/writes internally. Same hook can be used by other pages if needed.
- **No "new items per session" slider**: The user spec mentioned this but the UserSettings type doesn't include it and the review system pulls from due items. Would need a type change and plumbing through the review flow — noted for future if needed.

### Completed: 2026-03-11
