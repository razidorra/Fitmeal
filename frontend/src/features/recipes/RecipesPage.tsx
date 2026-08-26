import { useState } from 'react';
import { useAuth } from '@clerk/react';
import type { Goal } from '../../shared/types';
import { categoryLabels, goalLabels, recipes, type Recipe, type RecipeCategory } from './recipes';
import { BoltIcon, ClockIcon, FlameIcon } from './icons';
import { RecipeModal } from './RecipeModal';
import { SignInPromptModal } from './SignInPromptModal';
import { isClerkConfigured } from '../../shared/clerk';
import { resolveImage } from '../../shared/assets';

const goalFilters: Array<Goal | 'all'> = ['all', 'lose', 'maintain', 'gain'];
const categoryFilters: Array<RecipeCategory | 'all'> = ['all', 'meal', 'fruit', 'snack', 'dessert', 'smoothie'];

const filterButtonClass = (isSelected: boolean) => `rounded-full text-sm px-4 py-2.5 ${isSelected ? 'bg-accent text-on-accent border border-accent shadow-[0_6px_18px_rgba(0,0,0,.14)]' : 'bg-surface text-ink-soft border border-line-strong hover:bg-hover hover:text-ink hover:border-line-strong'}`;

// `useAuth()` only works inside <ClerkProvider>, which main.tsx only renders when Clerk is
// configured. Without Clerk there's no way to gate anything, so recipes just stay fully open —
// same wrapper pattern used by MealPlannerPage/ProgressPage/AccountPage.
export function RecipesPage() {
  if (!isClerkConfigured) return <RecipesGrid isSignedIn />;
  return <RecipesWithAuth />;
}

function RecipesWithAuth() {
  const { isSignedIn } = useAuth();
  return <RecipesGrid isSignedIn={Boolean(isSignedIn)} />;
}

function RecipesGrid({ isSignedIn }: { isSignedIn: boolean }) {
  const [selectedGoal, setSelectedGoal] = useState<Goal | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<RecipeCategory | 'all'>('all');
  const [openRecipe, setOpenRecipe] = useState<Recipe | null>(null);
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  const visibleRecipes = recipes.filter((recipe) => (selectedGoal === 'all' || recipe.goal === selectedGoal) && (selectedCategory === 'all' || recipe.category === selectedCategory));

  function handleOpenRecipe(recipe: Recipe) {
    if (isSignedIn) setOpenRecipe(recipe);
    else setShowSignInPrompt(true);
  }

  return <>
    <section className="mb-10 max-w-190">
      <span className="inline-flex rounded-full border border-line bg-badge px-3.5 py-2 font-sans text-[12px] font-semibold uppercase tracking-[.1em] text-accent">Recipe collection</span>
      <h1 className="text-balance">Meals that fit your goal.</h1>
      <p className="max-w-155 text-lg leading-[1.65] text-ink-soft">Explore practical recipes by goal and meal type. Every card includes estimated nutrition per serving, ingredients, and clear preparation steps.</p>
    </section>
    <section className="mb-9 rounded-2xl border border-line bg-surface/90 p-5.5 shadow-[0_12px_35px_rgba(0,0,0,.08)]" aria-label="Recipe filters">
      <div className="mb-4 flex items-center gap-4 max-[620px]:items-start max-[620px]:flex-col">
        <span className="w-18 shrink-0 text-[11px] font-bold uppercase tracking-[.1em] text-ink-muted">Type</span>
        <div className="flex gap-2 flex-wrap" aria-label="Recipe category filters">
          {categoryFilters.map((category) => <button key={category} type="button" aria-pressed={selectedCategory === category} className={filterButtonClass(selectedCategory === category)} onClick={() => setSelectedCategory(category)}>{category === 'all' ? 'All types' : categoryLabels[category]}</button>)}
        </div>
      </div>
      <div className="flex items-center gap-4 max-[620px]:items-start max-[620px]:flex-col">
        <span className="w-18 shrink-0 text-[11px] font-bold uppercase tracking-[.1em] text-ink-muted">Goal</span>
        <div className="flex gap-2 flex-wrap" aria-label="Recipe goal filters">
          {goalFilters.map((goal) => <button key={goal} type="button" aria-pressed={selectedGoal === goal} className={filterButtonClass(selectedGoal === goal)} onClick={() => setSelectedGoal(goal)}>{goal === 'all' ? 'All goals' : goalLabels[goal]}</button>)}
        </div>
      </div>
    </section>
    {visibleRecipes.length === 0
      ? <p className="text-ink-soft py-10">No recipes match that combination yet — try a different goal or type.</p>
      : <section className="grid grid-cols-3 max-[900px]:grid-cols-2 max-[650px]:grid-cols-1 gap-5" aria-live="polite">
        {visibleRecipes.map((recipe) => <article
          className="group overflow-hidden rounded-2xl border border-line bg-surface flex flex-col cursor-pointer shadow-[0_12px_35px_rgba(0,0,0,.1)] transition-[transform,border-color,box-shadow] duration-250 ease-out hover:-translate-y-1.5 hover:border-accent hover:shadow-[0_22px_45px_rgba(0,0,0,.22)] focus-visible:-translate-y-1.5 focus-visible:border-accent focus-visible:shadow-[0_22px_45px_rgba(0,0,0,.22)] focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-[3px] active:-translate-y-px"
          key={recipe.slug}
          role="button"
          tabIndex={0}
          onClick={() => handleOpenRecipe(recipe)}
          onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); handleOpenRecipe(recipe); } }}
        >
          <div className="relative aspect-4/3 overflow-hidden bg-[linear-gradient(135deg,var(--color-ph1),var(--color-ph2))] border-b border-line">
            <img src={resolveImage(recipe.image)} alt={recipe.title} loading="lazy" onError={(event) => { event.currentTarget.style.display = 'none'; }} className="w-full h-full object-cover block transition-transform duration-500 ease-out group-hover:scale-105 group-focus-visible:scale-105" />
            <span className="absolute top-4 left-4 rounded-full border border-line bg-page/90 px-3 py-1.5 text-[11px] font-bold text-accent backdrop-blur-md">For {goalLabels[recipe.goal]}</span>
          </div>
          <div className="flex flex-1 flex-col items-start p-6">
            <h2 className="mt-0 mb-2 text-[25px]">{recipe.title}</h2>
            <p className="mt-0 mb-4 line-clamp-2 text-sm leading-[1.55] text-ink-muted">{recipe.description}</p>
            <div className="flex flex-wrap gap-2 mb-5">{recipe.tags.map((tag) => <span key={tag} className="bg-badge text-accent-soft border border-line rounded-full px-3 py-1.25 text-[11px] font-semibold">{tag}</span>)}</div>
            <div className="flex flex-wrap gap-3.5 mt-auto mb-5 text-ink-soft text-[13px]">
              <span className="flex items-center gap-1.25"><ClockIcon className="text-accent" /> {recipe.prepMinutes} min</span>
              <span className="flex items-center gap-1.25"><FlameIcon className="text-accent" /> {recipe.nutrition.calories} kcal</span>
              <span className="flex items-center gap-1.25"><BoltIcon className="text-accent" /> {recipe.nutrition.protein}g protein</span>
            </div>
            <span className="text-accent text-sm font-bold no-underline group-hover:underline">{isSignedIn ? 'View recipe details →' : 'Sign in to view the full recipe →'}</span>
          </div>
        </article>)}
      </section>}
    {openRecipe && <RecipeModal recipe={openRecipe} onClose={() => setOpenRecipe(null)} />}
    {showSignInPrompt && <SignInPromptModal onClose={() => setShowSignInPrompt(false)} />}
  </>;
}
