import type { Checkin } from '../../shared/types';

const chartWidth = 800;
const chartHeight = 260;
const padding = { top: 24, right: 24, bottom: 42, left: 54 };

export function WeightTrendChart({ checkins }: { checkins: Checkin[] }) {
  if (checkins.length === 0) {
    return <div className="grid min-h-65 place-items-center rounded-xl border border-dashed border-line-strong bg-surface-alt p-8 text-center">
      <div><strong className="mb-2 block text-ink">Your trend will appear here</strong><span className="text-sm text-ink-muted">Add your first check-in to start building a weight history.</span></div>
    </div>;
  }

  const weights = checkins.map((checkin) => checkin.weightKg);
  const lowestWeight = Math.min(...weights);
  const highestWeight = Math.max(...weights);
  const rangePadding = Math.max(0.5, (highestWeight - lowestWeight) * 0.2);
  const chartMinimum = lowestWeight - rangePadding;
  const chartMaximum = highestWeight + rangePadding;
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;
  const points = checkins.map((checkin, index) => {
    const x = padding.left + (checkins.length === 1 ? plotWidth / 2 : (index / (checkins.length - 1)) * plotWidth);
    const y = padding.top + ((chartMaximum - checkin.weightKg) / (chartMaximum - chartMinimum)) * plotHeight;
    return { x, y, checkin };
  });
  const linePoints = points.map(({ x, y }) => `${x},${y}`).join(' ');
  const areaPoints = `${padding.left},${padding.top + plotHeight} ${linePoints} ${padding.left + plotWidth},${padding.top + plotHeight}`;
  const gridValues = Array.from({ length: 4 }, (_, index) => chartMaximum - (index / 3) * (chartMaximum - chartMinimum));
  const firstDate = new Date(checkins[0].date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const lastDate = new Date(checkins.at(-1)!.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  return <div className="overflow-hidden rounded-xl border border-line bg-surface-alt p-3 max-[520px]:p-1">
    <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} role="img" aria-label={`Weight trend from ${weights[0]} to ${weights.at(-1)} kilograms`} className="h-auto w-full overflow-visible text-ink-muted">
      <defs>
        <linearGradient id="weight-area-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {gridValues.map((value, index) => {
        const y = padding.top + (index / 3) * plotHeight;
        return <g key={value}>
          <line x1={padding.left} x2={padding.left + plotWidth} y1={y} y2={y} stroke="var(--border)" strokeDasharray="5 7" />
          <text x={padding.left - 10} y={y + 4} textAnchor="end" fill="currentColor" fontSize="11">{value.toFixed(1)}</text>
        </g>;
      })}
      {checkins.length > 1 && <polygon points={areaPoints} fill="url(#weight-area-gradient)" />}
      {checkins.length > 1 && <polyline points={linePoints} fill="none" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />}
      {points.map(({ x, y, checkin }) => <circle key={checkin._id} cx={x} cy={y} r="6" fill="var(--bg-surface-alt)" stroke="var(--accent)" strokeWidth="4">
        <title>{new Date(checkin.date).toLocaleDateString()}: {checkin.weightKg} kg</title>
      </circle>)}
      <text x={padding.left} y={chartHeight - 12} fill="currentColor" fontSize="11">{firstDate}</text>
      <text x={padding.left + plotWidth} y={chartHeight - 12} textAnchor="end" fill="currentColor" fontSize="11">{checkins.length === 1 ? 'First check-in' : lastDate}</text>
      <text x="14" y={padding.top + plotHeight / 2} fill="currentColor" fontSize="10" textAnchor="middle" transform={`rotate(-90 14 ${padding.top + plotHeight / 2})`}>WEIGHT (KG)</text>
    </svg>
  </div>;
}
