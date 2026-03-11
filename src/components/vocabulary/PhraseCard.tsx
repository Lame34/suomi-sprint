import { useState } from 'react';
import { ChevronDown, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { PhraseEntry } from '../../types';

interface Props {
  item: PhraseEntry;
  status: 'mastered' | 'learning' | 'new';
}

const statusDot: Record<string, string> = {
  mastered: 'bg-success',
  learning: 'bg-warning',
  new: 'bg-frost',
};

/**
 * Expandable phrase card.
 * Collapsed: Finnish phrase (serif) + English translation + progress dot.
 * Expanded: + literal translation, notes, practice button.
 */
export function PhraseCard({ item, status }: Props) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="card transition-all duration-200">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-start gap-3 text-left min-h-[48px]"
        aria-expanded={expanded}
      >
        {/* Progress dot */}
        <span
          className={`w-2.5 h-2.5 rounded-full shrink-0 mt-2 ${statusDot[status]}`}
          aria-label={`Status: ${status}`}
        />

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <p className="finnish-word text-lg leading-snug">{item.finnish}</p>
          <p className="text-text-secondary text-sm mt-0.5">{item.english}</p>
        </div>

        {/* Expand chevron */}
        <ChevronDown
          className={`w-4 h-4 text-text-secondary shrink-0 mt-2 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-frost space-y-3 page-enter">
          {/* Literal translation */}
          {item.literalTranslation && (
            <div>
              <p className="text-xs font-display font-semibold text-text-secondary uppercase tracking-wider">
                Literal
              </p>
              <p className="text-sm text-text-secondary mt-0.5 italic">
                {item.literalTranslation}
              </p>
            </div>
          )}

          {/* Notes */}
          {item.notes && (
            <p className="text-sm text-text-secondary leading-relaxed">
              {item.notes}
            </p>
          )}

          {/* Practice button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/practice?category=${item.category}&type=phrase`);
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
