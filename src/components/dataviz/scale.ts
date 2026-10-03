// Pure helpers shared by the charts (no React), so they are unit-testable.

/** A "nice" axis maximum (1, 2, 2.5 or 5 × 10^k) at or above `value`. */
export function niceMax(value: number) {
  if (!Number.isFinite(value) || value <= 0) return 1;
  const exp = Math.floor(Math.log10(value));
  const base = 10 ** exp;
  for (const step of [1, 2, 2.5, 5, 10]) if (step * base >= value) return step * base;
  return 10 * base;
}

/** Evenly spaced ticks from 0 to `max` inclusive. */
export function ticks(max: number, count = 4) {
  return Array.from({ length: count + 1 }, (_, i) => Number(((max / count) * i).toPrecision(6)));
}

/** Format a number for a chart label: thousands separators, trimmed decimals. */
export function formatValue(value: number, unit = "") {
  const text = Number.isInteger(value) ? value.toLocaleString("en-US") : value.toLocaleString("en-US", { maximumFractionDigits: 1 });
  return `${text}${unit}`;
}

/** Percent change from `before` to `after`, rounded to one decimal. */
export function percentChange(before: number, after: number) {
  if (before === 0) return null;
  return Math.round(((after - before) / before) * 1000) / 10;
}

/** Ordered unique group names (legend order = first appearance). */
export function groupsOf(items: readonly { group?: string }[]) {
  const seen: string[] = [];
  for (const item of items) if (item.group && !seen.includes(item.group)) seen.push(item.group);
  return seen;
}

/** Bar/dot colours by series index. Literal classes so Tailwind generates them. */
export const SERIES_BG = ["bg-navy", "bg-accent", "bg-indigo", "bg-ink-3"] as const;
export const SERIES_TEXT = ["text-navy", "text-accent", "text-indigo", "text-ink-3"] as const;

/** The band a score falls in: the last band whose `from` is ≤ score (bands sorted by `from`). */
export function bandFor<T extends { from: number }>(score: number, bands: readonly T[]) {
  const sorted = [...bands].sort((a, b) => a.from - b.from);
  let hit = sorted[0];
  for (const band of sorted) if (score >= band.from) hit = band;
  return hit;
}

/** Linear interpolation, clamped t ∈ [0, 1]. */
export function lerp(a: number, b: number, t: number) {
  const k = Math.min(1, Math.max(0, t));
  return a + (b - a) * k;
}

/** Index of the timeline stop nearest a playhead position p ∈ [0, 1]. */
export function nearestStop(p: number, count: number) {
  if (count <= 1) return 0;
  return Math.min(count - 1, Math.max(0, Math.round(p * (count - 1))));
}
