import { useEffect, useRef, useState } from 'react';
import { createRootRoute, createRoute, createRouter, Link, Outlet, useRouterState } from '@tanstack/react-router';
import { Show, SignInButton, SignUpButton, useAuth, useClerk, useUser } from '@clerk/react';
import { HomePage } from '../features/home/HomePage';
import { MealPlannerPage } from '../features/meal-plan/MealPlannerPage';
import { ProgressPage } from '../features/progress/ProgressPage';
import { RecipeDetailsPage } from '../features/recipes/RecipeDetailsPage';
import { RecipesPage } from '../features/recipes/RecipesPage';
import { AccountPage } from '../features/account/AccountPage';
import { ReviewsPage } from '../features/reviews/ReviewsPage';
import { FloatingAssistant } from '../features/meal-plan/FloatingAssistant';
import { isClerkConfigured } from '../shared/clerk';
import { SiteFooter } from '../shared/components/SiteFooter';
import { ErrorBoundary } from '../shared/components/ErrorBoundary';
import { NotFoundPage } from '../shared/components/NotFoundPage';
import { MobileAuthMenu } from '../shared/components/MobileAuthMenu';
import { api } from '../shared/api';
import { profileNameChangedEvent } from '../shared/profileEvents';

const navLinkClass = 'rounded-full px-4 py-2 text-ink-soft no-underline text-[13px] font-medium tracking-[.01em] hover:bg-hover hover:text-ink';
const navLinkActiveClass = 'bg-accent! text-on-accent! font-semibold shadow-[0_4px_14px_rgba(0,0,0,.14)]';
const appHomeUrl = import.meta.env.BASE_URL;

// Only ever mounted inside <Show when="signed-in">, so a real user is always loaded by the time
// this renders — that's what makes calling useUser()/useClerk() here safe with no extra guards.
function AccountStatus() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const { signOut } = useClerk();
  const [profileName, setProfileName] = useState('');
  const name = profileName || user?.firstName || user?.username || user?.primaryEmailAddress?.emailAddress || 'Account';

  useEffect(() => {
    async function loadProfileName() {
      try {
        const profile = await api.getProfile(await getToken());
        setProfileName(profile?.name ?? '');
      } catch {
        // The Clerk identity below remains a safe fallback if profile loading is unavailable.
      }
    }

    function handleProfileNameChange(event: Event) {
      if (event instanceof CustomEvent && typeof event.detail === 'string') {
        setProfileName(event.detail);
      }
    }

    void loadProfileName();
    window.addEventListener(profileNameChangedEvent, handleProfileNameChange);
    return () => window.removeEventListener(profileNameChangedEvent, handleProfileNameChange);
  }, [getToken]);

  return <div className="flex items-center gap-2 pl-4 border-l border-line max-[720px]:hidden">
    <Link to="/account" aria-label="Open account" className="group flex items-center gap-2.5 rounded-full py-1.5 pr-3 pl-1.5 text-ink no-underline hover:bg-hover">
      {user?.imageUrl
        ? <img src={user.imageUrl} alt="" className="h-8.5 w-8.5 rounded-full border-2 border-line-strong object-cover group-hover:border-accent" />
        : <span className="grid h-8.5 w-8.5 place-items-center rounded-full bg-accent text-sm font-bold text-on-accent">{name.charAt(0).toUpperCase()}</span>}
      <span className="grid leading-tight max-[1100px]:hidden">
        <span className="text-[12px] text-ink-muted">Welcome back</span>
        <span className="max-w-28 truncate text-[13px] font-semibold text-ink">{name}</span>
      </span>
    </Link>
    <button type="button" aria-label="Log out" title="Log out" onClick={() => signOut({ redirectUrl: appHomeUrl })} className="grid h-9 w-9 place-items-center rounded-full border border-line bg-transparent p-0 text-ink-soft hover:border-line-strong hover:bg-hover hover:text-ink">
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4.5 w-4.5 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 17l5-5-5-5M15 12H3" />
        <path d="M14 3h4a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-4" />
      </svg>
    </button>
  </div>;
}

function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      setIsMobileMenuOpen(false);
      mobileMenuButtonRef.current?.focus();
    }

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isMobileMenuOpen]);

  // The boundary wraps only the routed page content, not the header/nav/footer — so a crash on
  // one page still leaves navigation usable to get somewhere else.
  return <>
    <header className="sticky top-0 z-50 h-18 border-b border-line bg-page/90 px-[max(4vw,32px)] shadow-[0_8px_30px_rgba(0,0,0,.08)] backdrop-blur-xl max-[720px]:px-5">
      <div className="mx-auto flex h-full w-full max-w-360 items-center gap-7.5 max-[720px]:gap-3">
        <Link to="/" aria-label="FitMeal home" className="flex items-center gap-2.5 whitespace-nowrap text-ink no-underline">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-on-accent shadow-[0_5px_16px_rgba(0,0,0,.16)]">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.8 4.6a5.4 5.4 0 0 0-7.7 0L12 5.7l-1.1-1.1a5.4 5.4 0 0 0-7.7 7.7L12 21l8.8-8.7a5.4 5.4 0 0 0 0-7.7Z" />
              <path d="M8.2 12h2.2l1.1-2.3 1.5 4.6 1.1-2.3h2" />
            </svg>
          </span>
          <span className="font-display text-[24px] font-bold tracking-[-.025em]">Fit<span className="text-accent">Meal</span></span>
        </Link>
        <nav aria-label="Primary navigation" className="flex items-center gap-0.5 rounded-full border border-line bg-surface/70 p-1 max-[720px]:hidden">
          <Link to="/" className={navLinkClass} activeProps={{ className: navLinkActiveClass }}>Home</Link>
          <Link to="/recipes" className={navLinkClass} activeProps={{ className: navLinkActiveClass }}>Recipes</Link>
          <Link to="/planner" className={navLinkClass} activeProps={{ className: navLinkActiveClass }}>Meal planner</Link>
          <Link to="/progress" className={navLinkClass} activeProps={{ className: navLinkActiveClass }}>Progress</Link>
          <Link to="/reviews" className={navLinkClass} activeProps={{ className: navLinkActiveClass }}>Reviews</Link>
        </nav>
        {isClerkConfigured && <div className="ml-auto flex items-center gap-2.5">
          <Show when="signed-out">
            <SignInButton><button className="rounded-full border border-line-strong bg-transparent px-4 py-2 text-sm text-ink hover:bg-hover hover:border-line-strong max-[480px]:hidden">Log in</button></SignInButton>
            <SignUpButton><button className="rounded-full px-4 py-2 text-sm max-[900px]:hidden">Create account</button></SignUpButton>
          </Show>
          <Show when="signed-in"><AccountStatus /></Show>
        </div>}
        <button
          ref={mobileMenuButtonRef}
          type="button"
          aria-label={isMobileMenuOpen ? 'Close navigation' : 'Open navigation'}
          aria-controls="mobile-navigation"
          aria-expanded={isMobileMenuOpen}
          onClick={() => setIsMobileMenuOpen((current) => !current)}
          className="hidden h-10 w-10 place-items-center rounded-full border border-line-strong bg-surface p-0 text-xl text-ink hover:border-line-strong hover:bg-hover max-[720px]:ml-auto max-[720px]:grid"
        >
          {isMobileMenuOpen ? '×' : '☰'}
        </button>
      </div>
    </header>
    {isMobileMenuOpen && <nav id="mobile-navigation" aria-label="Mobile navigation" className="sticky top-18 z-40 hidden max-[720px]:grid gap-1 border-b border-line bg-surface/98 px-5 py-3 shadow-xl animate-[mobile-menu-enter_180ms_ease-out]">
      <Link to="/" className="rounded-lg px-4 py-3 text-ink-soft no-underline" activeProps={{ className: navLinkActiveClass }} onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
      <Link to="/recipes" className="rounded-lg px-4 py-3 text-ink-soft no-underline" activeProps={{ className: navLinkActiveClass }} onClick={() => setIsMobileMenuOpen(false)}>Recipes</Link>
      <Link to="/planner" className="rounded-lg px-4 py-3 text-ink-soft no-underline" activeProps={{ className: navLinkActiveClass }} onClick={() => setIsMobileMenuOpen(false)}>Meal planner</Link>
      <Link to="/progress" className="rounded-lg px-4 py-3 text-ink-soft no-underline" activeProps={{ className: navLinkActiveClass }} onClick={() => setIsMobileMenuOpen(false)}>Progress</Link>
      <Link to="/reviews" className="rounded-lg px-4 py-3 text-ink-soft no-underline" activeProps={{ className: navLinkActiveClass }} onClick={() => setIsMobileMenuOpen(false)}>Reviews</Link>
      {isClerkConfigured && <MobileAuthMenu onNavigate={() => setIsMobileMenuOpen(false)} />}
    </nav>}
    <main className="max-w-320 mx-auto pt-16 max-[720px]:pt-10 px-[max(4vw,32px)] max-[720px]:px-5 pb-0 overflow-x-clip">
      <ErrorBoundary key={pathname}><Outlet /></ErrorBoundary>
      <SiteFooter />
    </main>
    {isClerkConfigured && <Show when="signed-in"><FloatingAssistant /></Show>}
  </>;
}

const rootRoute = createRootRoute({ component: Layout, notFoundComponent: NotFoundPage });
const homeRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: HomePage });
const recipesRoute = createRoute({ getParentRoute: () => rootRoute, path: '/recipes', component: RecipesPage });
const recipeDetailsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/recipes/$recipeSlug', component: RecipeDetailsPage });
const plannerRoute = createRoute({ getParentRoute: () => rootRoute, path: '/planner', component: MealPlannerPage });
const progressRoute = createRoute({ getParentRoute: () => rootRoute, path: '/progress', component: ProgressPage });
const accountRoute = createRoute({ getParentRoute: () => rootRoute, path: '/account', component: AccountPage });
const reviewsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/reviews', component: ReviewsPage });
// import.meta.env.BASE_URL mirrors vite.config.ts's `base` — "/" on root hosts and the configured
// subpath on hosts such as GitHub Pages.
export const router = createRouter({
  routeTree: rootRoute.addChildren([homeRoute, recipesRoute, recipeDetailsRoute, plannerRoute, progressRoute, accountRoute, reviewsRoute]),
  basepath: import.meta.env.BASE_URL,
});
declare module '@tanstack/react-router' { interface Register { router: typeof router } }
