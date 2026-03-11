# SuomiSprint

Finnish language learning PWA. Learn vocabulary and phrases through spaced repetition exercises, entirely offline.

## Features

- **2,290+ vocabulary words** across 18 categories (greetings, food, animals, verbs, etc.)
- **238+ phrases** across 6 categories (survival, restaurant, directions, etc.)
- **4 exercise types**: Multiple choice, Match pairs, Free translation, Fill in the blank
- **Spaced repetition** (SM-2 algorithm) for efficient review scheduling
- **Progress tracking** with per-category accuracy, streaks, and session history
- **Offline-first PWA** — works without internet after first load
- **Installable** on Android (Pixel A9 tested) as a standalone app

## Tech Stack

- React 18 + TypeScript
- Vite 5 with vite-plugin-pwa (Workbox)
- Tailwind CSS 3
- Dexie.js (IndexedDB) for local persistence
- Lucide React icons

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Type check
npx tsc --noEmit

# Lint
npx eslint .

# Production build
npm run build

# Preview production build
npm run preview
```

## Deploy to Vercel

1. Push to a GitHub repository
2. Import the repo on [vercel.com](https://vercel.com)
3. Framework preset: **Vite**
4. Build command: `npm run build`
5. Output directory: `dist`
6. Deploy — HTTPS and PWA service worker work automatically

## Install on Phone

1. Open the deployed URL in Chrome on your Android device
2. Tap the install banner, or use menu > "Install app"
3. The app appears on your home screen and works offline
