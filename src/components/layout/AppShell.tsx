import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { InstallPrompt } from './InstallPrompt';
import { OfflineIndicator } from './OfflineIndicator';

/**
 * App layout wrapper.
 * Fixed header (56px) + scrollable content area + fixed bottom nav (64px).
 * Content centered at max-w-480px for mobile-first design.
 * Includes PWA install prompt and offline indicator overlays.
 */
export function AppShell() {
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
