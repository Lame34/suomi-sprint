import { useNavigate } from 'react-router-dom';
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
  2: 'bg-[#FFF8E1] text-warning',
  3: 'bg-error-light text-error',
};

/**
 * 2-column grid of category cards with icon, name, count, and difficulty badge.
 * Staggered fade-in animation on load.
 */
export function CategoryList({ categories, basePath }: Props) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 gap-3">
      {categories.map((cat, index) => {
        const Icon = getIcon(cat.icon);
        return (
          <button
            key={cat.id}
            onClick={() => navigate(`${basePath}/${cat.id}`)}
            className="card flex flex-col items-start gap-2 text-left hover:border-primary-light active:scale-[0.98] transition-all duration-200 stagger-enter"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="w-10 h-10 rounded-lg bg-ice flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 text-primary" />
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
          </button>
        );
      })}
    </div>
  );
}
