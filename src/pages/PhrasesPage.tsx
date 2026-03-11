import { Navigate } from 'react-router-dom';

/**
 * Redirect /phrases to /learn with the phrases tab.
 * All phrase browsing is now unified under the Learn page.
 */
export function PhrasesPage() {
  return <Navigate to="/learn" replace />;
}

export default PhrasesPage;
