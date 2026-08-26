import { useState } from 'react';
import { createRootRoute, createRoute, createRouter, Link, Outlet } from '@tanstack/react-router';
import { Show, SignInButton, SignUpButton, useClerk, useUser } from '@clerk/react';
import { HomePage } from '../features/home/HomePage';
import { MealPlannerPage } from '../features/meal-plan/MealPlannerPage';
import { ProgressPage } from '../features/progress/ProgressPage';
import { RecipeDetailsPage } from '../features/recipes/RecipeDetailsPage';
import { RecipesPage } from '../features/recipes/RecipesPage';
import { AccountPage } from '../features/account/AccountPage';
import { FloatingAssistant } from '../features/meal-plan/FloatingAssistant';
import { isClerkConfigured } from '../shared/clerk';
import { SiteFooter } from '../shared/components/SiteFooter';
import { ErrorBoundary } from '../shared/components/ErrorBoundary';

const navLinkClass = 'rounded-lg px-3.5 py-2 text-ink-soft no-underline text-sm font-medium hover:bg-hover hover:text-ink';
const navLinkActiveClass = 'bg-badge! text-accent! font-semibold';

// Only ever mounted inside <Show when="signed-in">, so a real user is always loaded by the time
// this renders — that's what makes calling useUser()/useClerk() here safe with no extra guards.
function AccountStatus() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const name = user?.firstName || user?.username || user?.primaryEmailAddress?.emailAddress || 'Account';

  return <div className="flex items-center gap-2.5 max-[900px]:hidden">
    {user?.imageUrl && <img src={user.imageUrl} alt="" className="h-8.5 w-8.5 rounded-full border border-line-strong object-cover" />}
    <div className="grid leading-tight">
      <span className="flex items-center gap-1.5 text-[13px] font-semibold text-ink whitespace-nowrap">
        <span className="w-1.75 h-1.75 rounded-full bg-good shrink-0" aria-hidden="true" title="Online" />
        {name}
      </span>
      <span className="text-[11px] text-ink-muted">Online</span>
    </div>
    <Link to="/account" className="rounded-lg px-3 py-2 text-accent text-[13px] font-semibold no-underline hover:bg-badge">Account</Link>
    <button type="button" onClick={() => signOut({ redirectUrl: '/' })} className="rounded-lg bg-transparent border border-line-strong px-3 py-2 text-ink-soft text-[13px] hover:bg-hover hover:border-line-strong hover:text-ink whitespace-nowrap">Log out</button>
  </div>;
}

function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // The boundary wraps only the routed page content, not the header/nav/footer — so a crash on
  // one page still leaves navigation usable to get somewhere else.
  return <>
    <header className="sticky top-0 z-50 h-20 px-[max(4vw,32px)] max-[720px]:px-5 flex items-center gap-7.5 max-[720px]:gap-3 border-b border-line bg-page/95 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,.12)]">
      <Link to="/" className="font-display font-bold text-[25px] text-ink no-underline whitespace-nowrap">
        <span className="font-sans text-xl inline-grid place-items-center w-9 h-9 rounded-xl bg-accent text-on-accent mr-2.5 shadow-[0_5px_18px_rgba(0,0,0,.18)]">♡</span>
        Fit<span className="text-accent">Meal</span>
      </Link>
      <nav className="flex items-center gap-1 flex-1 max-[720px]:hidden">
        <Link to="/" className={navLinkClass} activeProps={{ className: navLinkActiveClass }}>Home</Link>
        <Link to="/recipes" className={navLinkClass} activeProps={{ className: navLinkActiveClass }}>Recipes</Link>
        <Link to="/planner" className={navLinkClass} activeProps={{ className: navLinkActiveClass }}>Meal planner</Link>
        <Link to="/progress" className={navLinkClass} activeProps={{ className: navLinkActiveClass }}>Progress</Link>
      </nav>
      {isClerkConfigured && <div className="flex items-center gap-2.5 max-[720px]:ml-auto">
        <Show when="signed-out">
          <SignInButton><button className="rounded-lg bg-transparent border border-line-strong px-4 py-2.5 text-sm text-ink hover:bg-hover hover:border-line-strong max-[480px]:hidden">Log in</button></SignInButton>
          <SignUpButton><button className="rounded-lg px-4 py-2.5 text-sm max-[900px]:hidden">Sign up</button></SignUpButton>
        </Show>
        <Show when="signed-in"><AccountStatus /></Show>
      </div>}
      <button
        type="button"
        aria-label="Toggle navigation"
        aria-controls="mobile-navigation"
        aria-expanded={isMobileMenuOpen}
        onClick={() => setIsMobileMenuOpen((current) => !current)}
        className="hidden max-[720px]:grid place-items-center w-10 h-10 rounded-xl p-0 ml-auto border border-line-strong bg-surface text-ink text-xl hover:bg-hover hover:border-line-strong"
      >
        {isMobileMenuOpen ? '×' : '☰'}
      </button>
    </header>
    {isMobileMenuOpen && <nav id="mobile-navigation" className="sticky top-20 z-40 hidden max-[720px]:grid gap-1 border-b border-line bg-surface/98 px-5 py-3 shadow-xl animate-[mobile-menu-enter_180ms_ease-out]">
      <Link to="/" className="rounded-lg px-4 py-3 text-ink-soft no-underline" activeProps={{ className: navLinkActiveClass }} onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
      <Link to="/recipes" className="rounded-lg px-4 py-3 text-ink-soft no-underline" activeProps={{ className: navLinkActiveClass }} onClick={() => setIsMobileMenuOpen(false)}>Recipes</Link>
      <Link to="/planner" className="rounded-lg px-4 py-3 text-ink-soft no-underline" activeProps={{ className: navLinkActiveClass }} onClick={() => setIsMobileMenuOpen(false)}>Meal planner</Link>
      <Link to="/progress" className="rounded-lg px-4 py-3 text-ink-soft no-underline" activeProps={{ className: navLinkActiveClass }} onClick={() => setIsMobileMenuOpen(false)}>Progress</Link>
      {isClerkConfigured && <Link to="/account" className="rounded-lg px-4 py-3 text-ink-soft no-underline" activeProps={{ className: navLinkActiveClass }} onClick={() => setIsMobileMenuOpen(false)}>Account</Link>}
    </nav>}
    <main className="max-w-320 mx-auto pt-16 max-[720px]:pt-10 px-[max(4vw,32px)] max-[720px]:px-5 pb-0 overflow-x-clip">
      <ErrorBoundary><Outlet /></ErrorBoundary>
      <SiteFooter />
    </main>
    {isClerkConfigured && <Show when="signed-in"><FloatingAssistant /></Show>}
  </>;
}

const rootRoute = createRootRoute({ component: Layout });
const homeRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: HomePage });
const recipesRoute = createRoute({ getParentRoute: () => rootRoute, path: '/recipes', component: RecipesPage });
const recipeDetailsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/recipes/$recipeSlug', component: RecipeDetailsPage });
const plannerRoute = createRoute({ getParentRoute: () => rootRoute, path: '/planner', component: MealPlannerPage });
const progressRoute = createRoute({ getParentRoute: () => rootRoute, path: '/progress', component: ProgressPage });
const accountRoute = createRoute({ getParentRoute: () => rootRoute, path: '/account', component: AccountPage });
export const router = createRouter({ routeTree: rootRoute.addChildren([homeRoute, recipesRoute, recipeDetailsRoute, plannerRoute, progressRoute, accountRoute]) });
declare module '@tanstack/react-router' { interface Register { router: typeof router } }
