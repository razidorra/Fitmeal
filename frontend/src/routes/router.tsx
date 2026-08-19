import { createRootRoute, createRoute, createRouter, Link, Outlet } from '@tanstack/react-router';
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/react';
import { HomePage } from '../features/home/HomePage';
import { MealPlannerPage } from '../features/meal-plan/MealPlannerPage';
import { ProgressPage } from '../features/progress/ProgressPage';
import { RecipeDetailsPage } from '../features/recipes/RecipeDetailsPage';
import { RecipesPage } from '../features/recipes/RecipesPage';

const isClerkConfigured = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

function Layout() {
  return <><header><Link to="/" className="brand"><span className="brand-mark">♡</span>FitMeal</Link><nav><Link to="/" activeProps={{ className: 'active' }}>Home</Link><Link to="/recipes" activeProps={{ className: 'active' }}>Recipes</Link><Link to="/planner" activeProps={{ className: 'active' }}>Meal planner</Link><Link to="/progress" activeProps={{ className: 'active' }}>Progress</Link></nav>{isClerkConfigured && <div className="account-links"><Show when="signed-out"><SignInButton><button className="auth-link">Log in</button></SignInButton><SignUpButton><button className="sign-up">Sign up</button></SignUpButton></Show><Show when="signed-in"><UserButton /></Show></div>}</header><main><Outlet /></main></>;
}

const rootRoute = createRootRoute({ component: Layout });
const homeRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: HomePage });
const recipesRoute = createRoute({ getParentRoute: () => rootRoute, path: '/recipes', component: RecipesPage });
const recipeDetailsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/recipes/$recipeSlug', component: RecipeDetailsPage });
const plannerRoute = createRoute({ getParentRoute: () => rootRoute, path: '/planner', component: MealPlannerPage });
const progressRoute = createRoute({ getParentRoute: () => rootRoute, path: '/progress', component: ProgressPage });
export const router = createRouter({ routeTree: rootRoute.addChildren([homeRoute, recipesRoute, recipeDetailsRoute, plannerRoute, progressRoute]) });
declare module '@tanstack/react-router' { interface Register { router: typeof router } }
