import { useState, useEffect, useCallback } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISSED_KEY = 'suomisprint-install-dismissed';

/**
 * Custom PWA install banner.
 * Listens for beforeinstallprompt, shows banner on first visit.
 * Dismissed state stored in localStorage.
 */
export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed or already installed
    if (localStorage.getItem(DISMISSED_KEY)) return;
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setVisible(false);
    }
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    localStorage.setItem(DISMISSED_KEY, '1');
    setDeferredPrompt(null);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 max-w-[480px] mx-auto page-enter">
      <div className="bg-white rounded-xl border border-frost p-4 shadow-lg flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <Download className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display font-semibold text-sm">Install SuomiSprint</p>
          <p className="text-xs text-text-secondary mt-0.5">
            Add to your home screen for the best experience
          </p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleInstall}
              className="px-4 py-1.5 bg-primary text-white text-xs font-display font-semibold rounded-lg min-h-[36px] transition-colors duration-200 hover:bg-primary-light"
            >
              Install
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-1.5 text-xs font-display font-medium text-text-secondary min-h-[36px]"
            >
              Not now
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="shrink-0 p-1 rounded-lg hover:bg-ice transition-colors duration-200"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4 text-text-secondary" />
        </button>
      </div>
    </div>
  );
}
