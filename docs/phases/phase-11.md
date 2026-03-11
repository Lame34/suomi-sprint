# Phase 11 — PWA Polish

## Started: 2026-03-11

### Actions
- [23:40] Read CLAUDE.md PWA section and vite.config.ts, index.html, existing icons, offline.html
- [23:42] Updated `public/favicon.svg`:
  - Blue rounded rect (#003580), white "S" in Instrument Sans font
- [23:43] Created icon source SVGs:
  - `public/icons/icon-source.svg`: 512x512 with rounded corners for standard icon
  - `public/icons/icon-maskable-source.svg`: 512x512 full-bleed background, smaller "S" within safe zone (inner 80%)
- [23:44] Generated PNG icons via sharp-cli from SVG sources:
  - Standard: 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512
  - Maskable: 192x192, 512x512
  - Removed old SVG-only icons (icon-192x192.svg, icon-512x512.svg)
- [23:46] Updated `vite.config.ts`:
  - Full manifest: name "SuomiSprint", short_name "Suomi", description, theme_color #003580, background_color #131214, display standalone, orientation portrait
  - All 10 icon entries (8 standard PNG + 2 maskable PNG)
  - includeAssets: favicon.svg, icons/*.png, icons/*.svg, offline.html
  - Workbox globPatterns: all static assets (js, css, html, ico, png, svg, json, woff2)
  - navigateFallback: 'index.html' for SPA routing
  - Runtime caching: Google Fonts stylesheets (StaleWhileRevalidate), Google Fonts webfonts (CacheFirst, 365-day expiration)
- [23:48] Updated `index.html`:
  - viewport with viewport-fit=cover, maximum-scale=1.0, user-scalable=no
  - apple-mobile-web-app-capable: yes
  - apple-mobile-web-app-status-bar-style: black-translucent
  - apple-mobile-web-app-title: SuomiSprint
  - Apple touch icons: 152x152 and 192x192
  - Open Graph tags: og:title, og:description, og:image, og:type
  - Updated description meta tag
- [23:50] Created `src/components/layout/InstallPrompt.tsx`:
  - Listens for `beforeinstallprompt` event
  - Shows custom install banner (card with Download icon, app name, "Install" + "Not now" buttons)
  - Doesn't show if already dismissed (localStorage flag), already installed (standalone mode check), or if browser doesn't fire the event
  - "Install" calls `event.prompt()` and watches `userChoice`
  - "Not now" / X button sets localStorage dismiss flag
  - Positioned above bottom nav (bottom-20), max-width 480px, page-enter animation
- [23:52] Created `src/components/layout/OfflineIndicator.tsx`:
  - Listens for `online`/`offline` window events + checks `navigator.onLine` on mount
  - Shows fixed top bar (z-60, above header) with WifiOff icon: "Offline — All features work"
  - Warning color background, white text
  - Auto-dismisses when connection restores
- [23:53] Updated `src/components/layout/AppShell.tsx`:
  - Added OfflineIndicator above Header
  - Added InstallPrompt below BottomNav
- [23:55] Build — zero TypeScript errors, 54 precached entries (728KB)
- [23:56] Smoke test via `npx serve dist`:
  - manifest.webmanifest: 200, correct JSON
  - sw.js: 200, 4.7KB
  - icons/icon-512x512.png: 200, 10KB
  - index.html: 200, 2KB

### Files Created/Modified
| File | Action | Description |
|------|--------|-------------|
| `public/favicon.svg` | Updated | Cleaner blue/white "S" icon |
| `public/icons/icon-source.svg` | Created | Source SVG for standard icons |
| `public/icons/icon-maskable-source.svg` | Created | Source SVG for maskable icons |
| `public/icons/icon-{72..512}x{72..512}.png` | Created | 8 standard PNG icons |
| `public/icons/icon-maskable-{192,512}x{192,512}.png` | Created | 2 maskable PNG icons |
| `public/icons/icon-192x192.svg` | Deleted | Replaced by PNG |
| `public/icons/icon-512x512.svg` | Deleted | Replaced by PNG |
| `vite.config.ts` | Updated | Full PWA manifest, runtime font caching |
| `index.html` | Updated | Apple meta tags, og:image, viewport-fit |
| `src/components/layout/InstallPrompt.tsx` | Created | Custom install prompt banner |
| `src/components/layout/OfflineIndicator.tsx` | Created | Offline status bar |
| `src/components/layout/AppShell.tsx` | Updated | Wired in InstallPrompt + OfflineIndicator |

### Design Decisions
- **PNG over SVG icons**: Android Chrome requires PNG icons for the manifest. SVGs kept as sources for regeneration.
- **Separate maskable icons**: Maskable icons need full-bleed background with content in the inner 80% safe zone. Separate source SVG ensures the "S" isn't clipped by circular/squircle masks.
- **background_color #131214**: Dark background for the splash screen between launch and first paint — looks more intentional than white.
- **Google Fonts runtime caching**: Fonts load from CDN on first visit, then served from CacheFirst cache offline. StaleWhileRevalidate for the CSS ensures font declarations stay fresh.
- **navigateFallback**: Enables SPA client-side routing to work offline — all navigation requests fall back to index.html.
- **Install prompt positioning**: Bottom-20 places the banner above the bottom nav bar, ensuring it doesn't overlap navigation. Dismissal flag in localStorage persists across sessions.
- **Offline indicator z-60**: Higher z-index than the header (z-50) so the "Offline" bar is always visible on top.
- **viewport user-scalable=no**: Prevents accidental zoom during tap interactions on mobile, which is standard for app-like PWAs.

### Completed: 2026-03-11
