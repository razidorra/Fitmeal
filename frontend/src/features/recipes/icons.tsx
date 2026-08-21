// Small inline stat icons for recipe cards, matching currentColor so they pick up theme tints.
const strokeProps = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

export function ClockIcon() {
  return <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><circle cx="12" cy="12" r="9" {...strokeProps} /><path d="M12 7v5l3.2 2" {...strokeProps} /></svg>;
}

export function FlameIcon() {
  return <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M12 21c4 0 6.5-2.6 6.5-6.2 0-2.7-1.6-4.5-2.7-6-.3 1.6-1.2 2.6-2 2.2-.9-.5-.3-2.4-1-4.5-.6-1.9-2.1-3.1-2.1-3.1s.4 2-1 4C8.4 9 6.5 11 6.5 14.4 6.5 18 8 21 12 21Z" {...strokeProps} /></svg>;
}

export function BoltIcon() {
  return <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M13 2 4.5 14h6L11 22l8.5-12.5h-6L13 2Z" {...strokeProps} /></svg>;
}
