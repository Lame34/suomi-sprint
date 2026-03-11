import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';

/* Lazy-loaded pages */
const HomePage = lazy(() => import('./pages/HomePage'));
const VocabularyPage = lazy(() => import('./pages/VocabularyPage'));
const PhrasesPage = lazy(() => import('./pages/PhrasesPage'));
const PracticePage = lazy(() => import('./pages/PracticePage'));
const ReviewPage = lazy(() => import('./pages/ReviewPage'));
const StatsPage = lazy(() => import('./pages/StatsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

/* Lazy-loaded list components (they import all category data) */
const WordList = lazy(() =>
  import('./components/vocabulary/WordList').then((m) => ({ default: m.WordList })),
);
const PhraseList = lazy(() =>
  import('./components/vocabulary/PhraseList').then((m) => ({ default: m.PhraseList })),
);

/** Loading spinner shown while lazy pages load */
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="w-8 h-8 border-3 border-frost border-t-primary rounded-full animate-spin" />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<HomePage />} />
            <Route path="learn" element={<VocabularyPage />} />
            <Route path="learn/vocab/:categoryId" element={<WordList />} />
            <Route path="learn/phrases/:categoryId" element={<PhraseList />} />
            <Route path="phrases" element={<PhrasesPage />} />
            <Route path="practice" element={<PracticePage />} />
            <Route path="review" element={<ReviewPage />} />
            <Route path="stats" element={<StatsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
