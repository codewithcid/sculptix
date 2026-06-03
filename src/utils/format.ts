/** Misc display formatting helpers. */

export function formatReps(range: [number, number]): string {
  return range[0] === range[1] ? `${range[0]}` : `${range[0]}–${range[1]}`;
}

export function formatRest(seconds: number): string {
  if (seconds < 60) return `${seconds}s rest`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s ? `${m}m ${s}s rest` : `${m}m rest`;
}

export function formatVolume(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)}t`;
  return `${Math.round(kg)} kg`;
}

export function pluralize(n: number, singular: string, plural = `${singular}s`): string {
  return `${n} ${n === 1 ? singular : plural}`;
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function initials(name: string | null | undefined): string {
  if (!name) return '🏋️';
  return name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
