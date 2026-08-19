import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { ClerkProvider } from '@clerk/react';
import { router } from './routes/router';
import './styles.css';

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
    <App />
  </React.StrictMode>,
);
