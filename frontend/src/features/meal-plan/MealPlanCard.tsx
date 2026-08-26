import { useState, type FormEvent } from 'react';
import { useAuth } from '@clerk/react';
import { api } from '../../shared/api';
import type { MealPlan, MealVerdict } from '../../shared/types';

const verdictClass: Record<MealVerdict, string> = { 'great fit': 'border-good text-good-text', reasonable: 'border-accent text-accent-soft', 'poor fit': 'border-poor text-poor-text' };
const swapToggleClass = 'rounded-lg bg-transparent border border-line-strong px-4 py-2.25 text-accent text-[13px] font-semibold cursor-pointer hover:bg-hover hover:border-line-strong hover:text-accent-hover';

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

  if (plan.isCheatDay) {
    return <section className="rounded-3xl bg-surface-alt border border-line-strong p-9 text-center shadow-[0_18px_50px_rgba(0,0,0,.1)]">
      <span className="text-4xl" aria-hidden="true">🎉</span>
      <h2 className="mt-3 mb-2">It's your cheat day!</h2>
      <p className="text-ink-soft max-w-125 mx-auto leading-normal">Eat what you enjoy today — no fixed menu, no calorie targets to hit. A planned treat is part of a sustainable plan, not a setback. Your regular meal plan is back tomorrow.</p>
    </section>;
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
    <section className="grid grid-cols-4 max-[720px]:grid-cols-2 overflow-hidden rounded-2xl bg-surface-alt text-ink border border-line-strong mb-5 shadow-[0_12px_35px_rgba(0,0,0,.08)]">
      {Object.entries(plan.targets).map(([key, value], index) => <div key={key} className={`p-6.5 border-line-strong max-[720px]:border-b ${index < 3 ? 'border-r' : ''} ${index === 1 ? 'max-[720px]:border-r-0' : ''}`}>
        <strong className="block font-display font-semibold text-[29px] text-accent">{value}{key === 'calories' ? '' : 'g'}</strong>
        <span className="block capitalize text-ink-soft text-[13px]">{key}</span>
      </div>)}
    </section>
    <section className="overflow-hidden rounded-2xl bg-surface border border-line shadow-[0_18px_50px_rgba(0,0,0,.1)]">
      {plan.meals.map((meal) => {
        const detailIngredients = meal.isCustom ? meal.originalIngredientsList : meal.ingredientsList;
        const detailSteps = meal.isCustom ? meal.originalSteps : meal.steps;
        const hasDetails = (detailIngredients && detailIngredients.length > 0) || (detailSteps && detailSteps.length > 0);
        const hasIngredients = Boolean(detailIngredients && detailIngredients.length > 0);

        return <article className="grid grid-cols-[64px_100px_1fr_auto] max-[720px]:grid-cols-1 gap-4 p-6 border-b border-line items-center last:border-b-0" key={meal.time}>
          <div className="w-16 h-16 rounded-xl bg-[linear-gradient(135deg,var(--color-ph1),var(--color-ph2))] overflow-hidden">{(meal.image ?? meal.originalImage) && <img src={meal.image ?? meal.originalImage} alt={meal.title} loading="lazy" onError={(event) => { event.currentTarget.style.display = 'none'; }} className="w-full h-full object-cover block" />}</div>
          <span className="font-mono text-xs text-accent">{meal.time}</span>
          <div>
            <h3 className="cursor-pointer select-none flex items-baseline gap-2" role="button" tabIndex={0} onClick={() => toggleExpanded(meal.time)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') toggleExpanded(meal.time); }}>
              {meal.originalTitle ? <><s className="text-ink-muted decoration-ink-muted">{meal.originalTitle}</s> → {meal.title}</> : meal.title} <span className="text-[11px] text-accent">{expandedTime === meal.time ? '▲' : '▼'}</span>
            </h3>
            <p className="m-0 text-ink-muted">{meal.ingredients}</p>

            {expandedTime === meal.time && <div className="my-2.5 py-3.5 px-4 rounded-xl bg-surface-alt border border-line text-ink-soft text-[13px]">
              {meal.isCustom && hasDetails && <div className="flex items-center gap-2.5 mb-2.5">
                {meal.originalImage && <img src={meal.originalImage} alt={meal.originalTitle} className="w-8.5 h-8.5 object-cover shrink-0" onError={(event) => { event.currentTarget.style.display = 'none'; }} />}
                <p className="m-0 italic text-ink-muted">{meal.time}: {meal.originalTitle}</p>
              </div>}
              {hasIngredients && <>
                <h4 className="mt-0 mb-1.5 text-[13px] text-accent uppercase tracking-[.03em]">Ingredients</h4>
                <ul className="m-0 pl-5 leading-[1.6]">{detailIngredients!.map((item) => <li key={item} className="mb-1">{item}</li>)}</ul>
              </>}
              {detailSteps && detailSteps.length > 0 && <>
                <h4 className={`${hasIngredients ? 'mt-3.5' : 'mt-0'} mb-1.5 text-[13px] text-accent uppercase tracking-[.03em]`}>Preparation</h4>
                <ol className="m-0 pl-5 leading-[1.6]">{detailSteps.map((step) => <li key={step} className="mb-1">{step}</li>)}</ol>
              </>}
              {!hasDetails && <p>No preparation steps available for this one.</p>}
            </div>}

            {meal.verdict && <p className={`mt-2 text-[13px] leading-[1.4] py-2 px-2.5 border-l-[3px] bg-surface-alt ${verdictClass[meal.verdict]}`}><strong>{meal.verdict}:</strong> {meal.note}</p>}

            {!meal.isCustom && meal.confirmed !== true && swappingTime !== meal.time && <div className="flex items-center justify-between flex-wrap gap-2.5 mt-2 pt-2.5 max-[720px]:flex-col max-[720px]:items-start">
              <span className="text-ink-soft text-[13px]">Did you have this, or something else?</span>
              <div className="flex gap-2.5">
                <button type="button" className="px-4 py-2.25 text-[13px]" disabled={confirmingTime === meal.time} onClick={() => handleConfirm(meal.time)}>{confirmingTime === meal.time ? 'Saving…' : 'Same as suggested'}</button>
                <button type="button" className={swapToggleClass} onClick={() => startSwap(meal.time)}>Something else</button>
              </div>
            </div>}

            {!meal.isCustom && meal.confirmed === true && <p className="text-good-text text-[13px] font-semibold mt-2">✓ As planned</p>}

            {swappingTime === meal.time && <form className="flex gap-2 mt-3 max-[560px]:flex-col" onSubmit={(event) => handleSwap(event, meal.time)}>
              <input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="e.g. Grilled cheese sandwich with fries" disabled={isSaving} autoFocus className="flex-1 text-sm p-2.25" />
              <button type="submit" className="px-3.5 py-2.25 text-[13px]" disabled={isSaving}>{isSaving ? 'Saving…' : 'Save'}</button>
              <button type="button" className="px-3.5 py-2.25 text-[13px]" onClick={() => setSwappingTime(null)} disabled={isSaving}>Cancel</button>
            </form>}

            {errorTime === meal.time && <p role="alert">{errorMessage}</p>}
          </div>
          <strong className="text-right max-[720px]:text-left text-sm">{meal.calories} kcal<br /><small className="font-normal text-ink-muted">{meal.protein}g protein</small></strong>
        </article>;
      })}
    </section>
  </>;
}
