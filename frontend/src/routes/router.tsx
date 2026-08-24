import { createRootRoute, createRoute, createRouter, Link, Outlet } from '@tanstack/react-router';
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/react';
import { HomePage } from '../features/home/HomePage';
import { MealPlannerPage } from '../features/meal-plan/MealPlannerPage';
import { ProgressPage } from '../features/progress/ProgressPage';
import { RecipeDetailsPage } from '../features/recipes/RecipeDetailsPage';
import { RecipesPage } from '../features/recipes/RecipesPage';
import { AccountPage } from '../features/account/AccountPage';
import { isClerkConfigured } from '../shared/clerk';
import { SiteFooter } from '../shared/components/SiteFooter';
import { ErrorBoundary } from '../shared/components/ErrorBoundary';

const navLinkClass = 'text-ink-soft no-underline text-sm';
const navLinkActiveClass = 'text-accent! font-bold';

function Layout() {
  // The boundary wraps only the routed page content, not the header/nav/footer — so a crash on
  // one page still leaves navigation usable to get somewhere else.
  return <>
    <header className="h-18.75 px-[max(4vw,32px)] max-[720px]:px-5 flex items-center gap-7.5 max-[720px]:gap-3.75 border-b border-line bg-page">
      <Link to="/" className="font-display font-bold text-[25px] text-accent no-underline whitespace-nowrap">
        <span className="font-sans text-2xl inline-grid place-items-center w-7.5 h-7.5 bg-accent text-on-accent mr-2.5">♡</span>
        FitMeal
      </Link>
      <nav className="flex gap-6.5 flex-1 max-[720px]:hidden">
        <Link to="/" className={navLinkClass} activeProps={{ className: navLinkActiveClass }}>Home</Link>
        <Link to="/recipes" className={navLinkClass} activeProps={{ className: navLinkActiveClass }}>Recipes</Link>
        <Link to="/planner" className={navLinkClass} activeProps={{ className: navLinkActiveClass }}>Meal planner</Link>
        <Link to="/progress" className={navLinkClass} activeProps={{ className: navLinkActiveClass }}>Progress</Link>
        {isClerkConfigured && <Show when="signed-in"><Link to="/account" className={navLinkClass} activeProps={{ className: navLinkActiveClass }}>Profile</Link></Show>}
      </nav>
      {isClerkConfigured && <div className="flex items-center gap-5.5 max-[720px]:ml-auto max-[720px]:gap-3">
        <Show when="signed-out">
          <SignInButton><button>Log in</button></SignInButton>
          <SignUpButton><button className="px-5.25 py-3.5">Sign up</button></SignUpButton>
        </Show>
        <Show when="signed-in"><UserButton /></Show>
      </div>}
    </header>
    <main className="max-w-340 mx-auto pt-22.5 max-[720px]:pt-11.25 px-[max(5vw,32px)] max-[720px]:px-5 pb-0">
      <ErrorBoundary><Outlet /></ErrorBoundary>
      <SiteFooter />
    </main>
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
