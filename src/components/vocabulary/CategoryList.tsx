import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import { getIcon } from '../../lib/icons';
import type { VocabCategoryMeta } from '../../data/vocabulary/_index';
import type { PhraseCategoryMeta } from '../../data/phrases/_index';

type CategoryMeta = VocabCategoryMeta | PhraseCategoryMeta;

interface Props {
  categories: CategoryMeta[];
  /** Route prefix: navigates to `${basePath}/${category.id}` */
  basePath: string;
}

const difficultyLabel: Record<number, string> = {
  1: 'Beginner',
  2: 'Intermediate',
  3: 'Advanced',
};

const difficultyColor: Record<number, string> = {
  1: 'bg-success-light text-success',
  2: 'bg-warning-badge text-warning',
  3: 'bg-error-light text-error',
};

/**
 * 2-column grid of category cards with icon, name, count, and difficulty badge.
 * Staggered fade-in animation on load.
 */
export function CategoryList({ categories, basePath }: Props) {
  const navigate = useNavigate();

  const practiceType = basePath.includes('phrases') ? 'phrase' : 'vocab';

  return (
    <div className="grid grid-cols-2 gap-3">
      {categories.map((cat, index) => {
        const Icon = getIcon(cat.icon);
        return (
          <div
            key={cat.id}
            className="card flex flex-col items-start gap-2 text-left hover:border-primary-light transition-all duration-200 stagger-enter cursor-pointer"
            style={{ animationDelay: `${index * 50}ms` }}
            onClick={() => navigate(`${basePath}/${cat.id}`)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') navigate(`${basePath}/${cat.id}`); }}
          >
            <div className="w-full flex items-start justify-between">
              <div className="w-10 h-10 rounded-lg bg-ice flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/practice?category=${cat.id}&type=${practiceType}&autostart=true`);
                }}
                className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0 hover:bg-primary-dark active:scale-95 transition-all duration-200"
                aria-label={`Start lesson: ${cat.label}`}
              >
                <Play className="w-4 h-4 text-white fill-white" />
              </button>
            </div>
            <div className="w-full min-w-0">
              <p className="font-display font-semibold text-sm leading-tight text-text-primary truncate">
                {cat.label}
              </p>
              <p className="text-xs text-text-secondary mt-0.5">
                {cat.itemCount} {basePath.includes('phrases') ? 'phrases' : 'words'}
              </p>
            </div>
            <span
              className={`text-[10px] font-display font-medium px-2 py-0.5 rounded-full ${difficultyColor[cat.difficulty] ?? difficultyColor[1]}`}
            >
              {difficultyLabel[cat.difficulty] ?? 'Beginner'}
            </span>
          </div>
        );
      })}
    </div>
  );
}
