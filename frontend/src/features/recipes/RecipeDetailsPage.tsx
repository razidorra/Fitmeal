import { Link, useParams } from '@tanstack/react-router';
import { SignInButton, SignUpButton, useAuth } from '@clerk/react';
import { goalLabels, recipes } from './recipes';
import { resolveImage } from '../../shared/assets';
import { isClerkConfigured } from '../../shared/clerk';
import { PageLoading } from '../../shared/components/PageLoading';

export function RecipeDetailsPage() {
  if (!isClerkConfigured) return <RecipeSignInRequired isAuthConfigured={false} />;
  return <AuthenticatedRecipeDetailsPage />;
}

function AuthenticatedRecipeDetailsPage() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return <PageLoading label="Checking recipe access" />;
  if (!isSignedIn) return <RecipeSignInRequired isAuthConfigured />;

  return <RecipeDetails />;
}

function RecipeSignInRequired({ isAuthConfigured }: { isAuthConfigured: boolean }) {
  return <section className="mx-auto max-w-160 rounded-3xl border border-line bg-surface py-16 px-8 text-center shadow-[0_20px_60px_rgba(0,0,0,.12)]">
    <span className="inline-flex rounded-full border border-line bg-badge px-3.5 py-2 text-[11px] font-bold uppercase tracking-[.1em] text-accent">Members only</span>
    <h1 className="text-[clamp(40px,5vw,60px)]">Sign in to view recipe details.</h1>
    <p className="mx-auto mb-7 max-w-125 text-ink-soft">{isAuthConfigured ? 'Create a free account to access ingredients, preparation steps, and complete nutrition information.' : 'Sign-in is not configured on this deployment yet. Add the Clerk publishable key and redeploy the frontend.'}</p>
    {isAuthConfigured
      ? <div className="flex justify-center gap-3 max-[420px]:flex-col"><SignInButton><button>Log in</button></SignInButton><SignUpButton><button>Sign up</button></SignUpButton></div>
      : <Link to="/recipes" className="primary">Back to recipes</Link>}
  </section>;
}

function RecipeDetails() {
  const { recipeSlug } = useParams({ from: '/recipes/$recipeSlug' });
  const recipe = recipes.find((item) => item.slug === recipeSlug);

  if (!recipe) {
    return <section className="text-center py-22.5"><h1 className="text-[54px]">Recipe not found.</h1><Link className="primary" to="/recipes">Back to recipes</Link></section>;
  }

  const nutritionStats = [[recipe.nutrition.calories, 'kcal'], [`${recipe.nutrition.protein}g`, 'protein'], [`${recipe.nutrition.carbs}g`, 'carbs'], [`${recipe.nutrition.fats}g`, 'fats']] as const;

  return <article className="max-w-250">
    <Link className="text-accent font-bold no-underline hover:underline" to="/recipes">← All recipes</Link>
    <div className="w-full mt-7 mb-0 aspect-16/7 border border-line overflow-hidden bg-[linear-gradient(135deg,var(--color-ph1),var(--color-ph2))]">
      <img src={resolveImage(recipe.image)} alt={recipe.title} onError={(event) => { event.currentTarget.style.display = 'none'; }} className="w-full h-full object-cover block" />
    </div>
    <span className="block mt-7 text-accent text-[13px] font-bold">For {goalLabels[recipe.goal]}</span>
    <h1 className="text-[clamp(46px,6vw,78px)]">{recipe.title}</h1>
    <div className="flex flex-wrap gap-2 my-3.5">{recipe.tags.map((tag) => <span key={tag} className="bg-badge text-accent-soft border border-line rounded-[20px] px-3 py-1.25 text-[11px] font-semibold">{tag}</span>)}</div>
    <p className="text-ink-soft text-[19px] leading-[1.55] max-w-180">{recipe.description}</p>
    <div className="flex gap-5 text-ink-soft my-6"><span>{recipe.prepMinutes} min</span><span>{recipe.servings} serving{recipe.servings > 1 ? 's' : ''}</span></div>
    <section className="grid grid-cols-[1.6fr_repeat(4,1fr)] max-[900px]:grid-cols-4 max-[650px]:grid-cols-2 items-center border border-line-strong bg-surface-alt my-9">
      <h2 className="text-[22px] p-5 m-0 max-[900px]:col-span-full max-[900px]:border-b max-[900px]:border-line-strong">Nutrition per serving</h2>
      {nutritionStats.map(([value, label], index) => <div key={label} className={`p-5 border-l border-line-strong ${index === 0 ? 'max-[900px]:first-of-type:border-l-0' : ''} max-[650px]:nth-of-type-[odd]:border-l-0 max-[650px]:nth-of-type-[-n+2]:border-b max-[650px]:nth-of-type-[-n+2]:border-line-strong`}>
        <strong className="block font-display font-semibold text-[26px] text-accent">{value}</strong>
        <span className="block text-[13px] text-ink-soft">{label}</span>
      </div>)}
    </section>
    <p className="py-5 px-5.5 border-l-[3px] border-accent bg-surface-alt text-ink-soft leading-normal"><strong className="text-ink">Why it supports health:</strong> {recipe.healthNote}</p>
    <section className="grid grid-cols-2 max-[650px]:grid-cols-1 gap-12.5 mt-10.5">
      <div><h2 className="text-[28px]">Ingredients</h2><ul className="pl-5.5 text-ink-soft leading-[1.7]">{recipe.ingredients.map((ingredient) => <li key={ingredient} className="pl-1.25 mb-2.25">{ingredient}</li>)}</ul></div>
      <div><h2 className="text-[28px]">Preparation</h2><ol className="pl-5.5 text-ink-soft leading-[1.7]">{recipe.steps.map((step) => <li key={step} className="pl-1.25 mb-2.25">{step}</li>)}</ol></div>
    </section>
  </article>;
}
