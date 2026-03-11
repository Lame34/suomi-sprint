import { NavLink } from 'react-router-dom';
import { Home, BookOpen, Target, BarChart3 } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/learn', label: 'Learn', icon: BookOpen },
  { to: '/practice', label: 'Practice', icon: Target },
  { to: '/stats', label: 'Stats', icon: BarChart3 },
] as const;

/**
 * Fixed bottom navigation bar with 4 tabs.
 * Active tab: Finnish blue icon + label + dot indicator.
 * Inactive tab: grey icon + label.
 * 64px height minimum, safe-area-inset-bottom padding.
 */
export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-frost">
      <div className="max-w-[480px] mx-auto flex items-stretch pb-[env(safe-area-inset-bottom)]">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `relative flex-1 flex flex-col items-center justify-center gap-1 min-h-[64px] transition-colors duration-200 ${
                isActive
                  ? 'text-primary'
                  : 'text-text-secondary hover:text-primary-light'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                <span className="font-display text-[10px] uppercase tracking-wider font-medium">
                  {label}
                </span>
                {isActive && (
                  <span className="absolute bottom-2 w-1 h-1 rounded-full bg-primary" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default BottomNav;
