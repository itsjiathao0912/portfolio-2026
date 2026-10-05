// Walking guide: the pure platformer body model.
//
// No React, no DOM, no layout reads. The caller passes a `Scene` (cached surfaces
// in PAGE px plus the view: scroll offset, size, nav band) and gets a new Body.
//
// Rules, in one place:
// - Standing: the feet sit exactly on the surface top and follow it (page-space,
//   so scrolling never lags). The viewport floor is a pseudo-surface.
// - Falling: walking past a surface's edge, or the surface scrolling up into the
//   nav band, drops the body under gravity. Surfaces are one-way platforms: it
//   lands on the first top edge it crosses (swept, so a long step never tunnels).
// - Landing: a hard landing squashes (damped spring) and rebounds once, small.
// - Jumping: a ballistic arc; air control while it flies.
// Fixed sub-steps with a clamped dt keep it stable on a slow frame.

import { CHAR, clampX, FEET_MARGIN, floorY, maxFeetY, minFeetY, surfaceStandable, type Surface, type View } from "./guide-logic";

export const GRAVITY = 2600; // px/s^2
export const JUMP_V = 800; // px/s, apex = v^2 / 2g = ~123 px
export const WALK_SPEED = 230; // px/s
export const WALK_ACCEL = 1900; // px/s^2
export const AIR_SPEED = 250; // px/s
export const AIR_ACCEL = 1500; // px/s^2
export const TERMINAL_V = 2400; // px/s
export const MAX_DT = 1 / 20; // a frame longer than this is clamped
export const SUBSTEP = 1 / 120;
/** Feet may overhang an edge by this much before the body drops off. */
export const EDGE_TOL = 6;
/** A landing counts when the feet centre is within this of the surface's span. */
export const LAND_TOL = 12;
/** Hard landings faster than this rebound once. */
export const REBOUND_MIN_V = 420;
export const REBOUND_E = 0.22;
/** Squash spring: stiffness, damping; kick = impact speed * gain. */
export const SQUASH_K = 460;
export const SQUASH_C = 15;
export const SQUASH_GAIN = 0.0062;
export const SQUASH_MAX = 0.34;
export const TAKEOFF_KICK = -4.4;
const EPS = 0.5;

export const FLOOR_KEY = "floor";

export type Scene = { surfaces: readonly Surface[]; byKey: ReadonlyMap<string, Surface>; view: View };

export function makeScene(surfaces: readonly Surface[], view: View): Scene {
  return { surfaces, byKey: new Map(surfaces.map((s) => [s.key, s])), view };
}

export type Body = {
  /** feet centre x, page px */
  x: number;
  /** feet y: the standing surface, page px */
  y: number;
  vx: number;
  vy: number;
  facing: 1 | -1;
  mode: "ground" | "air";
  /** the surface key it stands on; FLOOR_KEY = the viewport floor; null while airborne */
  surface: string | null;
  /** vertical squash 0 = rest, + = squashed, - = stretched (damped spring) */
  squash: number;
  squashV: number;
  /** rebounds used since the last take-off */
  rebounds: number;
  /** increments on every final landing; the caller reacts to a change */
  landSeq: number;
  landKey: string | null;
  landImpact: number;
};

/** `hop` is a one-tick pulse (the caller clears it after each step); the rest are levels. */
export type Input = { left: boolean; right: boolean; up: boolean; hop: boolean };
export const NO_INPUT: Input = { left: false, right: false, up: false, hop: false };

/** The y of a surface key in this scene, or undefined when the surface is gone. */
export function surfaceY(scene: Scene, key: string | null): number | undefined {
  if (key === FLOOR_KEY) return floorY(scene.view);
  return key ? scene.byKey.get(key)?.top : undefined;
}

export function standingBody(x: number, surface: Surface | null, scene: Scene): Body {
  return {
    x: clampX(x, scene.view),
    y: surface ? surface.top : floorY(scene.view),
    vx: 0,
    vy: 0,
    facing: 1,
    mode: "ground",
    surface: surface ? surface.key : FLOOR_KEY,
    squash: 0,
    squashV: 0,
    rebounds: 0,
    landSeq: 0,
    landKey: null,
    landImpact: 0,
  };
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const within = (s: Pick<Surface, "left" | "right">, x: number, tol: number) => x >= s.left - tol && x <= s.right + tol;

function toAir(b: Body, y: number, vx = b.vx, vy = 0): Body {
  return { ...b, y, vx, vy, mode: "air", surface: null };
}

/**
 * Ballistic launch that lands exactly on `target` (apex at least 56 px above the
 * higher of the two points). Air control can still bend it; the swept landing
 * decides where it really comes down.
 */
export function launchTo(b: Body, target: Surface, scene: Scene, toX?: number): Body {
  const view = scene.view;
  const lo = target.left + CHAR.w / 2;
  const hi = target.right - CHAR.w / 2;
  const tx = clampX(hi > lo ? clamp(toX ?? b.x, lo, hi) : (target.left + target.right) / 2, view);
  const dy = target.top - b.y;
  const apex = Math.max(0, -dy) + 56;
  const vy0 = -Math.sqrt(2 * GRAVITY * apex);
  const up = -vy0 / GRAVITY;
  const down = Math.sqrt((2 * (apex + dy)) / GRAVITY);
  const vx = (tx - b.x) / (up + down);
  return { ...b, mode: "air", surface: null, vx, vy: vy0, rebounds: 0, squashV: TAKEOFF_KICK, facing: tx > b.x + 1 ? 1 : tx < b.x - 1 ? -1 : b.facing };
}

/** When the surface under the feet slides below the screen: the surface to hop up to (the lowest reachable one), or null for the floor. */
export function rescueTarget(b: Pick<Body, "x" | "y">, scene: Scene): Surface | null {
  const view = scene.view;
  const fy = floorY(view);
  let best: Surface | null = null;
  let bestScore = Infinity;
  for (const s of scene.surfaces) {
    if (!surfaceStandable(s, view) || s.top > fy - 40) continue;
    const gap = Math.max(0, s.left - b.x, b.x - s.right);
    const score = fy - s.top + gap * 0.5;
    if (score < bestScore) {
      bestScore = score;
      best = s;
    }
  }
  return best;
}

/** Settle a landing x onto the line: the feet centre at least FEET_MARGIN inside both ends (the middle of a short line). The landing tolerance never leaves it standing on air past the end. */
export function onLine(s: Pick<Surface, "left" | "right">, x: number) {
  if (s.right - s.left < 2 * FEET_MARGIN) return (s.left + s.right) / 2;
  return clamp(x, s.left + FEET_MARGIN, s.right - FEET_MARGIN);
}

function landed(b: Body, key: string, top: number, impact: number, x: number): Body {
  const kick = Math.min(impact * SQUASH_GAIN, 7);
  if (impact > REBOUND_MIN_V && b.rebounds < 1) {
    return { ...b, x, y: top, vx: b.vx * 0.5, vy: -impact * REBOUND_E, mode: "air", surface: null, rebounds: b.rebounds + 1, squashV: b.squashV + kick };
  }
  return { ...b, x, y: top, vx: 0, vy: 0, mode: "ground", surface: key, squashV: b.squashV + kick, rebounds: 0, landSeq: b.landSeq + 1, landKey: key, landImpact: impact };
}

function tickAir(b: Body, input: Input, h: number, scene: Scene): Body {
  const view = scene.view;
  const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  const vy = Math.min(TERMINAL_V, b.vy + GRAVITY * h);
  const vx = dir !== 0 ? clamp(b.vx + dir * AIR_ACCEL * h, -AIR_SPEED, AIR_SPEED) : b.vx * (1 - Math.min(1, 0.9 * h * 6));
  const x = clampX(b.x + vx * h, view);
  const facing = dir !== 0 ? (dir as 1 | -1) : b.facing;
  const prevY = b.y;
  let ny = prevY + vy * h;
  let nvy = vy;

  // Head against the nav band: the camera shoves it; gravity resumes the moment the page stops.
  const ceil = view.scrollY + minFeetY(view);
  if (ny < ceil) {
    ny = ceil;
    if (nvy < 0) nvy = 0;
  }

  if (nvy >= 0) {
    // Swept landing: the first top edge crossed between prevY and ny at this column (one-way platforms).
    let hit: Surface | null = null;
    for (const s of scene.surfaces) {
      if (!within(s, x, LAND_TOL) || !surfaceStandable(s, view)) continue;
      if (s.top > prevY + EPS && s.top <= ny + EPS && (!hit || s.top < hit.top)) hit = s;
    }
    const fy = floorY(view);
    if (hit && hit.top <= fy) return landed({ ...b, facing, vx }, hit.key, hit.top, nvy, onLine(hit, x));
    if (ny >= fy) return landed({ ...b, facing, vx }, FLOOR_KEY, fy, nvy, x);
  }
  return { ...b, x, y: ny, vx, vy: nvy, facing };
}

function tickGround(b: Body, input: Input, h: number, scene: Scene, pulse: boolean): Body {
  const view = scene.view;
  const sy = surfaceY(scene, b.surface);
  // The surface vanished (re-measure removed it): drop.
  if (sy === undefined) return toAir(b, b.y);
  const feet = sy - view.scrollY;
  const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);

  // Scrolled up into the nav band: the camera leaves it behind, it falls to what is below.
  if (b.surface !== FLOOR_KEY && feet < minFeetY(view) - 0.01) return toAir(b, sy);
  // Scrolled down off the bottom: hop up to the lowest reachable surface, else ride the floor.
  if (b.surface !== FLOOR_KEY && feet > maxFeetY(view) + 0.01) {
    const t = rescueTarget(b, scene);
    return t ? launchTo({ ...b, y: sy }, t, scene) : { ...b, y: floorY(view), surface: FLOOR_KEY };
  }

  if (pulse || input.up) {
    return { ...b, y: sy, mode: "air", surface: null, vy: -JUMP_V, vx: b.vx, rebounds: 0, squashV: TAKEOFF_KICK, facing: dir !== 0 ? (dir as 1 | -1) : b.facing };
  }

  const target = dir * WALK_SPEED;
  const vx = b.vx + clamp(target - b.vx, -WALK_ACCEL * h, WALK_ACCEL * h);
  const raw = b.x + vx * h;
  const facing = (dir !== 0 ? dir : b.facing) as 1 | -1;
  const surf = b.surface === FLOOR_KEY ? null : scene.byKey.get(b.surface ?? "");

  // Walking off the end of a block: step into the air with the momentum it had.
  if (surf && (raw < surf.left - EDGE_TOL || raw > surf.right + EDGE_TOL) && surf.right - surf.left < view.w - 2) {
    return toAir({ ...b, facing }, sy, vx, 0);
  }
  return { ...b, y: sy, x: clampX(raw, view), vx: clampX(raw, view) === raw ? vx : 0, facing };
}

/** Advance the body by `dt` seconds (clamped to MAX_DT, split into fixed sub-steps). Pure: returns a new Body. */
export function stepBody(body: Body, input: Input, dt: number, scene: Scene): Body {
  let b = body;
  let left = clamp(dt, 0, MAX_DT);
  let pulse = input.hop;
  const run = (h: number) => {
    if (b.mode === "air") b = tickAir(b, input, h, scene);
    else {
      b = tickGround(b, input, h, scene, pulse);
      pulse = false;
    }
    // Squash: a damped spring toward rest (the landing "bounce").
    const acc = -SQUASH_K * b.squash - SQUASH_C * b.squashV;
    const sv = b.squashV + acc * h;
    b = { ...b, squashV: sv, squash: clamp(b.squash + sv * h, -SQUASH_MAX, SQUASH_MAX) };
  };
  while (left > 1e-9) {
    const h = Math.min(SUBSTEP, left);
    left -= h;
    run(h);
  }
  // A zero-length step still applies a pulse, so a key press never gets lost.
  if (dt <= 0 && pulse) run(0);
  return b;
}

/** The vertical scale pair for the body: squash on landing, a touch of stretch in flight. */
export function squashScale(b: Pick<Body, "squash" | "mode" | "vy">) {
  const air = b.mode === "air" ? -Math.min(0.1, Math.abs(b.vy) * 0.00005) : 0;
  const s = clamp(b.squash + air, -SQUASH_MAX, SQUASH_MAX);
  return { sx: 1 + s * 0.55, sy: 1 - s } as const;
}

/**
 * Does the body still need frames? False at rest: on the ground, not moving, no
 * key held, squash settled. The guide's rAF loop stops the moment this is false.
 */
export function isMoving(b: Body, input: Input = NO_INPUT) {
  return b.mode === "air" || Math.abs(b.vx) > 0.5 || input.left || input.right || input.up || input.hop || Math.abs(b.squash) > 0.004 || Math.abs(b.squashV) > 0.05;
}
