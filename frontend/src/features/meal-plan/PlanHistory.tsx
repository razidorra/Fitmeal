import { useState } from 'react';
import type { MealPlan } from '../../shared/types';
import { formatDisplayDate, getLocalDateString, getWeekStart } from '../../shared/date';

function sum(plan: MealPlan, key: 'calories' | 'protein') {
  return plan.meals.reduce((total, meal) => total + meal[key], 0);
}

// Summarizes the day from each meal's own confirm-or-swap answer, rather than a separate whole-day check.
function summarizeDay(plan: MealPlan) {
  const total = plan.meals.length;
  const changedCount = plan.meals.filter((meal) => meal.isCustom).length;
  const answeredCount = plan.meals.filter((meal) => meal.confirmed === true || meal.isCustom).length;

  if (answeredCount === 0) return { label: 'Not logged', className: 'verdict-ok' };
  if (changedCount === 0) return { label: 'All as planned', className: 'verdict-good' };
  return { label: `${changedCount}/${total} changed`, className: changedCount > total / 2 ? 'verdict-poor' : 'verdict-ok' };
}

function DayRow({ plan, isExpanded, onToggle }: { plan: MealPlan; isExpanded: boolean; onToggle: () => void }) {
  const summary = summarizeDay(plan);

  return <div className="history-day">
    <button type="button" className="history-day-row" onClick={onToggle}>
      <span className="history-date">{formatDisplayDate(plan.date)}</span>
      <span className={`history-followed ${summary.className}`}>{summary.label}</span>
      <span>{sum(plan, 'calories')} kcal</span>
      <span>{sum(plan, 'protein')}g protein</span>
    </button>
    {isExpanded && <div className="history-meals">
      {plan.meals.map((meal) => <div className="history-meal-row" key={meal.time}>
        {(meal.image ?? meal.originalImage) && <img src={meal.image ?? meal.originalImage} alt={meal.title} className="history-meal-photo" onError={(event) => { event.currentTarget.style.display = 'none'; }} />}
        <span><strong>{meal.time}:</strong> {meal.originalTitle ? <><s>{meal.originalTitle}</s> → {meal.title}</> : meal.title}</span>
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

  return <section className="history-section">
    <h2>Your week</h2>
    {thisWeek.length > 0 && <div className="history-group">
      <h3>This week</h3>
      {thisWeek.map((plan) => <DayRow key={plan._id} plan={plan} isExpanded={expandedId === plan._id} onToggle={() => setExpandedId(expandedId === plan._id ? null : plan._id)} />)}
    </div>}
    {previousWeek.length > 0 && <div className="history-group">
      <h3>Previous week</h3>
      {previousWeek.map((plan) => <DayRow key={plan._id} plan={plan} isExpanded={expandedId === plan._id} onToggle={() => setExpandedId(expandedId === plan._id ? null : plan._id)} />)}
    </div>}
  </section>;
}
