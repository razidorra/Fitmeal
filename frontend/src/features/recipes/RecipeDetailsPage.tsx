import { Link, useParams } from '@tanstack/react-router';
import { goalLabels, recipes } from './recipes';
import './recipes.css';

export function RecipeDetailsPage() {
  const { recipeSlug } = useParams({ from: '/recipes/$recipeSlug' });
  const recipe = recipes.find((item) => item.slug === recipeSlug);

  if (!recipe) {
    return <section className="empty"><h1>Recipe not found.</h1><Link className="primary" to="/recipes">Back to recipes</Link></section>;
  }

  return <article className="recipe-details">
    <Link className="back-link" to="/recipes">← All recipes</Link>
    <span className="recipe-goal">For {goalLabels[recipe.goal]}</span>
    <h1>{recipe.title}</h1>
    <p className="recipe-description">{recipe.description}</p>
    <div className="recipe-summary"><span>{recipe.prepMinutes} min</span><span>{recipe.servings} serving{recipe.servings > 1 ? 's' : ''}</span></div>
    <section className="nutrition-panel"><h2>Nutrition per serving</h2><div><strong>{recipe.nutrition.calories}</strong><span>kcal</span></div><div><strong>{recipe.nutrition.protein}g</strong><span>protein</span></div><div><strong>{recipe.nutrition.carbs}g</strong><span>carbs</span></div><div><strong>{recipe.nutrition.fats}g</strong><span>fats</span></div></section>
    <p className="health-note"><strong>Why it supports health:</strong> {recipe.healthNote}</p>
    <section className="recipe-content"><div><h2>Ingredients</h2><ul>{recipe.ingredients.map((ingredient) => <li key={ingredient}>{ingredient}</li>)}</ul></div><div><h2>Preparation</h2><ol>{recipe.steps.map((step) => <li key={step}>{step}</li>)}</ol></div></section>
  </article>;
}
