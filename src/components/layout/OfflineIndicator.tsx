import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

/**
 * Subtle top banner shown when the app is offline.
 * Auto-dismisses when connection is restored.
 */
export function OfflineIndicator() {
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOffline = () => setOffline(true);
    const goOnline = () => setOffline(false);

    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);

    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-warning text-white text-center py-1.5 px-4">
      <div className="max-w-[480px] mx-auto flex items-center justify-center gap-2 text-xs font-display font-medium">
        <WifiOff className="w-3.5 h-3.5" />
        <span>Offline — All features work</span>
      </div>
    </div>
  );
}
