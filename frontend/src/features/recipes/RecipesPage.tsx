import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import type { Goal } from '../../shared/types';
import { categoryLabels, goalLabels, recipes, type RecipeCategory } from './recipes';
import { BoltIcon, ClockIcon, FlameIcon } from './icons';
import './recipes.css';

const goalFilters: Array<Goal | 'all'> = ['all', 'lose', 'maintain', 'gain'];
const categoryFilters: Array<RecipeCategory | 'all'> = ['all', 'meal', 'fruit', 'snack', 'dessert', 'smoothie'];

export function RecipesPage() {
  const [selectedGoal, setSelectedGoal] = useState<Goal | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<RecipeCategory | 'all'>('all');
  const visibleRecipes = recipes.filter((recipe) => (selectedGoal === 'all' || recipe.goal === selectedGoal) && (selectedCategory === 'all' || recipe.category === selectedCategory));

  return <>
    <section className="page-intro recipes-intro">
      <span className="eyebrow">Recipe collection</span>
      <h1>Meals that fit your goal.</h1>
      <p>Choose a goal to explore balanced meal ideas. Nutrition values are estimates per serving, not medical advice.</p>
    </section>
    <div className="recipe-filters" aria-label="Recipe category filters">
      {categoryFilters.map((category) => <button key={category} className={selectedCategory === category ? 'is-selected' : ''} onClick={() => setSelectedCategory(category)}>{category === 'all' ? 'All types' : categoryLabels[category]}</button>)}
    </div>
    <div className="recipe-filters" aria-label="Recipe goal filters">
      {goalFilters.map((goal) => <button key={goal} className={selectedGoal === goal ? 'is-selected' : ''} onClick={() => setSelectedGoal(goal)}>{goal === 'all' ? 'All goals' : goalLabels[goal]}</button>)}
    </div>
    {visibleRecipes.length === 0
      ? <p className="recipe-empty">No recipes match that combination yet — try a different goal or type.</p>
      : <section className="recipe-grid" aria-live="polite">
        {visibleRecipes.map((recipe) => <article className="recipe-card" key={recipe.slug}>
          <div className="recipe-photo">
            <img src={recipe.image} alt={recipe.title} loading="lazy" onError={(event) => { event.currentTarget.style.display = 'none'; }} />
          </div>
          <span className="recipe-goal">For {goalLabels[recipe.goal]}</span>
          <h2>{recipe.title}</h2>
          <div className="recipe-tags">{recipe.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
          <div className="recipe-stats">
            <span><ClockIcon /> {recipe.prepMinutes} min</span>
            <span><FlameIcon /> {recipe.nutrition.calories} kcal</span>
            <span><BoltIcon /> {recipe.nutrition.protein}g protein</span>
          </div>
          <Link className="recipe-link" to="/recipes/$recipeSlug" params={{ recipeSlug: recipe.slug }}>Click for ingredients, preparation and nutrition →</Link>
        </article>)}
      </section>}
  </>;
}
