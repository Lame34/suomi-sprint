import { useState, useCallback, useMemo, useRef } from 'react';
import {
  Minus,
  Plus,
  Target,
  Shuffle,
  Type,
  AlignLeft,
  Trash2,
  Download,
  Upload,
  Info,
  ChevronDown,
} from 'lucide-react';
import type { ExerciseType, ProgressRecord } from '../types';
import { useSettings } from '../hooks/useSettings';
import { db } from '../lib/db';
import {
  getDataStats,
  vocabCategories,
  phraseCategories,
  getVocabByCategory,
  getPhrasesByCategory,
} from '../data/index';

const exerciseTypeOptions: { id: ExerciseType; label: string; icon: typeof Target }[] = [
  { id: 'mcq', label: 'Multiple Choice', icon: Target },
  { id: 'match-pairs', label: 'Match Pairs', icon: Shuffle },
  { id: 'free-translation', label: 'Free Translation', icon: Type },
  { id: 'fill-blank', label: 'Fill the Blank', icon: AlignLeft },
];

const reviewModeOptions: { value: 'mixed' | 'vocabOnly' | 'phrasesOnly'; label: string }[] = [
  { value: 'mixed', label: 'Mixed' },
  { value: 'vocabOnly', label: 'Vocabulary only' },
  { value: 'phrasesOnly', label: 'Phrases only' },
];

/**
 * Full settings page with session config, review settings, data management, and about.
 * All changes persist to IndexedDB immediately.
 */
export function SettingsPage() {
  const { settings, loading, update } = useSettings();
  const [resetConfirmStep, setResetConfirmStep] = useState(0);
  const [catResetOpen, setCatResetOpen] = useState(false);
  const [catResetTarget, setCatResetTarget] = useState<string | null>(null);
  const [catResetConfirm, setCatResetConfirm] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dataStats = useMemo(() => getDataStats(), []);

  const allCategoryOptions = useMemo(() => {
    const cats: { id: string; label: string; type: 'vocab' | 'phrase' }[] = [];
    for (const vc of vocabCategories) {
      cats.push({ id: vc.id, label: vc.label, type: 'vocab' });
    }
    for (const pc of phraseCategories) {
      cats.push({ id: pc.id, label: pc.label, type: 'phrase' });
    }
    return cats;
  }, []);

  const showStatus = useCallback((msg: string) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(null), 3000);
  }, []);

  /* ── Exercise type toggle ── */
  const toggleType = useCallback(
    (type: ExerciseType) => {
      const current = settings.exerciseTypes;
      if (current.includes(type)) {
        if (current.length <= 1) return; // keep at least 1
        update('exerciseTypes', current.filter((t) => t !== type));
      } else {
        update('exerciseTypes', [...current, type]);
      }
    },
    [settings.exerciseTypes, update],
  );

  /* ── Reset all progress ── */
  const handleResetAll = useCallback(async () => {
    if (resetConfirmStep < 2) {
      setResetConfirmStep((s) => s + 1);
      return;
    }
    await db.progress.clear();
    await db.sessions.clear();
    setResetConfirmStep(0);
    showStatus('All progress has been reset.');
  }, [resetConfirmStep, showStatus]);

  /* ── Reset category progress ── */
  const handleCategoryReset = useCallback(async () => {
    if (!catResetTarget) return;
    const catOpt = allCategoryOptions.find((c) => c.id === catResetTarget);
    if (!catOpt) return;

    const items =
      catOpt.type === 'vocab'
        ? getVocabByCategory(catOpt.id)
        : getPhrasesByCategory(catOpt.id);
    const ids = items.map((i) => i.id);
    await db.progress.bulkDelete(ids);

    setCatResetConfirm(false);
    setCatResetTarget(null);
    setCatResetOpen(false);
    showStatus(`Progress reset for "${catOpt.label}".`);
  }, [catResetTarget, allCategoryOptions, showStatus]);

  /* ── Export ── */
  const handleExport = useCallback(async () => {
    const progress = await db.progress.toArray();
    const sessions = await db.sessions.toArray();
    const data = { version: 1, exportDate: new Date().toISOString(), progress, sessions };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `suomisprint-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showStatus('Progress exported.');
  }, [showStatus]);

  /* ── Import ── */
  const handleImport = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text) as {
          version?: number;
          progress?: ProgressRecord[];
          sessions?: { date: string; mode: string; totalQuestions: number; correctAnswers: number; accuracy: number; durationMs: number; itemCount: number }[];
        };

        if (!data.progress || !Array.isArray(data.progress)) {
          showStatus('Invalid file: no progress data found.');
          return;
        }

        // Restore progress records (convert date strings back to Date objects)
        const progressRecords: ProgressRecord[] = data.progress.map((r) => ({
          ...r,
          nextReview: new Date(r.nextReview),
          lastAttempted: new Date(r.lastAttempted),
        }));
        await db.progress.bulkPut(progressRecords);

        // Restore sessions if present
        if (data.sessions && Array.isArray(data.sessions)) {
          const sessionRecords = data.sessions.map((s) => ({
            ...s,
            date: new Date(s.date),
            mode: s.mode as 'practice' | 'review',
          }));
          // Remove id to let auto-increment handle it
          for (const sr of sessionRecords) {
            await db.sessions.add({
              date: sr.date,
              mode: sr.mode,
              totalQuestions: sr.totalQuestions,
              correctAnswers: sr.correctAnswers,
              accuracy: sr.accuracy,
              durationMs: sr.durationMs,
              itemCount: sr.itemCount,
            });
          }
        }

        showStatus(`Imported ${progressRecords.length} progress records.`);
      } catch {
        showStatus('Import failed: invalid JSON file.');
      }

      // Reset file input so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [showStatus],
  );

  if (loading) {
    return (
      <div className="page-enter space-y-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-primary">Settings</h2>
          <p className="text-text-secondary text-sm mt-1">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter space-y-4">
      <div>
        <h2 className="font-display text-2xl font-bold text-primary">Settings</h2>
        <p className="text-text-secondary text-sm mt-1">Configure your learning experience.</p>
      </div>

      {/* Status message toast */}
      {statusMsg && (
        <div className="bg-success-light border border-success text-success rounded-lg px-4 py-2 text-sm font-display font-medium text-center">
          {statusMsg}
        </div>
      )}

      {/* ═══ Session Settings ═══ */}
      <div className="card space-y-4">
        <h3 className="font-display font-semibold text-xs text-text-secondary uppercase tracking-wide">
          Session Settings
        </h3>

        {/* Questions per session stepper */}
        <div>
          <p className="text-sm font-medium mb-2">Questions per session</p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => update('questionsPerSession', Math.max(5, settings.questionsPerSession - 5))}
              className="w-10 h-10 rounded-full bg-ice border border-frost flex items-center justify-center hover:bg-frost transition-colors duration-200 min-h-[48px] min-w-[48px]"
              aria-label="Decrease questions"
            >
              <Minus className="w-4 h-4 text-primary" />
            </button>
            <span className="font-display text-3xl font-bold text-primary w-12 text-center">
              {settings.questionsPerSession}
            </span>
            <button
              onClick={() => update('questionsPerSession', Math.min(30, settings.questionsPerSession + 5))}
              className="w-10 h-10 rounded-full bg-ice border border-frost flex items-center justify-center hover:bg-frost transition-colors duration-200 min-h-[48px] min-w-[48px]"
              aria-label="Increase questions"
            >
              <Plus className="w-4 h-4 text-primary" />
            </button>
          </div>
          <p className="text-xs text-text-secondary text-center mt-1">Range: 5 to 30</p>
        </div>

        {/* Exercise types */}
        <div>
          <p className="text-sm font-medium mb-2">Exercise types</p>
          <div className="grid grid-cols-2 gap-2">
            {exerciseTypeOptions.map(({ id, label, icon: Icon }) => {
              const isEnabled = settings.exerciseTypes.includes(id);
              return (
                <button
                  key={id}
                  onClick={() => toggleType(id)}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 min-h-[48px] ${
                    isEnabled
                      ? 'border-primary bg-[#e8f0fe]'
                      : 'border-frost bg-white hover:border-primary-light'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isEnabled ? 'text-primary' : 'text-text-secondary'}`} />
                  <span className={`font-display text-xs font-medium ${isEnabled ? 'text-primary' : 'text-text-secondary'}`}>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Show hints toggle */}
        <label className="flex items-center justify-between p-2 rounded-lg hover:bg-ice transition-colors duration-200 cursor-pointer min-h-[44px]">
          <span className="text-sm font-medium">Show hints during exercises</span>
          <input
            type="checkbox"
            checked={settings.showHints}
            onChange={(e) => update('showHints', e.target.checked)}
            className="w-5 h-5 rounded accent-[var(--color-primary)]"
          />
        </label>

        {/* Auto-advance toggle */}
        <label className="flex items-center justify-between p-2 rounded-lg hover:bg-ice transition-colors duration-200 cursor-pointer min-h-[44px]">
          <span className="text-sm font-medium">Auto-advance after correct</span>
          <input
            type="checkbox"
            checked={settings.autoAdvance}
            onChange={(e) => update('autoAdvance', e.target.checked)}
            className="w-5 h-5 rounded accent-[var(--color-primary)]"
          />
        </label>
      </div>

      {/* ═══ Review Settings ═══ */}
      <div className="card space-y-4">
        <h3 className="font-display font-semibold text-xs text-text-secondary uppercase tracking-wide">
          Review Settings
        </h3>

        {/* Review mode radio */}
        <div>
          <p className="text-sm font-medium mb-2">Review mode</p>
          <div className="space-y-1">
            {reviewModeOptions.map(({ value, label }) => (
              <label
                key={value}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-ice transition-colors duration-200 cursor-pointer min-h-[44px]"
              >
                <input
                  type="radio"
                  name="reviewMode"
                  checked={settings.reviewMode === value}
                  onChange={() => update('reviewMode', value)}
                  className="w-5 h-5 accent-[var(--color-primary)]"
                />
                <span className="text-sm">{label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ Data & Progress ═══ */}
      <div className="card space-y-4">
        <h3 className="font-display font-semibold text-xs text-text-secondary uppercase tracking-wide">
          Data & Progress
        </h3>

        {/* Reset all progress */}
        <div>
          <button
            onClick={handleResetAll}
            className={`w-full flex items-center justify-center gap-2 rounded-lg border-2 min-h-[48px] px-4 py-2.5 font-display font-semibold text-sm transition-all duration-200 ${
              resetConfirmStep === 0
                ? 'border-frost bg-white text-error hover:border-error hover:bg-error-light'
                : resetConfirmStep === 1
                  ? 'border-error bg-error-light text-error'
                  : 'border-error bg-error text-white'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            {resetConfirmStep === 0 && 'Reset All Progress'}
            {resetConfirmStep === 1 && 'Are you sure? Tap again to confirm.'}
            {resetConfirmStep === 2 && 'Tap once more — this cannot be undone!'}
          </button>
          {resetConfirmStep > 0 && (
            <button
              onClick={() => setResetConfirmStep(0)}
              className="w-full text-center text-xs text-text-secondary mt-1 py-1"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Reset category progress */}
        <div>
          <button
            onClick={() => {
              setCatResetOpen(!catResetOpen);
              setCatResetConfirm(false);
              setCatResetTarget(null);
            }}
            className="w-full flex items-center justify-between p-3 rounded-lg border border-frost bg-white hover:border-primary-light transition-colors duration-200 min-h-[48px]"
          >
            <span className="text-sm font-medium">Reset category progress</span>
            <ChevronDown className={`w-4 h-4 text-text-secondary transition-transform duration-200 ${catResetOpen ? 'rotate-180' : ''}`} />
          </button>

          {catResetOpen && (
            <div className="mt-2 rounded-lg border border-frost divide-y divide-frost max-h-56 overflow-y-auto">
              {allCategoryOptions.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setCatResetTarget(cat.id);
                    setCatResetConfirm(true);
                  }}
                  className={`w-full text-left px-3 py-2.5 text-sm transition-colors duration-150 min-h-[44px] ${
                    catResetTarget === cat.id ? 'bg-error-light text-error font-semibold' : 'hover:bg-ice'
                  }`}
                >
                  {cat.label}
                  <span className="text-xs text-text-secondary ml-1">
                    ({cat.type})
                  </span>
                </button>
              ))}
            </div>
          )}

          {catResetConfirm && catResetTarget && (
            <div className="mt-2 p-3 rounded-lg border border-error bg-error-light">
              <p className="text-sm text-error font-display font-medium mb-2">
                Reset progress for &ldquo;{allCategoryOptions.find((c) => c.id === catResetTarget)?.label}&rdquo;?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleCategoryReset}
                  className="flex-1 bg-error text-white rounded-lg py-2 text-sm font-display font-semibold min-h-[44px]"
                >
                  Reset
                </button>
                <button
                  onClick={() => {
                    setCatResetConfirm(false);
                    setCatResetTarget(null);
                  }}
                  className="flex-1 bg-white border border-frost rounded-lg py-2 text-sm font-display font-medium min-h-[44px]"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Export */}
        <button
          onClick={handleExport}
          className="w-full flex items-center justify-center gap-2 rounded-lg border border-frost bg-white hover:bg-ice transition-colors duration-200 min-h-[48px] px-4 py-2.5 text-sm font-display font-medium"
        >
          <Download className="w-4 h-4 text-primary" />
          Export progress as JSON
        </button>

        {/* Import */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 rounded-lg border border-frost bg-white hover:bg-ice transition-colors duration-200 min-h-[48px] px-4 py-2.5 text-sm font-display font-medium"
        >
          <Upload className="w-4 h-4 text-primary" />
          Import progress from JSON
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleImport}
          className="hidden"
        />
      </div>

      {/* ═══ About ═══ */}
      <div className="card space-y-3">
        <h3 className="font-display font-semibold text-xs text-text-secondary uppercase tracking-wide">
          About
        </h3>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <Info className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-display font-semibold text-sm">SuomiSprint</p>
            <p className="text-xs text-text-secondary">Learn Finnish — v1.0.0</p>
          </div>
        </div>
        <div className="space-y-1 text-xs text-text-secondary">
          <p>{dataStats.totalVocab} vocabulary words across {dataStats.vocabCategoryCount} categories</p>
          <p>{dataStats.totalPhrases} phrases across {dataStats.phraseCategoryCount} categories</p>
          <p>{dataStats.totalItems} total items</p>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
