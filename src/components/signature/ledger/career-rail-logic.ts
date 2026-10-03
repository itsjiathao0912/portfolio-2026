// Pure helpers for the career rail (kept out of the component so they are unit-testable).

/** Index of the card whose centre is closest to the viewport centre. */
export function nearestCardIndex(centers: readonly number[], viewportCenter: number): number {
  let best = 0;
  let bestDist = Number.POSITIVE_INFINITY;
  centers.forEach((c, i) => {
    const d = Math.abs(c - viewportCenter);
    if (d < bestDist) {
      best = i;
      bestDist = d;
    }
  });
  return best;
}

/** Marker position along the track (0–100 %) for card `index` of `count`. */
export function markerPercent(index: number, count: number): number {
  if (count <= 0) return 0;
  const clamped = Math.min(Math.max(index, 0), count - 1);
  return ((clamped + 0.5) / count) * 100;
}

/** Scroll target that fully shows the next/previous card, clamped to the scroll range. */
export function stepScrollTarget(scrollLeft: number, step: number, direction: 1 | -1, max: number): number {
  return Math.min(Math.max(scrollLeft + direction * step, 0), Math.max(max, 0));
}

/**
 * Where a released mouse-drag settles: a modest momentum projection from the
 * release velocity (px/ms, capped), then the nearest snap point (card-centred
 * scroll positions). A small nudge therefore stays put; a flick moves about one card.
 */
export function dragReleaseTarget(
  scrollLeft: number,
  velocity: number,
  max: number,
  snapPoints: readonly number[],
  momentumMs = 120,
  maxVelocity = 1.5,
): number {
  const v = Math.min(Math.max(velocity, -maxVelocity), maxVelocity);
  const hi = Math.max(max, 0);
  const projected = Math.min(Math.max(scrollLeft - v * momentumMs, 0), hi);
  let best = projected;
  let bestDist = Number.POSITIVE_INFINITY;
  for (const p of snapPoints) {
    const c = Math.min(Math.max(p, 0), hi);
    const d = Math.abs(c - projected);
    if (d < bestDist) {
      best = c;
      bestDist = d;
    }
  }
  return best;
}
