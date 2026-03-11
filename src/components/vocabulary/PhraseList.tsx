import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, ArrowLeft } from 'lucide-react';
import { getPhrasesByCategory, getPhraseCategoryMeta } from '../../data/phrases/_index';
import { DynamicIcon } from '../../lib/icons';
import { db } from '../../lib/db';
import type { PhraseEntry, ProgressRecord } from '../../types';
import { PhraseCard } from './PhraseCard';

type ItemStatus = 'mastered' | 'learning' | 'new';

function getStatus(progress: ProgressRecord | undefined): ItemStatus {
  if (!progress) return 'new';
  if (progress.repetitions >= 3) return 'mastered';
  if (progress.totalAttempts > 0) return 'learning';
  return 'new';
}

/**
 * Phrase list page for a phrase category.
 * Route: /learn/phrases/:categoryId
 */
export function PhraseList() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [progressMap, setProgressMap] = useState<Map<string, ProgressRecord>>(new Map());

  const meta = categoryId ? getPhraseCategoryMeta(categoryId) : undefined;
  const items = useMemo(() => (categoryId ? getPhrasesByCategory(categoryId) : []), [categoryId]);

  // Load progress for all items in this category
  useEffect(() => {
    if (items.length === 0) return;
    const ids = items.map((i) => i.id);
    db.progress
      .where('itemId')
      .anyOf(ids)
      .toArray()
      .then((records) => {
        const map = new Map<string, ProgressRecord>();
        for (const r of records) {
          map.set(r.itemId, r);
        }
        setProgressMap(map);  
      });
  }, [categoryId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Filter and sort items
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result: PhraseEntry[];
    if (q) {
      result = items.filter(
        (item) =>
          item.finnish.toLowerCase().includes(q) ||
          item.english.toLowerCase().includes(q),
      );
    } else {
      result = [...items];
    }
    // Sort: difficulty ascending, then Finnish alphabetical
    result.sort((a, b) => {
      if (a.difficulty !== b.difficulty) return a.difficulty - b.difficulty;
      return a.finnish.localeCompare(b.finnish, 'fi');
    });
    return result;
  }, [items, query]);

  const masteredCount = items.filter((i) => getStatus(progressMap.get(i.id)) === 'mastered').length;
  const learningCount = items.filter((i) => getStatus(progressMap.get(i.id)) === 'learning').length;

  if (!meta) {
    return (
      <div className="page-enter p-4 text-center">
        <p className="text-text-secondary">Category not found.</p>
        <button onClick={() => navigate('/learn')} className="btn-primary mt-4">
          Back to Learn
        </button>
      </div>
    );
  }

  return (
    <div className="page-enter space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/learn')}
          className="min-h-[48px] min-w-[48px] flex items-center justify-center -ml-3 rounded-lg transition-colors duration-200 hover:bg-ice"
          aria-label="Back to categories"
        >
          <ArrowLeft className="w-5 h-5 text-primary" />
        </button>
        {meta.icon && (
          <div className="w-10 h-10 rounded-lg bg-ice flex items-center justify-center shrink-0">
            <DynamicIcon name={meta.icon} className="w-5 h-5 text-primary" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h2 className="font-display text-xl font-bold text-primary truncate">
            {meta.label}
          </h2>
          <p className="text-xs text-text-secondary">
            {items.length} phrases
            {masteredCount > 0 && <span className="text-success ml-2">{masteredCount} mastered</span>}
            {learningCount > 0 && <span className="text-warning ml-2">{learningCount} learning</span>}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search phrases..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-frost bg-surface-raised text-sm focus:outline-none focus:border-primary transition-colors duration-200"
        />
      </div>

      {/* Phrase list */}
      <div className="space-y-2">
        {filtered.map((item) => (
          <PhraseCard
            key={item.id}
            item={item}
            status={getStatus(progressMap.get(item.id))}
          />
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-text-secondary text-sm py-8">
            No phrases match your search.
          </p>
        )}
      </div>
    </div>
  );
}
