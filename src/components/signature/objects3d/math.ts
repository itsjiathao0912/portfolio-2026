/** Pure helpers for the objects3d lane (no DOM, no three) so they can be unit-tested. */

export const DPR_CAP: [number, number] = [1, 1.5];

export function clamp(v: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, v));
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/** Progress (0..1) of a tall section scrolled through a viewport of height `vh`. */
export function sectionProgress(top: number, height: number, vh: number) {
  const travel = height - vh;
  if (travel <= 0) return top <= 0 ? 1 : 0;
  return clamp(-top / travel);
}

/** Which screen to show for a given progress, with n screens. */
export function screenIndex(progress: number, n: number) {
  if (n <= 0) return 0;
  return Math.min(n - 1, Math.floor(clamp(progress) * n));
}

/** Phone yaw: one gentle turn per screen, settling face-on at each screen's midpoint. */
export function phoneYaw(progress: number, n: number) {
  if (n <= 0) return 0;
  const local = clamp(progress) * n - screenIndex(progress, n); // 0..1 within a screen
  return Math.sin((local - 0.5) * Math.PI) * 0.55; // radians, ±0.55
}

/** Shield look-at target from pointer in normalised device coords (-1..1). */
export function lookAt(px: number, py: number, max = 0.6) {
  return { x: clamp(-py, -1, 1) * max * 0.6, y: clamp(px, -1, 1) * max };
}

export type Chip = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  bounced: boolean;
};

/**
 * One physics step for a threat chip flying at a circular shield of radius r at the origin.
 * On contact the chip reflects off the surface normal (with damping) and is marked bounced.
 */
export function stepChip(c: Chip, dt: number, r: number, damping = 0.85): Chip {
  let { x, y, vx, vy, bounced } = c;
  x += vx * dt;
  y += vy * dt;
  const d = Math.hypot(x, y);
  if (d < r && d > 0) {
    const nx = x / d;
    const ny = y / d;
    const dot = vx * nx + vy * ny;
    if (dot < 0) {
      vx = (vx - 2 * dot * nx) * damping;
      vy = (vy - 2 * dot * ny) * damping;
      bounced = true;
    }
    x = nx * r;
    y = ny * r;
  }
  return { x, y, vx, vy, bounced };
}

/** Spawn a chip on a circle of radius `from`, aimed (with a slight offset) at the shield. */
export function spawnChip(
  angle: number,
  from: number,
  speed: number,
  offset = 0.25,
): Chip {
  const x = Math.cos(angle) * from;
  const y = Math.sin(angle) * from;
  const a = Math.atan2(-y, -x) + offset;
  return {
    x,
    y,
    vx: Math.cos(a) * speed,
    vy: Math.sin(a) * speed,
    bounced: false,
  };
}

/** Decide whether to render real 3D. Anything uncertain → static fallback. */
export function canUse3D(env: {
  reducedMotion: boolean;
  saveData?: boolean;
  webgl: boolean;
  deviceMemory?: number;
}) {
  if (env.reducedMotion || env.saveData || !env.webgl) return false;
  if (env.deviceMemory !== undefined && env.deviceMemory < 2) return false;
  return true;
}
