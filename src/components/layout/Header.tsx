import { useNavigate, useLocation } from 'react-router-dom';
import { Settings, ChevronLeft } from 'lucide-react';

/**
 * Fixed top header bar (56px).
 * Shows back button on non-home pages, centered title, settings gear on right.
 */
interface Props {
  title?: string;
}

export function Header({ title = 'SuomiSprint' }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isSettings = location.pathname === '/settings';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface border-b border-frost h-14 flex items-center px-4">
      <div className="w-full max-w-[480px] mx-auto flex items-center justify-between">
        {/* Left slot: back button or spacer */}
        <div className="w-10 flex items-center">
          {!isHome && (
            <button
              onClick={() => navigate(-1)}
              className="min-h-[48px] min-w-[48px] flex items-center justify-center -ml-3 rounded-lg transition-colors duration-200 hover:bg-ice focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              aria-label="Go back"
            >
              <ChevronLeft className="w-6 h-6 text-primary" />
            </button>
          )}
        </div>

        {/* Center: title */}
        <h1 className="font-display text-lg font-semibold text-primary select-none">
          {title}
        </h1>

        {/* Right slot: settings gear (hidden on settings page) */}
        <div className="w-10 flex items-center justify-end">
          {!isSettings && (
            <button
              onClick={() => navigate('/settings')}
              className="min-h-[48px] min-w-[48px] flex items-center justify-center -mr-3 rounded-lg transition-colors duration-200 hover:bg-ice focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5 text-text-secondary" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
