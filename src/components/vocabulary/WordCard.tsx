import { useState } from 'react';
import { ChevronDown, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { VocabEntry } from '../../types';

interface Props {
  item: VocabEntry;
  /** Progress status: 'mastered' | 'learning' | 'new' */
  status: 'mastered' | 'learning' | 'new';
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

const statusDot: Record<string, string> = {
  mastered: 'bg-success',
  learning: 'bg-warning',
  new: 'bg-frost',
};

/**
 * Expandable word card.
 * Collapsed: Finnish word (serif, blue) + English + progress dot.
 * Expanded: + part of speech, notes, examples, difficulty badge, practice button.
 */
export function WordCard({ item, status }: Props) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="card transition-all duration-200">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center gap-3 text-left min-h-[48px]"
        aria-expanded={expanded}
      >
        {/* Progress dot */}
        <span
          className={`w-2.5 h-2.5 rounded-full shrink-0 ${statusDot[status]}`}
          aria-label={`Status: ${status}`}
        />

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <span className="finnish-word text-lg">{item.finnish}</span>
          <span className="text-text-secondary text-sm ml-2">{item.english}</span>
        </div>

        {/* Expand chevron */}
        <ChevronDown
          className={`w-4 h-4 text-text-secondary shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-frost space-y-3 page-enter">
          {/* Part of speech + difficulty */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-display font-medium text-text-secondary bg-ice px-2 py-0.5 rounded-full">
              {item.partOfSpeech}
            </span>
            <span
              className={`text-[10px] font-display font-medium px-2 py-0.5 rounded-full ${difficultyColor[item.difficulty]}`}
            >
              {difficultyLabel[item.difficulty]}
            </span>
          </div>

          {/* Notes */}
          {item.notes && (
            <p className="text-sm text-text-secondary leading-relaxed">
              {item.notes}
            </p>
          )}

          {/* Examples */}
          {item.examples && item.examples.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-display font-semibold text-text-secondary uppercase tracking-wider">
                Examples
              </p>
              {item.examples.map((ex, i) => (
                <p key={i} className="finnish-word text-sm leading-relaxed">
                  {ex}
                </p>
              ))}
            </div>
          )}

          {/* Practice button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/practice?category=${item.category}&type=vocab`);
            }}
            className="btn-secondary flex items-center justify-center gap-2 !w-auto !min-h-[40px] !px-4 !py-2 text-sm"
          >
            <Play className="w-4 h-4" />
            Practice this category
          </button>
        </div>
      )}
    </div>
  );
}
