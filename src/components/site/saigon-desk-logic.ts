// Pure arithmetic for the "Saigon desk" popover. Saigon is UTC+7 all year (no
// daylight saving). Working hours are 09:00-18:00 on each side. Everything is
// expressed on the Saigon clock axis, in minutes 0..1440.

export const SAIGON_OFFSET_MIN = 7 * 60;
export const WORK_START_MIN = 9 * 60;
export const WORK_END_MIN = 18 * 60;
const DAY = 1440;

export type Span = readonly [start: number, end: number];

/** Visitor offset from Saigon in minutes (positive = visitor is ahead of Saigon). */
export function deltaFromSaigon(visitorOffsetEastMin: number) {
  return visitorOffsetEastMin - SAIGON_OFFSET_MIN;
}

/** Split a span that may wrap past midnight into spans inside 0..1440. */
export function wrapSpan(start: number, end: number): Span[] {
  const s = ((start % DAY) + DAY) % DAY;
  const len = end - start;
  if (len >= DAY) return [[0, DAY]];
  const e = s + len;
  return e <= DAY ? [[s, e]] : [[s, DAY], [0, e - DAY]];
}

/** The visitor's 09:00-18:00 shown on the Saigon clock axis. */
export function visitorWorkOnSaigonAxis(deltaMin: number): Span[] {
  return wrapSpan(WORK_START_MIN - deltaMin, WORK_END_MIN - deltaMin);
}

/** Overlap of both working days, on the Saigon axis. Empty array when there is none. */
export function overlapOnSaigonAxis(deltaMin: number): Span[] {
  const out: Span[] = [];
  for (const [a, b] of visitorWorkOnSaigonAxis(deltaMin)) {
    const s = Math.max(a, WORK_START_MIN);
    const e = Math.min(b, WORK_END_MIN);
    if (e > s) out.push([s, e]);
  }
  return out;
}

export function formatMin(min: number) {
  const m = ((Math.round(min) % DAY) + DAY) % DAY;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

/** "14:00-18:00" style range; 1440 prints as 00:00 which reads right for an end time. */
export function formatRange(start: number, end: number) {
  return `${formatMin(start)}-${formatMin(end)}`;
}

/** Plain-English overlap sentence, in the visitor's local time and in Saigon time. */
export function overlapSentence(deltaMin: number) {
  const spans = overlapOnSaigonAxis(deltaMin);
  if (spans.length === 0) {
    return "No office-hours overlap. I am happy to take a call in my evening.";
  }
  const saigon = spans.map(([s, e]) => formatRange(s, e)).join(" and ");
  const local = spans.map(([s, e]) => formatRange(s + deltaMin, e + deltaMin)).join(" and ");
  return `We overlap ${local} your time, which is ${saigon} in Saigon.`;
}

/** Hours-ahead label: "same time as Saigon", "3 h behind Saigon" (fractions for half-hour zones). */
export function offsetLabel(deltaMin: number) {
  if (deltaMin === 0) return "Same time as Saigon";
  const h = Math.abs(deltaMin) / 60;
  const txt = Number.isInteger(h) ? String(h) : h.toFixed(1);
  return `${txt} h ${deltaMin > 0 ? "ahead of" : "behind"} Saigon`;
}
