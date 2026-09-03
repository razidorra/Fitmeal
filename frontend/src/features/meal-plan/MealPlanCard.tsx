import { useState, type FormEvent } from 'react';
import { useAuth } from '@clerk/react';
import { api } from '../../shared/api';
import { resolveImage } from '../../shared/assets';
import type { MealPlan, MealVerdict } from '../../shared/types';

const verdictClass: Record<MealVerdict, string> = { 'great fit': 'border-good text-good-text', reasonable: 'border-accent text-accent-soft', 'poor fit': 'border-poor text-poor-text' };
const swapToggleClass = 'rounded-lg bg-transparent border border-line-strong px-4 py-2.25 text-accent text-[13px] font-semibold cursor-pointer hover:bg-hover hover:border-line-strong hover:text-accent-hover';
const targetLabels: Record<keyof MealPlan['targets'], { label: string; detail: string }> = {
  calories: { label: 'Calories', detail: 'Daily energy' },
  protein: { label: 'Protein', detail: 'Recovery & strength' },
  carbs: { label: 'Carbohydrates', detail: 'Daily fuel' },
  fats: { label: 'Fats', detail: 'Hormones & balance' },
};

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
      <h2 className="mt-3 mb-2">It's your flex day!</h2>
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
    <section className="mb-5 overflow-hidden rounded-2xl border border-line bg-surface-alt shadow-[0_12px_35px_rgba(0,0,0,.08)]">
      <div className="flex items-center justify-between border-b border-line px-6.5 py-4.5 max-[520px]:items-start max-[520px]:flex-col max-[520px]:gap-1">
        <div><span className="text-[10px] font-bold uppercase tracking-[.12em] text-accent">Nutrition overview</span><h2 className="mb-0 mt-1 text-[24px]">Your daily targets</h2></div>
        <span className="text-xs text-ink-muted">Estimated for your profile</span>
      </div>
      <div className="grid grid-cols-4 max-[720px]:grid-cols-2">
        {(Object.entries(plan.targets) as Array<[keyof MealPlan['targets'], number]>).map(([key, value], index) => <div key={key} className={`border-line p-6.5 max-[720px]:border-b ${index < 3 ? 'border-r' : ''} ${index === 1 ? 'max-[720px]:border-r-0' : ''}`}>
          <span className="mb-2 block text-[10px] font-bold uppercase tracking-[.1em] text-ink-muted">{targetLabels[key].label}</span>
          <strong className="block font-display text-[30px] font-semibold leading-none text-accent">{value}<small className="ml-1 font-sans text-[11px] font-normal text-ink-muted">{key === 'calories' ? 'kcal' : 'g'}</small></strong>
          <span className="mt-2 block text-[11px] text-ink-soft">{targetLabels[key].detail}</span>
        </div>)}
      </div>
    </section>
    <section className="overflow-hidden rounded-2xl bg-surface border border-line shadow-[0_18px_50px_rgba(0,0,0,.1)]">
      <div className="flex items-end justify-between border-b border-line px-6.5 py-5 max-[520px]:items-start max-[520px]:flex-col max-[520px]:gap-1">
        <div><span className="text-[10px] font-bold uppercase tracking-[.12em] text-accent">Meal schedule</span><h2 className="mb-0 mt-1 text-[26px]">Today's menu</h2></div>
        <span className="max-w-85 text-right text-xs leading-[1.45] text-ink-muted max-[520px]:text-left">Ingredient quantities are meal ideas. Calories and protein are target budgets—adjust portions to suit them.</span>
      </div>
      {plan.meals.map((meal) => {
        const detailIngredients = meal.isCustom ? meal.originalIngredientsList : meal.ingredientsList;
        const detailSteps = meal.isCustom ? meal.originalSteps : meal.steps;
        const hasDetails = (detailIngredients && detailIngredients.length > 0) || (detailSteps && detailSteps.length > 0);
        const hasIngredients = Boolean(detailIngredients && detailIngredients.length > 0);

        return <article className="grid grid-cols-[120px_1fr_auto] items-start gap-5 border-b border-line p-6 last:border-b-0 max-[720px]:grid-cols-[100px_1fr] max-[520px]:grid-cols-1" key={meal.time}>
          <div className="relative h-27.5 w-30 overflow-hidden rounded-xl bg-[linear-gradient(135deg,var(--color-ph1),var(--color-ph2))] max-[720px]:h-25 max-[720px]:w-25 max-[520px]:h-45 max-[520px]:w-full">
            {(meal.image ?? meal.originalImage) && <img src={resolveImage(meal.image ?? meal.originalImage!)} alt={meal.title} loading="lazy" onError={(event) => { event.currentTarget.style.display = 'none'; }} className="block h-full w-full object-cover" />}
            <span className="absolute bottom-2 left-2 rounded-full border border-line bg-page/90 px-2.5 py-1 font-mono text-[10px] text-accent backdrop-blur-md">{meal.time}</span>
          </div>
          <div>
            <div className="flex items-start justify-between gap-4 max-[520px]:flex-col max-[520px]:gap-2">
              <div><span className="text-[10px] font-bold uppercase tracking-[.1em] text-accent">{meal.isCustom ? 'Custom meal' : 'Suggested meal'}</span><h3 className="mt-1 text-[20px]">{meal.originalTitle ? <><s className="text-ink-muted decoration-ink-muted">{meal.originalTitle}</s> → {meal.title}</> : meal.title}</h3></div>
              <button type="button" aria-expanded={expandedTime === meal.time} onClick={() => toggleExpanded(meal.time)} className="shrink-0 rounded-full border border-line-strong bg-transparent px-3.5 py-1.75 text-[11px] text-ink-soft hover:bg-hover hover:text-ink">{expandedTime === meal.time ? 'Hide details ↑' : 'View details ↓'}</button>
            </div>
            <p className="mt-1 mb-0 text-sm leading-[1.55] text-ink-muted">{meal.ingredients}</p>

            {expandedTime === meal.time && <div className="my-2.5 py-3.5 px-4 rounded-xl bg-surface-alt border border-line text-ink-soft text-[13px]">
              {meal.isCustom && hasDetails && <div className="flex items-center gap-2.5 mb-2.5">
                {meal.originalImage && <img src={resolveImage(meal.originalImage)} alt={meal.originalTitle} className="w-8.5 h-8.5 object-cover shrink-0" onError={(event) => { event.currentTarget.style.display = 'none'; }} />}
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
              <label htmlFor={`replacement-${meal.time}`} className="sr-only">What did you have instead of {meal.title}?</label>
              <input id={`replacement-${meal.time}`} maxLength={300} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="e.g. Grilled cheese sandwich with fries" disabled={isSaving} autoFocus className="flex-1 text-sm p-2.25" />
              <button type="submit" className="px-3.5 py-2.25 text-[13px]" disabled={isSaving}>{isSaving ? 'Saving…' : 'Save'}</button>
              <button type="button" className="px-3.5 py-2.25 text-[13px]" onClick={() => setSwappingTime(null)} disabled={isSaving}>Cancel</button>
            </form>}

            {errorTime === meal.time && <p role="alert">{errorMessage}</p>}
          </div>
          <div className="grid min-w-25 gap-2 text-right max-[720px]:col-start-2 max-[720px]:text-left max-[520px]:col-start-auto max-[520px]:grid-cols-2">
            <div className="rounded-xl border border-line bg-surface-alt px-3.5 py-2.5"><strong className="block text-sm text-ink">{meal.calories}</strong><span className="text-[10px] uppercase tracking-wider text-ink-muted">kcal budget</span></div>
            <div className="rounded-xl border border-line bg-surface-alt px-3.5 py-2.5"><strong className="block text-sm text-ink">{meal.protein}g</strong><span className="text-[10px] uppercase tracking-wider text-ink-muted">protein budget</span></div>
          </div>
        </article>;
      })}
    </section>
  </>;
}
