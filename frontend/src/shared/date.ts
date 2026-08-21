/** "YYYY-MM-DD" for the given date in the browser's own local timezone (not UTC, unlike toISOString). */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** The Monday that starts the week containing this "YYYY-MM-DD" date, as a "YYYY-MM-DD" string. */
export function getWeekStart(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  const dayOfWeek = date.getDay(); // 0 = Sunday
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  date.setDate(date.getDate() + diff);
  return getLocalDateString(date);
}

/** A "YYYY-MM-DD" date, formatted for display, e.g. "Fri, Aug 21". */
export function formatDisplayDate(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}
