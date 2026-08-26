import { Link, useParams } from '@tanstack/react-router';
import { goalLabels, recipes } from './recipes';
import { resolveImage } from '../../shared/assets';

export function RecipeDetailsPage() {
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
