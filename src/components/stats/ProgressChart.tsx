import type { CategoryProgress } from '../../hooks/useProgress';

interface Props {
  categories: CategoryProgress[];
}

/**
 * Horizontal bar chart showing accuracy per category.
 * Pure CSS bars — no chart library needed.
 * Sorted by most practiced categories first.
 */
export function ProgressChart({ categories }: Props) {
  // Filter to only practiced categories, sort by most practiced
  const practiced = categories
    .filter((c) => c.attempted > 0)
    .sort((a, b) => b.attempted - a.attempted);

  if (practiced.length === 0) {
    return (
      <div className="py-4 text-center">
        <p className="text-sm text-text-secondary">
          Complete some practice sessions to see your progress by category.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {practiced.map((cat) => (
        <div key={cat.category} className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-display font-medium text-text-primary truncate mr-2">
              {cat.label}
            </span>
            <span
              className={`font-display font-semibold shrink-0 ${
                cat.accuracy >= 80
                  ? 'text-success'
                  : cat.accuracy >= 50
                    ? 'text-warning'
                    : 'text-error'
              }`}
            >
              {cat.accuracy}%
            </span>
          </div>
          <div className="w-full h-3 bg-frost rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                cat.accuracy >= 80
                  ? 'bg-success'
                  : cat.accuracy >= 50
                    ? 'bg-warning'
                    : 'bg-error'
              }`}
              style={{ width: `${cat.accuracy}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-text-secondary">
            <span>{cat.attempted}/{cat.totalItems} practiced</span>
            <span>{cat.mastered} mastered</span>
          </div>
        </div>
      ))}
    </div>
  );
}
