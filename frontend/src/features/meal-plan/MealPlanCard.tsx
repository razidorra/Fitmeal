import { useState, type FormEvent } from 'react';
import { api } from '../../shared/api';
import type { MealPlan, MealVerdict } from '../../shared/types';

const verdictClass: Record<MealVerdict, string> = { 'great fit': 'verdict-good', reasonable: 'verdict-ok', 'poor fit': 'verdict-poor' };

export function MealPlanCard({ plan, onPlanChange }: { plan: MealPlan; onPlanChange: (plan: MealPlan) => void }) {
  const [editingTime, setEditingTime] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  function startEditing(time: string) {
    setEditingTime(time);
    setDescription('');
    setErrorMessage('');
  }

  async function handleSwap(event: FormEvent, time: string) {
    event.preventDefault();
    if (!description.trim() || isChecking) return;

    setIsChecking(true);
    setErrorMessage('');

    try {
      onPlanChange(await api.customizeMeal(plan._id, time, description.trim()));
      setEditingTime(null);
      setDescription('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not check that meal.');
    } finally {
      setIsChecking(false);
    }
  }

  return <>
    <section className="targets">
      {Object.entries(plan.targets).map(([key, value]) => <div key={key}><strong>{value}{key === 'calories' ? '' : 'g'}</strong><span>{key}</span></div>)}
    </section>
    <section className="meal-list">
      {plan.meals.map((meal) => <article className="meal" key={meal.time}>
        <div className="meal-photo">{meal.image && <img src={meal.image} alt={meal.title} loading="lazy" onError={(event) => { event.currentTarget.style.display = 'none'; }} />}</div>
        <span>{meal.time}</span>
        <div>
          <h3>{meal.title}</h3>
          <p>{meal.ingredients}</p>
          {meal.verdict && <p className={`meal-verdict ${verdictClass[meal.verdict]}`}><strong>{meal.verdict}:</strong> {meal.note}</p>}
          {editingTime === meal.time
            ? <form className="meal-swap-form" onSubmit={(event) => handleSwap(event, meal.time)}>
              <input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="e.g. Grilled cheese sandwich with fries" disabled={isChecking} autoFocus />
              <button type="submit" disabled={isChecking}>{isChecking ? 'Checking…' : 'Check it'}</button>
              <button type="button" onClick={() => setEditingTime(null)} disabled={isChecking}>Cancel</button>
            </form>
            : <button type="button" className="meal-swap-toggle" onClick={() => startEditing(meal.time)}>Choose your own meal</button>}
          {editingTime === meal.time && errorMessage && <p role="alert">{errorMessage}</p>}
        </div>
        <strong>{meal.calories} kcal<br /><small>{meal.protein}g protein</small></strong>
      </article>)}
    </section>
  </>;
}
