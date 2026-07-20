export function formatDuration(totalMinutes: number): string {
  if (!totalMinutes || totalMinutes < 1) return '0m';
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const mins = Math.round(totalMinutes % 60);
  const parts: string[] = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (mins && !days) parts.push(`${mins}m`);
  return parts.join(' ') || '0m';
}

export function formatHours(totalMinutes: number): string {
  const h = totalMinutes / 60;
  if (h < 10) return `${h.toFixed(1)}h`;
  return `${Math.round(h)}h`;
}

export function pct(part: number, total: number): number {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

/** Estimate a finish date given remaining minutes and a weekly watch budget. */
export function marathonEstimate(
  remainingMinutes: number,
  hoursPerWeek: number,
): { weeks: number; date: Date } | null {
  if (hoursPerWeek <= 0 || remainingMinutes <= 0) return null;
  const weeks = remainingMinutes / 60 / hoursPerWeek;
  const date = new Date(Date.now() + weeks * 7 * 24 * 60 * 60 * 1000);
  return { weeks, date };
}

export function formatDate(d: Date): string {
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export const phaseLabel = (phase: number | string): string =>
  typeof phase === 'number' ? `Phase ${phase}` : phase;
