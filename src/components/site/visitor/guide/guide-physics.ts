// Walking guide: the pure body model for player mode (and the scroll-follow hop).
//
// No React, no DOM, no layout reads: the caller passes cached anchors (tagged
// section top edges, in viewport px) and the viewport. Fixed sub-steps with a
// clamped dt so a long frame never tunnels through a surface.
//
// Vertical traversal (N3): Up/Space is a HOP to the nearest anchor whose top is
// above the feet and inside the viewport (else an in-place hop). ArrowDown is a
// FALL, swept so it lands on the first anchor top it crosses (else it does
// nothing). The arcs are only the visual: the target is chosen by the anchor
// lookups below, never by the arc.

import type { GuideSectionId } from "../role-ids";
import { type Anchor, anchorInView, clampFeetY, clampX, maxFeetY, planStep, type Viewport } from "./guide-logic";

export const GRAVITY = 2400; // px/s^2
export const WALK_SPEED = 210; // px/s
export const WALK_ACCEL = 1700; // px/s^2
export const MAX_DT = 1 / 20; // a frame longer than this is clamped
export const SUBSTEP = 1 / 120;
export const HOP_APEX = 62; // px above the straight line between take-off and landing
const EPS = 0.5;

export type Flight = {
  kind: "hop" | "fall";
  fromX: number;
  fromY: number;
  toX: number;
  toId: GuideSectionId | null;
  /** last known landing y (refreshed from the anchor every tick so scrolling mid-hop still lands on it) */
  toY: number;
  t: number;
  dur: number;
  apex: number;
};

export type Body = {
  /** feet centre x, viewport px */
  x: number;
  /** feet y: the standing surface */
  y: number;
  vx: number;
  vy: number;
  facing: 1 | -1;
  /** the anchor it stands on; null = the viewport floor */
  anchorId: GuideSectionId | null;
  mode: "ground" | "air" | "flight";
  flight: Flight | null;
};

/** hop / down are one-tick pulses (the caller clears them after each step). */
export type Input = { left: boolean; right: boolean; hop: boolean; down: boolean };
export const NO_INPUT: Input = { left: false, right: false, hop: false, down: false };

export function standingBody(x: number, anchor: Anchor | null, vp: Viewport): Body {
  const y = anchor ? clampFeetY(anchor.top, vp) : maxFeetY(vp);
  return { x: clampX(x, vp), y, vx: 0, vy: 0, facing: 1, anchorId: anchor?.id ?? null, mode: "ground", flight: null };
}

export function anchorById(anchors: readonly Anchor[], id: GuideSectionId | null) {
  return id ? (anchors.find((a) => a.id === id) ?? null) : null;
}

const within = (a: Anchor, x: number) => x >= a.left && x <= a.right;

/** Nearest anchor whose top edge is above the feet and inside the viewport, or null. */
export function anchorAbove(body: Pick<Body, "y" | "anchorId">, anchors: readonly Anchor[], vp: Viewport): Anchor | null {
  let best: Anchor | null = null;
  for (const a of anchors) {
    if (a.id === body.anchorId || !anchorInView(a, vp) || a.top >= body.y - 1) continue;
    if (!best || a.top > best.top) best = a;
  }
  return best;
}

/** Nearest anchor whose top edge is below the feet and inside the viewport, or null. */
export function anchorBelow(body: Pick<Body, "y" | "anchorId">, anchors: readonly Anchor[], vp: Viewport): Anchor | null {
  let best: Anchor | null = null;
  for (const a of anchors) {
    if (a.id === body.anchorId || !anchorInView(a, vp) || a.top <= body.y + 1) continue;
    if (!best || a.top < best.top) best = a;
  }
  return best;
}

/**
 * Swept landing: the first standable top edge a falling body crosses between
 * `prevY` and `nextY` at column `x`. Never tunnels, however large the step.
 */
export function landingAnchor(prevY: number, nextY: number, x: number, anchors: readonly Anchor[], vp: Viewport): Anchor | null {
  let best: Anchor | null = null;
  for (const a of anchors) {
    if (!anchorInView(a, vp) || !within(a, x)) continue;
    if (a.top > prevY + EPS && a.top <= nextY + EPS && (!best || a.top < best.top)) best = a;
  }
  return best;
}

/** Walking off an edge: the next anchor in page order (right = below, left = above) that is in view. */
export function nextAnchorInDirection(anchors: readonly Anchor[], from: Anchor, dir: 1 | -1, vp: Viewport): Anchor | null {
  let best: Anchor | null = null;
  for (const a of anchors) {
    if (a.id === from.id || !anchorInView(a, vp)) continue;
    if (dir === 1 ? a.top > from.top : a.top < from.top) {
      if (!best || (dir === 1 ? a.top < best.top : a.top > best.top)) best = a;
    }
  }
  return best;
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const ease = (t: number) => t * t * (3 - 2 * t);

/** Start a hop (or a fall-style drop) toward `target`; a null target is an in-place hop. */
export function startFlight(body: Body, target: Anchor | null, vp: Viewport, toX?: number, toFloor = false): Body {
  const tx = clampX(toX ?? body.x, vp);
  const toY = toFloor ? maxFeetY(vp) : target ? clampFeetY(target.top, vp) : body.y;
  const toId = toFloor ? null : target ? target.id : body.anchorId;
  const { kind, dy } = planStep({ x: body.x, y: body.y }, { x: tx, y: toY });
  const distance = Math.abs(dy) + Math.abs(tx - body.x) * 0.4;
  const dur = clamp(0.32 + Math.sqrt(distance) / 70, 0.42, 0.95);
  const flight: Flight = {
    kind: kind === "fall" ? "fall" : "hop",
    fromX: body.x,
    fromY: body.y,
    toX: tx,
    toId,
    toY,
    t: 0,
    dur,
    apex: kind === "fall" ? HOP_APEX * 0.5 : HOP_APEX,
  };
  return { ...body, mode: "flight", flight, vx: 0, vy: 0, facing: tx > body.x + 1 ? 1 : tx < body.x - 1 ? -1 : body.facing };
}

/** Up / Space: hop to the nearest in-viewport anchor above, else hop in place. */
export function startHop(body: Body, anchors: readonly Anchor[], vp: Viewport): Body {
  return startFlight(body, anchorAbove(body, anchors, vp), vp);
}

/** ArrowDown: a physical fall (gravity + swept landing) when an anchor lies below inside the viewport; otherwise nothing. */
export function startFall(body: Body, anchors: readonly Anchor[], vp: Viewport): Body {
  if (!anchorBelow(body, anchors, vp)) return body;
  return { ...body, mode: "air", vy: 0, vx: 0, flight: null };
}

/** Keep a standing body on its (possibly scrolled) anchor: the feet follow the surface, clamped to the viewport. */
export function rideAnchor(b: Body, anchors: readonly Anchor[], vp: Viewport): Body {
  if (b.mode !== "ground") return b;
  const cur = anchorById(anchors, b.anchorId);
  const y = cur ? clampFeetY(cur.top, vp) : maxFeetY(vp);
  return y === b.y && clampX(b.x, vp) === b.x ? b : { ...b, y, x: clampX(b.x, vp) };
}

function tickFlight(b: Body, h: number, anchors: readonly Anchor[], vp: Viewport): Body {
  const f = b.flight!;
  const target = anchorById(anchors, f.toId);
  const toY = target ? clampFeetY(target.top, vp) : f.toY;
  const t = Math.min(1, f.t + h / f.dur);
  const e = ease(t);
  const lift = HOP_APEX > 0 ? 4 * f.apex * t * (1 - t) : 0;
  const y = f.fromY + (toY - f.fromY) * e - lift;
  const x = f.fromX + (f.toX - f.fromX) * e;
  if (t >= 1) return { ...b, x: f.toX, y: toY, vx: 0, vy: 0, anchorId: f.toId, mode: "ground", flight: null };
  return { ...b, x, y, flight: { ...f, t, toY } };
}

function tickAir(b: Body, input: Input, h: number, anchors: readonly Anchor[], vp: Viewport): Body {
  const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  const vy = b.vy + GRAVITY * h;
  const nextY = b.y + vy * h;
  const x = clampX(b.x + dir * WALK_SPEED * 0.5 * h, vp);
  const land = landingAnchor(b.y, nextY, x, anchors, vp);
  if (land) return { ...b, x, y: clampFeetY(land.top, vp), vx: 0, vy: 0, anchorId: land.id, mode: "ground", flight: null, facing: dir !== 0 ? (dir as 1 | -1) : b.facing };
  if (nextY >= maxFeetY(vp)) return { ...b, x, y: maxFeetY(vp), vx: 0, vy: 0, anchorId: null, mode: "ground", flight: null };
  return { ...b, x, y: nextY, vy, facing: dir !== 0 ? (dir as 1 | -1) : b.facing };
}

function tickGround(b: Body, input: Input, h: number, anchors: readonly Anchor[], vp: Viewport): Body {
  const cur = anchorById(anchors, b.anchorId);
  // Ride the anchor: when the page scrolls the surface moves and the feet follow (clamped to the viewport).
  const y = cur ? clampFeetY(cur.top, vp) : maxFeetY(vp);
  const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  const target = dir * WALK_SPEED;
  const dv = clamp(target - b.vx, -WALK_ACCEL * h, WALK_ACCEL * h);
  const vx = b.vx + dv;
  const raw = b.x + vx * h;
  const facing = (dir !== 0 ? dir : b.facing) as 1 | -1;

  // Walking off the end of a narrower anchor reaches the next one in that direction.
  if (cur && dir !== 0 && (raw < cur.left || raw > cur.right) && cur.right - cur.left < vp.w - 2) {
    const next = nextAnchorInDirection(anchors, cur, dir as 1 | -1, vp);
    if (next) {
      const tx = clamp(raw, next.left, next.right);
      return startFlight({ ...b, y, facing }, next, vp, tx);
    }
    const lo = Math.max(cur.left, 0);
    return { ...b, y, x: clampX(clamp(raw, lo, cur.right), vp), vx: 0, facing };
  }
  return { ...b, y, x: clampX(raw, vp), vx, facing };
}

/**
 * Advance the body by `dt` seconds (clamped to MAX_DT, split into fixed
 * sub-steps). Pure: returns a new Body.
 */
export function stepBody(body: Body, input: Input, dt: number, anchors: readonly Anchor[], vp: Viewport): Body {
  let b = body;
  let left = clamp(dt, 0, MAX_DT);
  let pulse = { hop: input.hop, down: input.down };
  while (left > 1e-9) {
    const h = Math.min(SUBSTEP, left);
    left -= h;
    if (b.mode === "flight" && b.flight) b = tickFlight(b, h, anchors, vp);
    else if (b.mode === "air") b = tickAir(b, input, h, anchors, vp);
    else {
      if (pulse.hop) b = startHop(b, anchors, vp);
      else if (pulse.down) b = startFall(b, anchors, vp);
      else b = tickGround(b, input, h, anchors, vp);
      pulse = { hop: false, down: false };
    }
  }
  // A zero-length step still applies a pulse, so a key press never gets lost.
  if (dt <= 0 && b.mode === "ground") {
    if (input.hop) b = startHop(b, anchors, vp);
    else if (input.down) b = startFall(b, anchors, vp);
  }
  return b;
}

/**
 * Does the body still need frames? False at rest: on the ground, not moving, and
 * no walking key held. The guide's rAF loop stops the moment this is false.
 */
export function isMoving(body: Body, input: Input = NO_INPUT) {
  return body.mode !== "ground" || Math.abs(body.vx) > 0.5 || input.left || input.right || input.hop || input.down;
}
