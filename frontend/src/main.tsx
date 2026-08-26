import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { ClerkProvider } from '@clerk/react';
import { router } from './routes/router';
import { applyTheme, getStoredTheme } from './shared/theme';
import { resolveImage } from './shared/assets';
import { ErrorBoundary } from './shared/components/ErrorBoundary';
import './styles.css';

// Applied synchronously before the first paint, so there's no flash of the wrong theme on load.
applyTheme(getStoredTheme());

// styles.css can't reach import.meta.env.BASE_URL itself (it's a static asset, not processed as a
// module), so the whole-site background photo's URL is resolved here instead and handed to it
// through a CSS variable — otherwise it 404s under a subpath deployment like GitHub Pages.
document.documentElement.style.setProperty('--bg-photo', `url('${resolveImage('/images/backG.jpg')}')`);

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function ScrollToTopOnLoad() {
  useEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

    return () => {
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  return null;
}

function App() {
  const appContent = <>
    <ScrollToTopOnLoad />
    <RouterProvider router={router} />
  </>;

  return clerkPublishableKey ? <ClerkProvider publishableKey={clerkPublishableKey}>{appContent}</ClerkProvider> : appContent;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* Last-resort net for errors above the router itself (e.g. ClerkProvider setup) — the
        per-page boundary in router.tsx handles everything below it, keeping nav usable there. */}
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
