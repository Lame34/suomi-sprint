# SKILL — Principal (Coding Standards & Architecture)

> Master skill for SuomiSprint. Read this FIRST before any coding task.

## Pre-Flight Checklist

Before writing ANY code:
1. ✅ Read `CLAUDE.md` entirely
2. ✅ Read THIS skill file
3. ✅ Read the task-specific skill file (frontend, data, or exercises)
4. ✅ Check `/docs/phases/` for current phase status
5. ✅ Run `npm run build` to confirm clean state

## Architecture Principles

### Zero-Backend PWA
This app has NO server. Every piece of state lives in the browser:
- **Static data** (vocabulary, phrases): JSON files in `/src/data/`, imported at build time
- **User progress**: IndexedDB via Dexie.js
- **User settings**: IndexedDB via Dexie.js
- **Session state**: React state (useState/useReducer), lost on refresh (intentional)

### Data Flow
```
JSON files (build time) → React components (display)
                        → Exercise generator (creates questions)
                        → User answers → Progress updates → IndexedDB
                        → SM-2 algorithm → Next review schedule → IndexedDB
                        → Stats computation → Stats page
```

### State Management
```
Global (React Context):
├── DatabaseContext     → Dexie instance, shared across app
├── SettingsContext     → User settings from IndexedDB
└── ProgressContext     → Aggregated progress stats

Local (Component state):
├── Exercise sessions   → useReducer in ExerciseShell
├── UI interactions     → useState in individual components
└── Form inputs         → useState or useRef
```

## File Creation Rules

### New Component Checklist
1. Create `.tsx` file in correct directory
2. Define `Props` interface (even if empty — `interface Props {}`)
3. Export as named export AND default export
4. Add JSDoc comment with component purpose
5. Mobile-first responsive design
6. Keyboard accessible (tab, enter, escape)

### Component Template
```tsx
import { useState } from 'react';

/** Brief description of what this component does */
interface Props {
  // All props typed explicitly
}

export function ComponentName({ }: Props) {
  return (
    <div className="...">
      {/* Content */}
    </div>
  );
}

export default ComponentName;
```

### Hook Template
```tsx
import { useState, useEffect, useCallback } from 'react';

/**
 * Brief description of what this hook does
 * @returns Description of return value
 */
export function useHookName() {
  // Implementation
  return { /* named return values */ };
}
```

## TypeScript Rules

- `strict: true` in tsconfig
- NEVER use `any` — use `unknown` with type guards
- Prefer `interface` for object shapes, `type` for unions/intersections
- String unions over enums: `type Difficulty = 1 | 2 | 3;`
- All function params and returns typed
- Utility types: use `Partial<>`, `Pick<>`, `Omit<>` from stdlib

## Tailwind CSS Rules

- Mobile-first: base styles for mobile, `sm:`, `md:` for larger
- Finnish flag palette via CSS custom properties in `index.css`
- Tailwind classes reference custom properties where needed
- Min touch target: `min-h-[48px] min-w-[48px]`
- Consistent spacing: `p-4` for cards, `gap-3` for lists, `space-y-4` for stacks
- Rounded corners: `rounded-xl` for cards, `rounded-lg` for buttons, `rounded-full` for pills

## Error Handling

- Wrap IndexedDB operations in try/catch
- Show user-friendly error messages (not stack traces)
- Error boundary around `<App>` and around exercise components
- Log errors to console in dev mode
- Graceful degradation: if IndexedDB fails, app still works for browsing (not progress tracking)

## Documentation Rules

### Phase Journal (`/docs/phases/phase-XX.md`)
```markdown
# Phase XX — [Title]

## Started: YYYY-MM-DD

### Actions
- [timestamp] Action description → Result
- [timestamp] Decision made: [what] because [why]

### Decisions
- **[Topic]**: Chose [X] over [Y] because [reason]

### Issues
- [Issue description] → [Resolution]

### Completed: YYYY-MM-DD
```

### ADR (`/docs/ADR/ADR-XXX-title.md`)
```markdown
# ADR-XXX: [Title]

## Status: Accepted | Superseded | Deprecated
## Date: YYYY-MM-DD

## Context
[Why this decision was needed]

## Decision
[What was decided]

## Consequences
[What changes as a result]
```

## Git Conventions

- Conventional commits: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`
- One logical change per commit
- Branch naming: `phase/XX-description` or `fix/description`
- Always build before committing: `npm run build`
