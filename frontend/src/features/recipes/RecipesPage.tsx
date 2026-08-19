import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import type { Goal } from '../../shared/types';
import { goalLabels, recipes } from './recipes';
import './recipes.css';

const filters: Array<Goal | 'all'> = ['all', 'lose', 'maintain', 'gain'];

export function RecipesPage() {
  const [selectedGoal, setSelectedGoal] = useState<Goal | 'all'>('all');
  const visibleRecipes = selectedGoal === 'all' ? recipes : recipes.filter((recipe) => recipe.goal === selectedGoal);

  return <>
    <section className="page-intro recipes-intro">
      <span className="eyebrow">Recipe collection</span>
      <h1>Meals that fit your goal.</h1>
      <p>Choose a goal to explore balanced meal ideas. Nutrition values are estimates per serving, not medical advice.</p>
    </section>
    <div className="recipe-filters" aria-label="Recipe goal filters">
      {filters.map((goal) => <button key={goal} className={selectedGoal === goal ? 'is-selected' : ''} onClick={() => setSelectedGoal(goal)}>{goal === 'all' ? 'All meals' : goalLabels[goal]}</button>)}
    </div>
    <section className="recipe-grid" aria-live="polite">
      {visibleRecipes.map((recipe) => <article className="recipe-card" key={recipe.slug}>
        <span className="recipe-goal">For {goalLabels[recipe.goal]}</span>
        <h2>{recipe.title}</h2>
        <p>{recipe.description}</p>
        <div className="recipe-macros"><span>{recipe.nutrition.calories} kcal</span><span>{recipe.nutrition.protein}g protein</span><span>{recipe.nutrition.carbs}g carbs</span></div>
        <Link className="recipe-link" to="/recipes/$recipeSlug" params={{ recipeSlug: recipe.slug }}>View recipe</Link>
      </article>)}
    </section>
  </>;
}
