import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Target, Clock, TrendingUp, Flame, AlertTriangle } from 'lucide-react';
import { useProgress } from '../hooks/useProgress';
import type { CategoryProgress } from '../hooks/useProgress';
import { useSpacedRepetition } from '../hooks/useSpacedRepetition';
import {
  getAllItems,
  vocabCategories,
  phraseCategories,
  getVocabByCategory,
  getPhrasesByCategory,
} from '../data/index';

/**
 * Dashboard / welcome page.
 * Shows live stats, streak, review CTA, focus areas, and quick actions.
 */
export function HomePage() {
  const navigate = useNavigate();
  const {
    overall,
    loading: progressLoading,
    refresh: refreshProgress,
    getAllCategoryProgress,
    getTodayStats,
    getStreak,
  } = useProgress();
  const { dueCount, loading: reviewLoading, refresh: refreshReview } = useSpacedRepetition();

  const [streak, setStreak] = useState(0);
  const [todayWords, setTodayWords] = useState(0);
  const [focusAreas, setFocusAreas] = useState<CategoryProgress[]>([]);

  // Build category list for queries
  const allCategories = useMemo(() => {
    const cats: { id: string; label: string; itemIds: string[] }[] = [];
    for (const vc of vocabCategories) {
      const items = getVocabByCategory(vc.id);
      cats.push({ id: vc.id, label: vc.label, itemIds: items.map((i) => i.id) });
    }
    for (const pc of phraseCategories) {
      const items = getPhrasesByCategory(pc.id);
      cats.push({ id: pc.id, label: pc.label, itemIds: items.map((i) => i.id) });
    }
    return cats;
  }, []);

  const loadDashboardData = useCallback(async () => {
    const [today, streakVal, catProgress] = await Promise.all([
      getTodayStats(),
      getStreak(),
      getAllCategoryProgress(allCategories),
    ]);
    setTodayWords(today.wordsToday);
    setStreak(streakVal);

    // Focus areas: categories with lowest accuracy that have been practiced (< 70%)
    const focus = catProgress
      .filter((c) => c.attempted > 0 && c.accuracy < 70)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 3);
    setFocusAreas(focus);
  }, [getTodayStats, getStreak, getAllCategoryProgress, allCategories]);

  useEffect(() => {
    loadDashboardData(); // eslint-disable-line react-hooks/set-state-in-effect -- async data load on mount
  }, [loadDashboardData]);

  // Random word of the day (stable per page load)
  const wordOfDay = useMemo(() => {
    const items = getAllItems();
    const today = new Date();
    const dayIndex = today.getFullYear() * 366 + today.getMonth() * 31 + today.getDate();
    return items[dayIndex % items.length];
  }, []);

  // Refresh stats when page becomes visible
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        refreshProgress().then(loadDashboardData);
        refreshReview();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [refreshProgress, refreshReview, loadDashboardData]);

  const loading = progressLoading || reviewLoading;

  return (
    <div className="page-enter space-y-4">
      {/* Welcome section */}
      <div>
        <h2 className="font-display text-2xl font-bold text-primary">
          Tervetuloa!
        </h2>
        <p className="text-text-secondary mt-1">
          Ready to practice your Finnish?
        </p>
      </div>

      {/* Quick stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-ice flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-display font-bold text-primary">
              {loading ? '-' : overall.mastered}
            </p>
            <p className="text-xs text-text-secondary">Mastered</p>
          </div>
        </div>

        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-ice flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-display font-bold text-primary">
              {loading ? '-' : `${overall.accuracy}%`}
            </p>
            <p className="text-xs text-text-secondary">Accuracy</p>
          </div>
        </div>

        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-ice flex items-center justify-center shrink-0">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-display font-bold text-primary">
              {loading ? '-' : todayWords}
            </p>
            <p className="text-xs text-text-secondary">Today</p>
          </div>
        </div>

        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-ice flex items-center justify-center shrink-0">
            <Flame className={`w-5 h-5 ${streak > 0 ? 'text-warning' : 'text-primary'}`} />
          </div>
          <div>
            <p className={`text-2xl font-display font-bold ${streak > 0 ? 'text-warning' : 'text-primary'}`}>
              {loading ? '-' : streak}
            </p>
            <p className="text-xs text-text-secondary">Day streak</p>
          </div>
        </div>
      </div>

      {/* Review CTA — contextual */}
      {!loading && dueCount > 0 ? (
        <button
          onClick={() => navigate('/review')}
          className="btn-primary relative"
        >
          <span className="flex items-center justify-center gap-2">
            <Clock className="w-4 h-4" />
            Review {dueCount} {dueCount === 1 ? 'item' : 'items'}
          </span>
        </button>
      ) : !loading ? (
        <button
          onClick={() => navigate('/practice')}
          className="btn-primary"
        >
          Continue Learning
        </button>
      ) : null}

      {/* Focus areas */}
      {focusAreas.length > 0 && (
        <div className="card">
          <h3 className="font-display font-semibold text-sm text-text-secondary uppercase tracking-wide mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            Focus Areas
          </h3>
          <div className="space-y-2">
            {focusAreas.map((area) => (
              <button
                key={area.category}
                onClick={() => navigate(`/practice?category=${area.category}&type=${
                  vocabCategories.some((v) => v.id === area.category) ? 'vocab' : 'phrase'
                }`)}
                className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-ice transition-colors duration-200 min-h-[44px]"
              >
                <span className="font-display text-sm font-medium">{area.label}</span>
                <span className={`text-xs font-display font-semibold ${
                  area.accuracy >= 50 ? 'text-warning' : 'text-error'
                }`}>
                  {area.accuracy}%
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="card">
        <h3 className="font-display font-semibold text-sm text-text-secondary uppercase tracking-wide mb-3">
          Quick Actions
        </h3>
        <div className="space-y-2">
          <button
            onClick={() => navigate('/learn')}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-ice transition-colors duration-200 min-h-[48px]"
          >
            <BookOpen className="w-5 h-5 text-primary shrink-0" />
            <div className="text-left">
              <p className="font-display font-medium text-sm">Browse Vocabulary</p>
              <p className="text-xs text-text-secondary">Explore words by category</p>
            </div>
          </button>
          <button
            onClick={() => navigate('/practice')}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-ice transition-colors duration-200 min-h-[48px]"
          >
            <Target className="w-5 h-5 text-primary shrink-0" />
            <div className="text-left">
              <p className="font-display font-medium text-sm">Free Practice</p>
              <p className="text-xs text-text-secondary">Practice any category</p>
            </div>
          </button>
        </div>
      </div>

      {/* Finnish word of the day */}
      {wordOfDay && (
        <div className="card text-center">
          <p className="text-xs text-text-secondary uppercase tracking-wide font-display mb-2">
            Word of the day
          </p>
          <p className="font-serif text-2xl text-primary">{wordOfDay.finnish}</p>
          <p className="text-text-secondary mt-1">{wordOfDay.english}</p>
        </div>
      )}
    </div>
  );
}

export default HomePage;
