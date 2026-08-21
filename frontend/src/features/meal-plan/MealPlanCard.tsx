import { useState, type FormEvent } from 'react';
import { useAuth } from '@clerk/react';
import { api } from '../../shared/api';
import type { MealPlan, MealVerdict } from '../../shared/types';

const verdictClass: Record<MealVerdict, string> = { 'great fit': 'verdict-good', reasonable: 'verdict-ok', 'poor fit': 'verdict-poor' };

export function MealPlanCard({ plan, onPlanChange }: { plan: MealPlan; onPlanChange: (plan: MealPlan) => void }) {
  const { getToken } = useAuth();
  const [expandedTime, setExpandedTime] = useState<string | null>(null);
  const [swappingTime, setSwappingTime] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [confirmingTime, setConfirmingTime] = useState<string | null>(null);
  const [errorTime, setErrorTime] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  function toggleExpanded(time: string) {
    setExpandedTime(expandedTime === time ? null : time);
  }

  async function handleConfirm(time: string) {
    setConfirmingTime(time);
    setErrorTime(null);

    try {
      onPlanChange(await api.confirmMeal(await getToken(), plan._id, time));
    } catch (error) {
      setErrorTime(time);
      setErrorMessage(error instanceof Error ? error.message : 'Could not save that.');
    } finally {
      setConfirmingTime(null);
    }
  }

  function startSwap(time: string) {
    setSwappingTime(time);
    setDescription('');
    setErrorTime(null);
  }

  async function handleSwap(event: FormEvent, time: string) {
    event.preventDefault();
    if (!description.trim() || isSaving) return;

    setIsSaving(true);
    setErrorTime(null);

    try {
      onPlanChange(await api.customizeMeal(await getToken(), plan._id, time, description.trim()));
      setSwappingTime(null);
      setDescription('');
    } catch (error) {
      setErrorTime(time);
      setErrorMessage(error instanceof Error ? error.message : 'Could not save that.');
    } finally {
      setIsSaving(false);
    }
  }

  return <>
    <section className="targets">
      {Object.entries(plan.targets).map(([key, value]) => <div key={key}><strong>{value}{key === 'calories' ? '' : 'g'}</strong><span>{key}</span></div>)}
    </section>
    <section className="meal-list">
      {plan.meals.map((meal) => <article className="meal" key={meal.time}>
        <div className="meal-photo">{(meal.image ?? meal.originalImage) && <img src={meal.image ?? meal.originalImage} alt={meal.title} loading="lazy" onError={(event) => { event.currentTarget.style.display = 'none'; }} />}</div>
        <span>{meal.time}</span>
        <div>
          <h3 className="meal-title-toggle" role="button" tabIndex={0} onClick={() => toggleExpanded(meal.time)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') toggleExpanded(meal.time); }}>
            {meal.originalTitle ? <><s>{meal.originalTitle}</s> → {meal.title}</> : meal.title} <span className="meal-expand-icon">{expandedTime === meal.time ? '▲' : '▼'}</span>
          </h3>
          <p>{meal.ingredients}</p>

          {expandedTime === meal.time && (() => {
            // A swapped meal has no recipe of its own — fall back to the originally suggested
            // meal's ingredients/steps, so "how should it be prepared" still has an answer.
            const detailIngredients = meal.isCustom ? meal.originalIngredientsList : meal.ingredientsList;
            const detailSteps = meal.isCustom ? meal.originalSteps : meal.steps;
            const hasDetails = (detailIngredients && detailIngredients.length > 0) || (detailSteps && detailSteps.length > 0);

            return <div className="meal-details">
              {meal.isCustom && hasDetails && <div className="meal-original-suggestion">
                {meal.originalImage && <img src={meal.originalImage} alt={meal.originalTitle} className="meal-original-photo" onError={(event) => { event.currentTarget.style.display = 'none'; }} />}
                <p className="meal-details-original-label">{meal.time}: {meal.originalTitle}</p>
              </div>}
              {detailIngredients && detailIngredients.length > 0 && <>
                <h4>Ingredients</h4>
                <ul>{detailIngredients.map((item) => <li key={item}>{item}</li>)}</ul>
              </>}
              {detailSteps && detailSteps.length > 0 && <>
                <h4>Preparation</h4>
                <ol>{detailSteps.map((step) => <li key={step}>{step}</li>)}</ol>
              </>}
              {!hasDetails && <p>No preparation steps available for this one.</p>}
            </div>;
          })()}

          {meal.verdict && <p className={`meal-verdict ${verdictClass[meal.verdict]}`}><strong>{meal.verdict}:</strong> {meal.note}</p>}

          {!meal.isCustom && meal.confirmed !== true && swappingTime !== meal.time && <div className="meal-confirm">
            <span>Did you have this, or something else?</span>
            <div className="meal-confirm-actions">
              <button type="button" disabled={confirmingTime === meal.time} onClick={() => handleConfirm(meal.time)}>{confirmingTime === meal.time ? 'Saving…' : 'Same as suggested'}</button>
              <button type="button" className="meal-swap-toggle" onClick={() => startSwap(meal.time)}>Something else</button>
            </div>
          </div>}

          {!meal.isCustom && meal.confirmed === true && <p className="meal-confirmed">✓ As planned</p>}

          {swappingTime === meal.time && <form className="meal-swap-form" onSubmit={(event) => handleSwap(event, meal.time)}>
            <input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="e.g. Grilled cheese sandwich with fries" disabled={isSaving} autoFocus />
            <button type="submit" disabled={isSaving}>{isSaving ? 'Saving…' : 'Save'}</button>
            <button type="button" onClick={() => setSwappingTime(null)} disabled={isSaving}>Cancel</button>
          </form>}

          {errorTime === meal.time && <p role="alert">{errorMessage}</p>}
        </div>
        <strong>{meal.calories} kcal<br /><small>{meal.protein}g protein</small></strong>
      </article>)}
    </section>
  </>;
}
