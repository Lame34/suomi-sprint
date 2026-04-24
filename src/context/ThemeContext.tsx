/* eslint-disable react-refresh/only-export-components -- context file co-locates the provider and the hook */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Theme } from '../types';
import { getSettings, saveSettings } from '../lib/db';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Apply the theme attribute to the <html> element and update the
 * <meta name="theme-color"> tag so the browser UI matches.
 */
function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'light' ? '#FFFFFF' : '#0A0A0F');
}

/**
 * Provides the current theme (dark or light) at the App level.
 * Reads the initial value from IndexedDB and persists changes.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');

  // Load the saved theme on first mount
  useEffect(() => {
    getSettings().then((s) => {
      const initial = s.theme ?? 'dark';
      setThemeState(initial);
      applyTheme(initial);
    });
  }, []);

  const setTheme = (next: Theme) => {
    setThemeState(next);
    applyTheme(next);
    // Persist the change in IndexedDB alongside the other settings
    getSettings().then((s) => saveSettings({ ...s, theme: next }));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
