// Pure math for the hero dot grid (src/components/site/dot-grid.tsx).

/**
 * Influence of the pointer on a dot: 1 at the pointer, easing smoothly to 0 at
 * `radius` and beyond (smoothstep), so there is no hard edge.
 */
export function falloff(distance: number, radius: number) {
  if (radius <= 0 || !Number.isFinite(distance)) return 0;
  const t = 1 - Math.min(Math.max(distance / radius, 0), 1);
  return t * t * (3 - 2 * t);
}

/** Dot centres for a w×h area on a square grid, offset so the grid is centred. */
export function gridPoints(width: number, height: number, spacing: number) {
  if (width <= 0 || height <= 0 || spacing <= 0) return [] as { x: number; y: number }[];
  const cols = Math.floor(width / spacing);
  const rows = Math.floor(height / spacing);
  const offsetX = (width - (cols - 1) * spacing) / 2;
  const offsetY = (height - (rows - 1) * spacing) / 2;
  const points: { x: number; y: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) points.push({ x: offsetX + c * spacing, y: offsetY + r * spacing });
  }
  return points;
}

/** Gentle idle wave for devices without a cursor: 0..1 per dot over time (ms). */
export function idleWave(x: number, y: number, timeMs: number) {
  return (Math.sin(x * 0.012 + y * 0.008 + timeMs * 0.0012) + 1) / 2;
}
