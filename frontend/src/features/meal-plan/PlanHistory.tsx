import { useState } from 'react';
import type { MealPlan } from '../../shared/types';
import { formatDisplayDate, getLocalDateString, getWeekStart } from '../../shared/date';
import { resolveImage } from '../../shared/assets';

function sum(plan: MealPlan, key: 'calories' | 'protein') {
  return plan.meals.reduce((total, meal) => total + meal[key], 0);
}

const verdictBadgeClass: Record<'good' | 'ok' | 'poor', string> = { good: 'border-good text-good-text', ok: 'border-accent text-accent-soft', poor: 'border-poor text-poor-text' };

// Summarizes the day from each meal's own confirm-or-swap answer, rather than a separate whole-day check.
function summarizeDay(plan: MealPlan) {
  if (plan.isCheatDay) return { label: 'Flex day 🎉', tone: 'good' as const };

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

  return <div className="mb-2 overflow-hidden rounded-xl border border-line bg-surface">
    <button type="button" aria-expanded={isExpanded} className="grid w-full grid-cols-[1.2fr_auto_auto_auto_24px] items-center gap-4 rounded-none border-0 bg-transparent py-4 px-4.5 text-left font-sans text-sm text-ink hover:translate-y-0 hover:bg-input max-[720px]:grid-cols-2 max-[720px]:gap-y-2" onClick={onToggle}>
      <span><strong className="block font-semibold">{formatDisplayDate(plan.date)}</strong><small className="text-[10px] uppercase tracking-wider text-ink-muted">Daily plan</small></span>
      <span className={`text-xs py-1 px-2.5 border justify-self-start rounded-[20px] ${verdictBadgeClass[summary.tone]}`}>{summary.label}</span>
      <span>{plan.isCheatDay ? '—' : `${sum(plan, 'calories')} kcal budget`}</span>
      <span>{plan.isCheatDay ? '—' : `${sum(plan, 'protein')}g protein budget`}</span>
      <span className="text-center text-accent max-[720px]:hidden" aria-hidden="true">{isExpanded ? '↑' : '↓'}</span>
    </button>
    {isExpanded && <div className="mx-4.5 px-4.5 pb-4 pt-3 border-t border-line text-ink-soft text-[13px] grid gap-2.5">
      {plan.isCheatDay
        ? <p className="m-0">Eat what you enjoy today — no fixed menu, no calorie targets.</p>
        : plan.meals.map((meal) => <div className="flex items-center gap-2.5" key={meal.time}>
          {(meal.image ?? meal.originalImage) && <img src={resolveImage(meal.image ?? meal.originalImage!)} alt={meal.title} className="w-8.5 h-8.5 object-cover shrink-0" onError={(event) => { event.currentTarget.style.display = 'none'; }} />}
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

  return <section className="mt-9 rounded-2xl border border-line bg-surface-alt p-6.5 shadow-[0_12px_35px_rgba(0,0,0,.08)] max-[560px]:p-4.5">
    <div className="mb-5 flex items-end justify-between gap-4 max-[560px]:items-start max-[560px]:flex-col max-[560px]:gap-1">
      <div><span className="text-[10px] font-bold uppercase tracking-[.12em] text-accent">Plan history</span><h2 className="mb-0 mt-1 text-[27px]">Your recent days</h2></div>
      <span className="text-xs text-ink-muted">{history.length} saved plan{history.length === 1 ? '' : 's'}</span>
    </div>
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
