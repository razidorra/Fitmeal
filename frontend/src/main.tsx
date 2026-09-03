import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { ClerkProvider, useUser } from '@clerk/react';
import { router } from './routes/router';
import { applyTheme, getStoredTheme } from './shared/theme';
import { resolveImage } from './shared/assets';
import { ErrorBoundary } from './shared/components/ErrorBoundary';
import './styles.css';

// Signed-out visitors always start in Midnight Gold. Once Clerk loads, ThemeSync below restores
// the preference belonging to the current account.
applyTheme('dark');

// styles.css can't reach import.meta.env.BASE_URL itself (it's a static asset, not processed as a
// module), so the whole-site background photo's URL is resolved here instead and handed to it
// through a CSS variable — otherwise it 404s under a subpath deployment like GitHub Pages.
document.documentElement.style.setProperty('--bg-photo', `url('${resolveImage('/images/backG.jpg')}')`);

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function ThemeSync() {
  const { isLoaded, user } = useUser();

  useEffect(() => {
    if (!isLoaded) return;
    applyTheme(getStoredTheme(user?.id));
  }, [isLoaded, user?.id]);

  return null;
}

function App() {
  const appContent = <RouterProvider router={router} />;

  return clerkPublishableKey
    ? <ClerkProvider publishableKey={clerkPublishableKey}><ThemeSync />{appContent}</ClerkProvider>
    : appContent;
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
