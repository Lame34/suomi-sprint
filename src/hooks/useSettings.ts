import { useState, useEffect, useCallback } from 'react';
import type { UserSettings } from '../types';
import { getSettings, saveSettings, DEFAULT_SETTINGS } from '../lib/db';

interface UseSettingsReturn {
  settings: UserSettings;
  loading: boolean;
  update: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void;
  reset: () => void;
}

/**
 * Hook for reading and writing user settings.
 * Changes are persisted to IndexedDB immediately (no save button).
 */
export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<UserSettings>({ ...DEFAULT_SETTINGS });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSettings().then((s) => {
      setSettings(s);
      setLoading(false);
    });
  }, []);

  const update = useCallback(<K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      saveSettings(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    const defaults = { ...DEFAULT_SETTINGS };
    setSettings(defaults);
    saveSettings(defaults);
  }, []);

  return { settings, loading, update, reset };
}
