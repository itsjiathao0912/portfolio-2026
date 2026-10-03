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

/** Where a released mouse-drag should coast to, from its release velocity (px/ms). */
export function inertiaTarget(scrollLeft: number, velocity: number, max: number, coastMs = 220): number {
  return Math.min(Math.max(scrollLeft - velocity * coastMs, 0), Math.max(max, 0));
}
