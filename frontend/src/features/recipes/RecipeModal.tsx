import { useEffect } from 'react';
import type { Recipe } from './recipes';
import { resolveImage } from '../../shared/assets';

export function RecipeModal({ recipe, onClose }: { recipe: Recipe; onClose: () => void }) {
  // Lock page scroll while the modal is open, and let Escape close it like the backdrop click does.
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

  const stats = [[recipe.nutrition.calories, 'kcal', 'Calories'], [recipe.nutrition.protein, 'g', 'Protein'], [recipe.nutrition.carbs, 'g', 'Carbs'], [recipe.nutrition.fats, 'g', 'Fat']] as const;

  return <div className="fixed inset-0 bg-[rgba(6,6,5,.82)] backdrop-blur-sm flex items-center justify-center p-8 max-[560px]:p-3 z-100 animate-[recipe-modal-fade_180ms_ease]" onClick={onClose}>
    <div className="bg-surface border border-line rounded-3xl max-w-260 w-full max-h-[88vh] grid grid-cols-2 max-[800px]:grid-cols-1 max-[800px]:max-h-[92vh] max-[800px]:overflow-y-auto overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,.5)]" role="dialog" aria-modal="true" aria-label={recipe.title} onClick={(event) => event.stopPropagation()}>
      <div className="bg-[linear-gradient(135deg,var(--color-ph1),var(--color-ph2))] min-h-full max-[800px]:aspect-video">
        <img src={resolveImage(recipe.image)} alt={recipe.title} onError={(event) => { event.currentTarget.style.display = 'none'; }} className="w-full h-full object-cover block" />
      </div>
      <div className="relative p-10 overflow-y-auto">
        <button type="button" onClick={onClose} aria-label="Close" className="absolute top-5 right-5 w-9.5 h-9.5 rounded-full bg-surface-alt border border-line-strong text-ink text-xl leading-none grid place-items-center p-0 hover:bg-hover">×</button>
        <div className="mb-2.5 text-accent text-xs font-bold uppercase tracking-wider">
          {recipe.tags.map((tag, index) => <span key={tag}>{tag}{index < recipe.tags.length - 1 ? ' · ' : ''}</span>)}
        </div>
        <h2 className="font-display font-semibold text-[32px] mt-0 mb-3.5">{recipe.title}</h2>
        <p className="text-ink-soft leading-[1.55] mb-6.5">{recipe.description}</p>
        <div className="grid grid-cols-4 max-[800px]:grid-cols-2 gap-2.5 mb-7.5">
          {stats.map(([value, unit, label]) => <div key={label} className="border border-line-strong bg-surface-alt py-3.5 px-2.5 text-center">
            <span className="block text-[11px] text-ink-muted mb-1.5">{label}</span>
            <strong className="font-display font-semibold text-[22px] text-accent">{value}<small className="text-[11px] text-ink-muted font-normal ml-0.5">{unit}</small></strong>
          </div>)}
        </div>
        <div className="grid grid-cols-2 max-[800px]:grid-cols-1 gap-8.5">
          <div>
            <h3 className="text-lg mt-0 mb-3">Ingredients</h3>
            <ul className="m-0 pl-5 text-ink-soft leading-[1.65]">{recipe.ingredients.map((item) => <li key={item} className="mb-1.75">{item}</li>)}</ul>
          </div>
          <div>
            <h3 className="text-lg mt-0 mb-3">Preparation</h3>
            <ol className="m-0 pl-5 text-ink-soft leading-[1.65]">{recipe.steps.map((step) => <li key={step} className="mb-1.75">{step}</li>)}</ol>
          </div>
        </div>
      </div>
    </div>
  </div>;
}
