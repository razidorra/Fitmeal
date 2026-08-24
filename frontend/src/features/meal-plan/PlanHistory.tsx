import { useState } from 'react';
import type { MealPlan } from '../../shared/types';
import { formatDisplayDate, getLocalDateString, getWeekStart } from '../../shared/date';

function sum(plan: MealPlan, key: 'calories' | 'protein') {
  return plan.meals.reduce((total, meal) => total + meal[key], 0);
}

const verdictBadgeClass: Record<'good' | 'ok' | 'poor', string> = { good: 'border-good text-good-text', ok: 'border-accent text-accent-soft', poor: 'border-poor text-poor-text' };

// Summarizes the day from each meal's own confirm-or-swap answer, rather than a separate whole-day check.
function summarizeDay(plan: MealPlan) {
  if (plan.isCheatDay) return { label: 'Cheat day 🎉', tone: 'good' as const };

  const total = plan.meals.length;
  const changedCount = plan.meals.filter((meal) => meal.isCustom).length;
  const answeredCount = plan.meals.filter((meal) => meal.confirmed === true || meal.isCustom).length;

  if (answeredCount === 0) return { label: 'Not logged', tone: 'ok' as const };
  if (changedCount === 0) return { label: 'All as planned', tone: 'good' as const };
  const tone: 'poor' | 'ok' = changedCount > total / 2 ? 'poor' : 'ok';
  return { label: `${changedCount}/${total} changed`, tone };
}

function DayRow({ plan, isExpanded, onToggle }: { plan: MealPlan; isExpanded: boolean; onToggle: () => void }) {
  const summary = summarizeDay(plan);

  return <div className="bg-surface border border-line mb-2">
    <button type="button" className="grid grid-cols-[1.2fr_auto_auto_auto] max-[720px]:grid-cols-2 gap-4 max-[720px]:gap-y-1.5 w-full py-3.5 px-4.5 bg-transparent border-0 text-ink text-left cursor-pointer items-center font-sans text-sm hover:bg-input" onClick={onToggle}>
      <span className="font-semibold">{formatDisplayDate(plan.date)}</span>
      <span className={`text-xs py-1 px-2.5 border justify-self-start rounded-[20px] ${verdictBadgeClass[summary.tone]}`}>{summary.label}</span>
      <span>{plan.isCheatDay ? '—' : `${sum(plan, 'calories')} kcal`}</span>
      <span>{plan.isCheatDay ? '—' : `${sum(plan, 'protein')}g protein`}</span>
    </button>
    {isExpanded && <div className="mx-4.5 px-4.5 pb-4 pt-3 border-t border-line text-ink-soft text-[13px] grid gap-2.5">
      {plan.isCheatDay
        ? <p className="m-0">Eat what you enjoy today — no fixed menu, no calorie targets.</p>
        : plan.meals.map((meal) => <div className="flex items-center gap-2.5" key={meal.time}>
          {(meal.image ?? meal.originalImage) && <img src={meal.image ?? meal.originalImage} alt={meal.title} className="w-8.5 h-8.5 object-cover shrink-0" onError={(event) => { event.currentTarget.style.display = 'none'; }} />}
          <span><strong>{meal.time}:</strong> {meal.originalTitle ? <><s className="text-ink-muted decoration-ink-muted">{meal.originalTitle}</s> → {meal.title}</> : meal.title}</span>
        </div>)}
    </div>}
  </div>;
}

export function PlanHistory({ history }: { history: MealPlan[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  if (history.length === 0) return null;

  const thisWeekStart = getWeekStart(getLocalDateString());
  const thisWeek = history.filter((plan) => plan.date >= thisWeekStart);
  const previousWeek = history.filter((plan) => plan.date < thisWeekStart);

  return <section className="mt-9">
    <h2>Your week</h2>
    {thisWeek.length > 0 && <div className="mt-4.5">
      <h3 className="text-[15px] text-accent mt-0 mb-2.5 font-semibold">This week</h3>
      {thisWeek.map((plan) => <DayRow key={plan._id} plan={plan} isExpanded={expandedId === plan._id} onToggle={() => setExpandedId(expandedId === plan._id ? null : plan._id)} />)}
    </div>}
    {previousWeek.length > 0 && <div className="mt-4.5">
      <h3 className="text-[15px] text-accent mt-0 mb-2.5 font-semibold">Previous week</h3>
      {previousWeek.map((plan) => <DayRow key={plan._id} plan={plan} isExpanded={expandedId === plan._id} onToggle={() => setExpandedId(expandedId === plan._id ? null : plan._id)} />)}
    </div>}
  </section>;
}
