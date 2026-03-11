import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { InstallPrompt } from './InstallPrompt';
import { OfflineIndicator } from './OfflineIndicator';
import { getSettings } from '../../lib/db';
import type { Theme } from '../../types';

/** Apply theme attribute to <html> and update meta theme-color */
function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'light' ? '#FFFFFF' : '#0A0A0F');
}

/**
 * App layout wrapper.
 * Fixed header (56px) + scrollable content area + fixed bottom nav (64px).
 * Content centered at max-w-480px for mobile-first design.
 * Includes PWA install prompt and offline indicator overlays.
 */
export function AppShell() {
  // Load theme on mount
  useEffect(() => {
    getSettings().then((s) => applyTheme(s.theme ?? 'dark'));
  }, []);

  // Listen for theme changes from settings page
  useEffect(() => {
    const handler = (e: Event) => applyTheme((e as CustomEvent<Theme>).detail);
    window.addEventListener('theme-change', handler);
    return () => window.removeEventListener('theme-change', handler);
  }, []);

  return (
    <div className="min-h-dvh flex flex-col bg-ice">
      <OfflineIndicator />
      <Header />

      {/* Scrollable content area with clearance for fixed header and nav */}
      <main className="flex-1 overflow-y-auto pt-14 pb-20">
        <div className="max-w-[480px] mx-auto px-4 py-4">
          <Outlet />
        </div>
      </main>

      <BottomNav />
      <InstallPrompt />
    </div>
  );
}

export default AppShell;
