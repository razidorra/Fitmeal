import { useState } from 'react';
import { useAuth } from '@clerk/react';
import type { Goal } from '../../shared/types';
import { categoryLabels, goalLabels, recipes, type Recipe, type RecipeCategory } from './recipes';
import { BoltIcon, ClockIcon, FlameIcon } from './icons';
import { RecipeModal } from './RecipeModal';
import { SignInPromptModal } from './SignInPromptModal';
import { isClerkConfigured } from '../../shared/clerk';

const goalFilters: Array<Goal | 'all'> = ['all', 'lose', 'maintain', 'gain'];
const categoryFilters: Array<RecipeCategory | 'all'> = ['all', 'meal', 'fruit', 'snack', 'dessert', 'smoothie'];

const filterButtonClass = (isSelected: boolean) => `text-sm px-4 py-2.75 ${isSelected ? 'bg-accent text-on-accent border border-accent' : 'bg-surface-alt text-ink border border-line-strong'}`;

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
    <section className="mb-9.5 max-w-190">
      <span className="uppercase tracking-[.04em] font-sans font-semibold text-[13px] text-accent bg-badge px-3 py-1.75 inline-block">Recipe collection</span>
      <h1>Meals that fit your goal.</h1>
      <p className="text-lg leading-[1.45] text-ink-soft max-w-142.5">Choose a goal to explore balanced meal ideas. Nutrition values are estimates per serving, not medical advice.</p>
    </section>
    <div className="flex gap-2.5 flex-wrap mb-3.5" aria-label="Recipe category filters">
      {categoryFilters.map((category) => <button key={category} className={filterButtonClass(selectedCategory === category)} onClick={() => setSelectedCategory(category)}>{category === 'all' ? 'All types' : categoryLabels[category]}</button>)}
    </div>
    <div className="flex gap-2.5 flex-wrap mb-8" aria-label="Recipe goal filters">
      {goalFilters.map((goal) => <button key={goal} className={filterButtonClass(selectedGoal === goal)} onClick={() => setSelectedGoal(goal)}>{goal === 'all' ? 'All goals' : goalLabels[goal]}</button>)}
    </div>
    {visibleRecipes.length === 0
      ? <p className="text-ink-soft py-10">No recipes match that combination yet — try a different goal or type.</p>
      : <section className="grid grid-cols-3 max-[900px]:grid-cols-2 max-[650px]:grid-cols-1 gap-5" aria-live="polite">
        {visibleRecipes.map((recipe) => <article
          className="group border border-line bg-surface p-6.75 flex flex-col items-start cursor-pointer transition-[transform,border-color,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:border-accent hover:shadow-[0_14px_30px_rgba(0,0,0,.35)] focus-visible:-translate-y-1 focus-visible:border-accent focus-visible:shadow-[0_14px_30px_rgba(0,0,0,.35)] focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-[3px] active:-translate-y-px"
          key={recipe.slug}
          role="button"
          tabIndex={0}
          onClick={() => handleOpenRecipe(recipe)}
          onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); handleOpenRecipe(recipe); } }}
        >
          <div className="w-[calc(100%+54px)] -mx-6.75 mb-5 mt-0 aspect-4/3 overflow-hidden bg-[linear-gradient(135deg,var(--color-ph1),var(--color-ph2))] border-b border-line">
            <img src={recipe.image} alt={recipe.title} loading="lazy" onError={(event) => { event.currentTarget.style.display = 'none'; }} className="w-full h-full object-cover block transition-transform duration-350 ease-in-out group-hover:scale-105 group-focus-visible:scale-105" />
          </div>
          <span className="text-accent text-[13px] font-bold">For {goalLabels[recipe.goal]}</span>
          <h2 className="mt-4.5 mb-3 text-[27px]">{recipe.title}</h2>
          <div className="flex flex-wrap gap-2 my-3.5">{recipe.tags.map((tag) => <span key={tag} className="bg-badge text-accent-soft border border-line rounded-[20px] px-3 py-1.25 text-[11px] font-semibold">{tag}</span>)}</div>
          <div className="flex flex-wrap gap-3.5 mt-auto mb-5 text-ink-soft text-[13px]">
            <span className="flex items-center gap-1.25"><ClockIcon className="text-accent" /> {recipe.prepMinutes} min</span>
            <span className="flex items-center gap-1.25"><FlameIcon className="text-accent" /> {recipe.nutrition.calories} kcal</span>
            <span className="flex items-center gap-1.25"><BoltIcon className="text-accent" /> {recipe.nutrition.protein}g protein</span>
          </div>
          <span className="text-accent font-bold no-underline hover:underline">{isSignedIn ? 'Click for ingredients, preparation and nutrition →' : 'Sign in to view ingredients and preparation →'}</span>
        </article>)}
      </section>}
    {openRecipe && <RecipeModal recipe={openRecipe} onClose={() => setOpenRecipe(null)} />}
    {showSignInPrompt && <SignInPromptModal onClose={() => setShowSignInPrompt(false)} />}
  </>;
}
