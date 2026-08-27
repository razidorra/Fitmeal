import { useState } from 'react';
import { useAuth } from '@clerk/react';
import type { Goal } from '../../shared/types';
import { categoryLabels, goalLabels, recipes, type Recipe, type RecipeCategory } from './recipes';
import { BoltIcon, ClockIcon, FlameIcon } from './icons';
import { RecipeModal } from './RecipeModal';
import { SignInPromptModal } from './SignInPromptModal';
import { isClerkConfigured } from '../../shared/clerk';
import { resolveImage } from '../../shared/assets';
import { Reveal } from '../../shared/components/Reveal';

const goalFilters: Array<Goal | 'all'> = ['all', 'lose', 'maintain', 'gain'];
const categoryFilters: Array<RecipeCategory | 'all'> = ['all', 'meal', 'fruit', 'snack', 'dessert', 'smoothie'];
type RecipeSort = 'recommended' | 'quickest' | 'protein' | 'calories';

const featuredRecipe = recipes.find((recipe) => recipe.slug === 'grilled-chicken-quinoa-bowl') ?? recipes[0];
const averagePrepMinutes = Math.round(recipes.reduce((total, recipe) => total + recipe.prepMinutes, 0) / recipes.length);

const filterButtonClass = (isSelected: boolean) => `rounded-full text-sm px-4 py-2.5 ${isSelected ? 'bg-accent text-on-accent border border-accent shadow-[0_6px_18px_rgba(0,0,0,.14)]' : 'bg-surface text-ink-soft border border-line-strong hover:bg-hover hover:text-ink hover:border-line-strong'}`;

// `useAuth()` only works inside <ClerkProvider>, which main.tsx only renders when Clerk is
// configured. Without Clerk, cards remain visible but details stay closed and explain that the
// deployment still needs auth configuration.
export function RecipesPage() {
  if (!isClerkConfigured) return <RecipesGrid isSignedIn={false} isAuthConfigured={false} />;
  return <RecipesWithAuth />;
}

function RecipesWithAuth() {
  const { isSignedIn } = useAuth();
  return <RecipesGrid isSignedIn={Boolean(isSignedIn)} isAuthConfigured />;
}

function RecipesGrid({ isSignedIn, isAuthConfigured }: { isSignedIn: boolean; isAuthConfigured: boolean }) {
  const [selectedGoal, setSelectedGoal] = useState<Goal | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<RecipeCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState<RecipeSort>('recommended');
  const [openRecipe, setOpenRecipe] = useState<Recipe | null>(null);
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const visibleRecipes = recipes
    .filter((recipe) => {
      const matchesGoal = selectedGoal === 'all' || recipe.goal === selectedGoal;
      const matchesCategory = selectedCategory === 'all' || recipe.category === selectedCategory;
      const searchableText = [recipe.title, recipe.description, ...recipe.tags, ...recipe.ingredients].join(' ').toLowerCase();
      return matchesGoal && matchesCategory && (!normalizedQuery || searchableText.includes(normalizedQuery));
    })
    .sort((first, second) => {
      if (sort === 'quickest') return first.prepMinutes - second.prepMinutes;
      if (sort === 'protein') return second.nutrition.protein - first.nutrition.protein;
      if (sort === 'calories') return first.nutrition.calories - second.nutrition.calories;
      return 0;
    });
  const hasActiveFilters = selectedGoal !== 'all' || selectedCategory !== 'all' || Boolean(normalizedQuery);

  function handleOpenRecipe(recipe: Recipe) {
    if (isSignedIn) setOpenRecipe(recipe);
    else setShowSignInPrompt(true);
  }

  function handleClearFilters() {
    setSelectedGoal('all');
    setSelectedCategory('all');
    setSearchQuery('');
  }

  return <>
    <section className="mb-10 grid grid-cols-[1.3fr_.7fr] items-end gap-12 max-[850px]:grid-cols-1 max-[850px]:gap-6">
      <div>
        <span className="inline-flex rounded-full border border-line bg-badge px-3.5 py-2 font-sans text-[12px] font-semibold uppercase tracking-[.1em] text-accent">Recipe collection</span>
        <h1 className="max-w-190 text-balance">Meals that fit your goal.</h1>
        <p className="mb-0 max-w-170 text-lg leading-[1.65] text-ink-soft">Explore practical, nutrition-aware recipes for real routines. Search by ingredient or style, then filter the collection around your goal.</p>
      </div>
      <div className="grid grid-cols-3 rounded-2xl border border-line bg-surface/85 p-5 shadow-[0_12px_35px_rgba(0,0,0,.08)]">
        <div className="border-r border-line pr-4"><strong className="block font-display text-[27px] text-accent">{recipes.length}</strong><span className="text-[11px] uppercase tracking-wider text-ink-muted">Recipes</span></div>
        <div className="border-r border-line px-4"><strong className="block font-display text-[27px] text-accent">{categoryFilters.length - 1}</strong><span className="text-[11px] uppercase tracking-wider text-ink-muted">Types</span></div>
        <div className="pl-4"><strong className="block font-display text-[27px] text-accent">{averagePrepMinutes}</strong><span className="text-[11px] uppercase tracking-wider text-ink-muted">Avg. min</span></div>
      </div>
    </section>
    <section className="mb-9 rounded-2xl border border-line bg-surface/90 p-5.5 shadow-[0_12px_35px_rgba(0,0,0,.08)]" aria-label="Recipe filters">
      <div className="mb-5 grid grid-cols-[1fr_220px] gap-3 border-b border-line pb-5 max-[650px]:grid-cols-1">
        <label className="relative">
          <span className="sr-only">Search recipes</span>
          <svg aria-hidden="true" viewBox="0 0 24 24" className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 fill-none stroke-ink-muted" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" />
          </svg>
          <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search recipes, tags, or ingredients" className="pl-11" />
        </label>
        <label>
          <span className="sr-only">Sort recipes</span>
          <select value={sort} onChange={(event) => setSort(event.target.value as RecipeSort)}>
            <option value="recommended">Recommended</option>
            <option value="quickest">Quickest first</option>
            <option value="protein">Highest protein</option>
            <option value="calories">Lowest calories</option>
          </select>
        </label>
      </div>
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
    {!hasActiveFilters && <Reveal className="mb-9">
      <article
        role="button"
        tabIndex={0}
        onClick={() => handleOpenRecipe(featuredRecipe)}
        onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); handleOpenRecipe(featuredRecipe); } }}
        className="group grid cursor-pointer grid-cols-[1.05fr_.95fr] overflow-hidden rounded-3xl border border-line bg-surface shadow-[0_18px_50px_rgba(0,0,0,.12)] transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-[0_26px_60px_rgba(0,0,0,.2)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent max-[760px]:grid-cols-1"
      >
        <div className="relative min-h-80 overflow-hidden bg-[linear-gradient(135deg,var(--color-ph1),var(--color-ph2))] max-[760px]:min-h-60">
          <img src={resolveImage(featuredRecipe.image)} alt={featuredRecipe.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <span className="absolute left-5 top-5 rounded-full border border-line bg-page/90 px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider text-accent backdrop-blur-md">Featured recipe</span>
        </div>
        <div className="flex flex-col justify-center p-9 max-[560px]:p-6">
          <span className="mb-2 text-xs font-bold uppercase tracking-[.12em] text-accent">Editor’s choice · {categoryLabels[featuredRecipe.category]}</span>
          <h2 className="mb-3 mt-0 text-[clamp(30px,3vw,42px)]">{featuredRecipe.title}</h2>
          <p className="mb-5 mt-0 leading-[1.65] text-ink-soft">{featuredRecipe.description}</p>
          <div className="mb-6 grid grid-cols-4 gap-2 max-[440px]:grid-cols-2">
            {[[`${featuredRecipe.prepMinutes} min`, 'Time'], [`${featuredRecipe.nutrition.calories}`, 'kcal'], [`${featuredRecipe.nutrition.protein}g`, 'Protein'], [`${featuredRecipe.servings}`, 'Serving']].map(([value, label]) => <div key={label} className="rounded-xl border border-line bg-surface-alt p-3">
              <strong className="block text-sm text-ink">{value}</strong><span className="text-[10px] uppercase tracking-wider text-ink-muted">{label}</span>
            </div>)}
          </div>
          <span className="font-bold text-accent group-hover:underline">{isSignedIn ? 'Open featured recipe →' : 'Sign in to view recipe →'}</span>
        </div>
      </article>
    </Reveal>}
    <div className="mb-5 flex items-end justify-between gap-4">
      <div><span className="text-[11px] font-bold uppercase tracking-[.1em] text-accent">Browse collection</span><h2 className="mb-0 mt-1 text-[28px]">{visibleRecipes.length} recipe{visibleRecipes.length === 1 ? '' : 's'} found</h2></div>
      {hasActiveFilters && <button type="button" onClick={handleClearFilters} className="rounded-full border border-line-strong bg-transparent px-4 py-2 text-sm text-ink-soft hover:bg-hover hover:text-ink">Clear filters</button>}
    </div>
    {visibleRecipes.length === 0
      ? <div className="rounded-2xl border border-line bg-surface py-14 px-6 text-center"><h2 className="mt-0 text-[28px]">No matching recipes yet.</h2><p className="text-ink-soft">Try a broader search or reset the filters to see the full collection.</p><button type="button" onClick={handleClearFilters}>Show all recipes</button></div>
      : <section className="grid grid-cols-3 max-[900px]:grid-cols-2 max-[650px]:grid-cols-1 gap-5" aria-live="polite">
        {visibleRecipes.map((recipe, index) => <Reveal key={recipe.slug} delay={(index % 3) * 100} className="h-full">
          <article
            className="group h-full overflow-hidden rounded-2xl border border-line bg-surface flex flex-col cursor-pointer shadow-[0_12px_35px_rgba(0,0,0,.1)] transition-[transform,border-color,box-shadow] duration-250 ease-out hover:-translate-y-1.5 hover:border-accent hover:shadow-[0_22px_45px_rgba(0,0,0,.22)] focus-visible:-translate-y-1.5 focus-visible:border-accent focus-visible:shadow-[0_22px_45px_rgba(0,0,0,.22)] focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-[3px] active:-translate-y-px"
            role="button"
            tabIndex={0}
            onClick={() => handleOpenRecipe(recipe)}
            onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); handleOpenRecipe(recipe); } }}
          >
            <div className="relative aspect-4/3 overflow-hidden bg-[linear-gradient(135deg,var(--color-ph1),var(--color-ph2))] border-b border-line">
              <img src={resolveImage(recipe.image)} alt={recipe.title} loading="lazy" onError={(event) => { event.currentTarget.style.display = 'none'; }} className="w-full h-full object-cover block transition-transform duration-500 ease-out group-hover:scale-105 group-focus-visible:scale-105" />
              <span className="absolute top-4 left-4 rounded-full border border-line bg-page/90 px-3 py-1.5 text-[11px] font-bold text-ink backdrop-blur-md">{categoryLabels[recipe.category]}</span>
              <span className="absolute top-4 right-4 rounded-full border border-line bg-page/90 px-3 py-1.5 text-[11px] font-bold text-accent backdrop-blur-md">{goalLabels[recipe.goal]}</span>
            </div>
            <div className="flex flex-1 flex-col items-start p-6">
              <h2 className="mt-0 mb-2 text-[25px]">{recipe.title}</h2>
              <p className="mt-0 mb-4 line-clamp-2 text-sm leading-[1.55] text-ink-muted">{recipe.description}</p>
              <div className="flex flex-wrap gap-2 mb-5">{recipe.tags.map((tag) => <span key={tag} className="bg-badge text-accent-soft border border-line rounded-full px-3 py-1.25 text-[11px] font-semibold">{tag}</span>)}</div>
              <div className="flex flex-wrap gap-3.5 mt-auto mb-5 text-ink-soft text-[13px]">
                <span className="flex items-center gap-1.25"><ClockIcon className="text-accent" /> {recipe.prepMinutes} min</span>
                <span>{recipe.servings} serving{recipe.servings === 1 ? '' : 's'}</span>
                <span className="flex items-center gap-1.25"><FlameIcon className="text-accent" /> {recipe.nutrition.calories} kcal</span>
                <span className="flex items-center gap-1.25"><BoltIcon className="text-accent" /> {recipe.nutrition.protein}g protein</span>
              </div>
              <span className="text-accent text-sm font-bold no-underline group-hover:underline">{isSignedIn ? 'View recipe details →' : 'Sign in to view the full recipe →'}</span>
            </div>
          </article>
        </Reveal>)}
      </section>}
    {openRecipe && <RecipeModal recipe={openRecipe} onClose={() => setOpenRecipe(null)} />}
    {showSignInPrompt && <SignInPromptModal isAuthConfigured={isAuthConfigured} onClose={() => setShowSignInPrompt(false)} />}
  </>;
}
