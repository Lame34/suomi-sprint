import { useState } from 'react';
import { categories as vocabCategories } from '../data/vocabulary/_index';
import { categories as phraseCategories } from '../data/phrases/_index';
import { CategoryList } from '../components/vocabulary/CategoryList';

type Tab = 'vocabulary' | 'phrases';

/**
 * Learn page with two tabs: Vocabulary and Phrases.
 * Each tab shows a CategoryList grid.
 * Route: /learn
 */
export function VocabularyPage() {
  const [tab, setTab] = useState<Tab>('vocabulary');

  return (
    <div className="page-enter space-y-4">
      <div>
        <h2 className="font-display text-2xl font-bold text-primary">Learn</h2>
        <p className="text-text-secondary text-sm mt-1">
          Browse {tab === 'vocabulary' ? 'vocabulary' : 'phrases'} by category.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex rounded-lg bg-ice p-1 gap-1" role="tablist">
        <button
          role="tab"
          aria-selected={tab === 'vocabulary'}
          onClick={() => setTab('vocabulary')}
          className={`flex-1 text-center py-2.5 rounded-md text-sm font-display font-semibold transition-all duration-200 min-h-[44px] ${
            tab === 'vocabulary'
              ? 'bg-white text-primary shadow-sm'
              : 'text-text-secondary hover:text-primary'
          }`}
        >
          Vocabulary
        </button>
        <button
          role="tab"
          aria-selected={tab === 'phrases'}
          onClick={() => setTab('phrases')}
          className={`flex-1 text-center py-2.5 rounded-md text-sm font-display font-semibold transition-all duration-200 min-h-[44px] ${
            tab === 'phrases'
              ? 'bg-white text-primary shadow-sm'
              : 'text-text-secondary hover:text-primary'
          }`}
        >
          Phrases
        </button>
      </div>

      {/* Tab content */}
      {tab === 'vocabulary' ? (
        <CategoryList
          categories={vocabCategories}
          basePath="/learn/vocab"
        />
      ) : (
        <CategoryList
          categories={phraseCategories}
          basePath="/learn/phrases"
        />
      )}
    </div>
  );
}

export default VocabularyPage;
