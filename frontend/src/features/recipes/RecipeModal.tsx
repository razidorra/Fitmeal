import { useEffect } from 'react';
import type { Recipe } from './recipes';

export function RecipeModal({ recipe, onClose }: { recipe: Recipe; onClose: () => void }) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return <div className="recipe-modal-backdrop" onClick={onClose}>
    <div className="recipe-modal" role="dialog" aria-modal="true" aria-label={recipe.title} onClick={(event) => event.stopPropagation()}>
      <div className="recipe-modal-photo">
        <img src={recipe.image} alt={recipe.title} onError={(event) => { event.currentTarget.style.display = 'none'; }} />
      </div>
      <div className="recipe-modal-body">
        <button type="button" className="recipe-modal-close" onClick={onClose} aria-label="Close">×</button>
        <div className="recipe-modal-tags">{recipe.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
        <h2>{recipe.title}</h2>
        <p className="recipe-modal-description">{recipe.description}</p>
        <div className="recipe-modal-stats">
          <div><span>Calories</span><strong>{recipe.nutrition.calories}<small>kcal</small></strong></div>
          <div><span>Protein</span><strong>{recipe.nutrition.protein}<small>g</small></strong></div>
          <div><span>Carbs</span><strong>{recipe.nutrition.carbs}<small>g</small></strong></div>
          <div><span>Fat</span><strong>{recipe.nutrition.fats}<small>g</small></strong></div>
        </div>
        <div className="recipe-modal-content">
          <div>
            <h3>Ingredients</h3>
            <ul>{recipe.ingredients.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
          <div>
            <h3>Preparation</h3>
            <ol>{recipe.steps.map((step) => <li key={step}>{step}</li>)}</ol>
          </div>
        </div>
      </div>
    </div>
  </div>;
}
