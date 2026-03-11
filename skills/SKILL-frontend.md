# SKILL — Frontend (UI/UX & Component Patterns)

> Read this skill before creating ANY visual component or page.

## Design Identity: "Nordic Ice"

The app looks like it was made by a Finnish design studio. Clean, confident, blue.

### Color Application Rules
| Element | Color | Token |
|---------|-------|-------|
| Background (app) | `#FFFFFF` white | `--color-white` |
| Background (sections) | `#F0F4F8` ice | `--color-ice` |
| Primary buttons & CTAs | `#003580` Finnish blue | `--color-primary` |
| Button hover | `#1a5fb4` lighter blue | `--color-primary-light` |
| Button active/pressed | `#002455` deep blue | `--color-primary-dark` |
| Card borders | `#D6E4F0` frost | `--color-frost` |
| Primary text | `#1A1A2E` near-black | `--color-text-primary` |
| Secondary text | `#5A6678` grey | `--color-text-secondary` |
| Correct answer | `#2E7D32` on `#E8F5E9` | `--color-success` / `--color-success-light` |
| Wrong answer | `#C62828` on `#FFEBEE` | `--color-error` / `--color-error-light` |
| Needs review badge | `#F57F17` | `--color-warning` |

### Font Loading
```html
<link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Source+Sans+3:wght@300;400;500;600&family=Source+Serif+4:wght@400;500;600&display=swap" rel="stylesheet">
```

### Font Application
```css
/* Headers, nav labels, buttons */
font-family: 'Instrument Sans', sans-serif;

/* Body text, descriptions, UI labels */
font-family: 'Source Sans 3', sans-serif;

/* Finnish words and phrases (the target language) */
font-family: 'Source Serif 4', serif;
```

**Critical rule**: Finnish text (the words being learned) ALWAYS uses `Source Serif 4` to visually distinguish it from English. This helps the brain associate the serif font with "this is Finnish."

## Layout Architecture

### AppShell
```
┌─────────────────────────────┐
│  Header (56px)              │
│  [Back?]  Title  [Settings] │
├─────────────────────────────┤
│                             │
│  Content Area               │
│  (scrollable, flex-1)       │
│  max-w-[480px] mx-auto      │
│  px-4 py-4                  │
│                             │
│                             │
├─────────────────────────────┤
│  Bottom Nav (64px)          │
│  Home | Learn | Practice | Stats │
└─────────────────────────────┘
```

- Header: fixed top, white bg, subtle bottom border (`border-b border-frost`)
- Content: `overflow-y-auto`, padding bottom for nav clearance (`pb-20`)
- Bottom Nav: fixed bottom, white bg, top border, `safe-area-inset-bottom` padding

### Bottom Navigation Pattern
```tsx
// Active tab: Finnish blue icon + label, blue dot indicator
// Inactive tab: grey icon + label
// Touch target: full tab width, 64px height minimum
// Labels: 10px Instrument Sans, uppercase tracking
```

## Component Patterns

### Cards
```tsx
<div className="bg-white rounded-xl border border-frost p-4 shadow-sm">
  {/* Card content */}
</div>
```

### Primary Button
```tsx
<button className="w-full bg-primary text-white font-semibold rounded-lg 
  min-h-[48px] px-6 py-3 transition-all duration-200
  hover:bg-primary-light active:bg-primary-dark active:scale-[0.98]
  disabled:opacity-50 disabled:cursor-not-allowed">
  Button Text
</button>
```

### Secondary Button
```tsx
<button className="w-full bg-ice text-primary font-semibold rounded-lg 
  min-h-[48px] px-6 py-3 border border-frost transition-all duration-200
  hover:bg-frost active:scale-[0.98]">
  Button Text
</button>
```

### MCQ Option Button
```tsx
// Default state
<button className="w-full text-left p-4 rounded-xl border-2 border-frost 
  bg-white transition-all duration-200 hover:border-primary-light">

// Selected (awaiting confirmation)
<button className="... border-primary bg-blue-50">

// Correct
<button className="... border-success bg-success-light">

// Wrong
<button className="... border-error bg-error-light animate-shake">
```

### Finnish Word Display
```tsx
// Large display (learning/card view)
<span className="font-serif text-2xl text-primary font-medium">
  {finnishWord}
</span>

// Inline (in a sentence or list)
<span className="font-serif text-lg text-primary">
  {finnishWord}
</span>

// Always use font-serif class which maps to Source Serif 4
```

### Progress Bar
```tsx
<div className="w-full h-2 bg-frost rounded-full overflow-hidden">
  <div 
    className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
    style={{ width: `${(current / total) * 100}%` }}
  />
</div>
```

## Animation Patterns

### Correct Answer Flash
```css
@keyframes correct-pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
}
.animate-correct {
  animation: correct-pulse 0.3s ease-out;
  background-color: var(--color-success-light);
  border-color: var(--color-success);
}
```

### Wrong Answer Shake
```css
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-6px); }
  40%, 80% { transform: translateX(6px); }
}
.animate-shake {
  animation: shake 0.4s ease-out;
  background-color: var(--color-error-light);
  border-color: var(--color-error);
}
```

### Page Transitions
```css
@keyframes fade-slide-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.page-enter {
  animation: fade-slide-in 0.25s ease-out;
}
```

### Card Stagger (for lists)
```tsx
// Each card gets increasing delay
<div style={{ animationDelay: `${index * 50}ms` }} className="page-enter">
```

## Accessibility

- All interactive elements focusable via tab
- `aria-label` on icon-only buttons
- `role="option"` on MCQ choices with `aria-selected`
- Color is NEVER the only indicator (always icon or text too)
- Focus visible ring: `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`
- `prefers-reduced-motion`: disable animations

## PWA-Specific UI

### Install Banner (show once, dismissible)
```
┌─────────────────────────────────┐
│ 📱 Install SuomiSprint          │
│ Add to your home screen for     │
│ the best experience             │
│ [Install]  [Not now]            │
└─────────────────────────────────┘
```

### Offline Indicator
When offline, show subtle top banner:
```
┌─────────────────────────────────┐
│ ○ Offline — All features work   │
└─────────────────────────────────┘
```

## Finnish Special Characters Bar

For Free Translation exercises, show a sticky bar above the keyboard:
```
┌─────────────────────────────────┐
│   ä    ö    å    Ä    Ö    Å    │
└─────────────────────────────────┘
```
Each button inserts the character at cursor position in the input field.
Styled: pill buttons, `bg-ice border-frost`, 40px height.

## Responsive Breakpoints

This is a **mobile-only** app. Design for:
- **360px** (minimum — small Android phones)
- **393px** (Pixel A9 width)
- **414px** (larger phones)
- **480px** (max — anything wider centers the content)

No tablet or desktop layouts needed. Content area: `max-w-[480px] mx-auto`.
