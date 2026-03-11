import { useState, useEffect, useMemo, useCallback } from 'react';
import { BarChart3, TrendingUp, Award, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { useProgress } from '../hooks/useProgress';
import type { CategoryProgress } from '../hooks/useProgress';
import { ProgressChart } from '../components/stats/ProgressChart';
import {
  vocabCategories,
  phraseCategories,
  getVocabByCategory,
  getPhrasesByCategory,
  getDataStats,
} from '../data/index';

/**
 * Progress overview with stats, category breakdown, and activity summary.
 */
export function StatsPage() {
  const {
    overall,
    loading,
    refresh,
    getAllCategoryProgress,
    getWeekActivity,
    getSessionCount,
  } = useProgress();

  const [categoryProgress, setCategoryProgress] = useState<CategoryProgress[]>([]);
  const [weekActivity, setWeekActivity] = useState({ sessions: 0, wordsReviewed: 0, accuracy: 0 });
  const [sessionCount, setSessionCount] = useState(0);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const dataStats = useMemo(() => getDataStats(), []);

  // Build category list for queries
  const allCategories = useMemo(() => {
    const cats: { id: string; label: string; itemIds: string[]; type: 'vocab' | 'phrase' }[] = [];

    for (const vc of vocabCategories) {
      const items = getVocabByCategory(vc.id);
      cats.push({ id: vc.id, label: vc.label, itemIds: items.map((i) => i.id), type: 'vocab' });
    }
    for (const pc of phraseCategories) {
      const items = getPhrasesByCategory(pc.id);
      cats.push({ id: pc.id, label: pc.label, itemIds: items.map((i) => i.id), type: 'phrase' });
    }
    return cats;
  }, []);

  const loadStats = useCallback(async () => {
    const [catProgress, week, count] = await Promise.all([
      getAllCategoryProgress(allCategories),
      getWeekActivity(),
      getSessionCount(),
    ]);
    setCategoryProgress(catProgress);
    setWeekActivity(week);
    setSessionCount(count);
  }, [getAllCategoryProgress, getWeekActivity, getSessionCount, allCategories]);

  useEffect(() => {
    loadStats(); // eslint-disable-line react-hooks/set-state-in-effect -- async data load on mount
  }, [loadStats]);

  // Refresh on visibility change
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        refresh().then(loadStats);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [refresh, loadStats]);

  // Counts for the status breakdown
  const newCount = dataStats.totalItems - overall.totalAttempted;

  const toggleCategory = useCallback((id: string) => {
    setExpandedCategory((prev) => (prev === id ? null : id));
  }, []);

  return (
    <div className="page-enter space-y-4">
      <div>
        <h2 className="font-display text-2xl font-bold text-primary">Stats</h2>
        <p className="text-text-secondary text-sm mt-1">Track your learning progress.</p>
      </div>

      {/* Overall stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card text-center">
          <BarChart3 className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-2xl font-display font-bold text-primary">
            {loading ? '-' : sessionCount}
          </p>
          <p className="text-xs text-text-secondary">Total sessions</p>
        </div>
        <div className="card text-center">
          <TrendingUp className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-2xl font-display font-bold text-primary">
            {loading ? '-' : `${overall.accuracy}%`}
          </p>
          <p className="text-xs text-text-secondary">Overall accuracy</p>
        </div>
        <div className="card text-center">
          <BookOpen className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-2xl font-display font-bold text-primary">
            {loading ? '-' : overall.totalAttempted}
          </p>
          <p className="text-xs text-text-secondary">Words practiced</p>
        </div>
        <div className="card text-center">
          <Award className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-2xl font-display font-bold text-primary">
            {loading ? '-' : overall.mastered}
          </p>
          <p className="text-xs text-text-secondary">Words mastered</p>
        </div>
      </div>

      {/* Learning status breakdown */}
      <div className="card">
        <h3 className="font-display font-semibold text-xs text-text-secondary uppercase tracking-wide mb-3">
          Learning Status
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-success" />
              <span className="text-sm">Mastered</span>
            </div>
            <span className="font-display font-semibold text-sm text-success">
              {loading ? '-' : overall.mastered}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-warning" />
              <span className="text-sm">Learning</span>
            </div>
            <span className="font-display font-semibold text-sm text-warning">
              {loading ? '-' : overall.learning}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-frost" />
              <span className="text-sm">New</span>
            </div>
            <span className="font-display font-semibold text-sm text-text-secondary">
              {loading ? '-' : newCount}
            </span>
          </div>
        </div>

        {/* Visual progress bar */}
        {!loading && overall.totalAttempted > 0 && (
          <div className="mt-3">
            <div className="w-full h-3 bg-frost rounded-full overflow-hidden flex">
              {overall.mastered > 0 && (
                <div
                  className="h-full bg-success transition-all duration-500"
                  style={{ width: `${(overall.mastered / dataStats.totalItems) * 100}%` }}
                />
              )}
              {overall.learning > 0 && (
                <div
                  className="h-full bg-warning transition-all duration-500"
                  style={{ width: `${(overall.learning / dataStats.totalItems) * 100}%` }}
                />
              )}
            </div>
            <p className="text-[10px] text-text-secondary mt-1 text-center">
              {overall.totalAttempted} of {dataStats.totalItems} items practiced
            </p>
          </div>
        )}
      </div>

      {/* Last 7 days activity */}
      <div className="card">
        <h3 className="font-display font-semibold text-xs text-text-secondary uppercase tracking-wide mb-3">
          Last 7 Days
        </h3>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-xl font-display font-bold text-primary">{weekActivity.sessions}</p>
            <p className="text-[10px] text-text-secondary">Sessions</p>
          </div>
          <div>
            <p className="text-xl font-display font-bold text-primary">{weekActivity.wordsReviewed}</p>
            <p className="text-[10px] text-text-secondary">Questions</p>
          </div>
          <div>
            <p className={`text-xl font-display font-bold ${
              weekActivity.accuracy >= 80
                ? 'text-success'
                : weekActivity.accuracy >= 50
                  ? 'text-warning'
                  : weekActivity.accuracy > 0
                    ? 'text-error'
                    : 'text-primary'
            }`}>
              {weekActivity.sessions > 0 ? `${weekActivity.accuracy}%` : '-'}
            </p>
            <p className="text-[10px] text-text-secondary">Accuracy</p>
          </div>
        </div>
      </div>

      {/* Category accuracy chart */}
      <div className="card">
        <h3 className="font-display font-semibold text-xs text-text-secondary uppercase tracking-wide mb-3">
          Accuracy by Category
        </h3>
        <ProgressChart categories={categoryProgress} />
      </div>

      {/* Category breakdown (expandable) */}
      <div className="card">
        <h3 className="font-display font-semibold text-xs text-text-secondary uppercase tracking-wide mb-3">
          Category Details
        </h3>
        <div className="divide-y divide-frost">
          {categoryProgress.map((cat) => {
            const isExpanded = expandedCategory === cat.category;
            return (
              <div key={cat.category}>
                <button
                  onClick={() => toggleCategory(cat.category)}
                  className="w-full flex items-center justify-between py-2.5 min-h-[44px]"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        cat.attempted === 0
                          ? 'bg-frost'
                          : cat.accuracy >= 80
                            ? 'bg-success'
                            : cat.accuracy >= 50
                              ? 'bg-warning'
                              : 'bg-error'
                      }`}
                    />
                    <span className="font-display text-sm font-medium truncate">
                      {cat.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {cat.attempted > 0 && (
                      <span
                        className={`text-xs font-display font-semibold ${
                          cat.accuracy >= 80
                            ? 'text-success'
                            : cat.accuracy >= 50
                              ? 'text-warning'
                              : 'text-error'
                        }`}
                      >
                        {cat.accuracy}%
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-text-secondary" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-text-secondary" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="pb-3 pl-4 space-y-1.5 text-xs text-text-secondary">
                    <div className="flex justify-between">
                      <span>Practiced</span>
                      <span className="font-display font-medium text-text-primary">
                        {cat.attempted} / {cat.totalItems}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Mastered</span>
                      <span className="font-display font-medium text-success">
                        {cat.mastered}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Accuracy</span>
                      <span className={`font-display font-medium ${
                        cat.attempted === 0
                          ? 'text-text-secondary'
                          : cat.accuracy >= 80
                            ? 'text-success'
                            : cat.accuracy >= 50
                              ? 'text-warning'
                              : 'text-error'
                      }`}>
                        {cat.attempted > 0 ? `${cat.accuracy}%` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Due for review</span>
                      <span className={`font-display font-medium ${cat.dueCount > 0 ? 'text-warning' : 'text-text-secondary'}`}>
                        {cat.dueCount}
                      </span>
                    </div>

                    {/* Mini progress bar */}
                    <div className="w-full h-2 bg-frost rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{ width: `${(cat.attempted / cat.totalItems) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default StatsPage;
