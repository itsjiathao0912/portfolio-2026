// Walking guide: pure logic (no React, no DOM reads). Everything here takes
// plain numbers and rectangles so it can be unit tested without a browser.
//
// Coordinates are VIEWPORT pixels. A "surface" (anchor) is the top edge of a
// tagged home section (`[data-guide-walkable]`); the character's feet rest on it.
// Rects are measured on events (scroll / resize / ResizeObserver) and cached by
// the component, never per frame.

import { GUIDE_SECTION_IDS, type GuideSectionId, type RoleId } from "../role-ids";
import { scriptFor } from "./guide-story";

export type Rect = { left: number; top: number; right: number; bottom: number };
export type Viewport = { w: number; h: number; /** the fixed nav band: the character never overlaps it */ keepOut: Rect | null };
export type Anchor = { id: GuideSectionId; left: number; right: number; top: number; /** the section's bottom edge, when known */ bottom?: number };
export type Point = { x: number; y: number };

/** The character's body box in px (the clay figure at size 68: 100 x 164 viewBox). */
export const CHAR = { w: 68, h: 112 } as const;
/** Minimum gap between the character and the viewport sides / bottom. */
export const EDGE = 12;
/** Extra gap kept below the nav band. */
export const KEEP_GAP = 8;
/** At most this many unsolicited (passive) guide lines in a whole visit. */
export const MAX_PASSIVE_LINES = 6;
/** Below this viewport width the guide is not shown at all. */
export const MIN_GUIDE_WIDTH = 360;

/**
 * The home sections the guide may stand on and talk about, in page order.
 * Matches what page.tsx tags with `GuideSection` (the `contact` id is the footer
 * contact block). Always <= 6 (the P0 contract caps the id list).
 */
export const GUIDE_SECTIONS: readonly GuideSectionId[] = GUIDE_SECTION_IDS;

/** Lowest y the character's FEET may be at: its head must clear the nav band. */
export function minFeetY(vp: Viewport) {
  return (vp.keepOut ? vp.keepOut.bottom + KEEP_GAP : EDGE) + CHAR.h;
}

/** Highest y (lowest on screen) the feet may be at: the "floor" of the viewport. */
export function maxFeetY(vp: Viewport) {
  return vp.h - EDGE;
}

/** Clamp a feet-y into the allowed band. Because the band starts below the nav, the body box never meets the keep-out box. */
export function clampFeetY(y: number, vp: Viewport) {
  const lo = minFeetY(vp);
  const hi = Math.max(lo, maxFeetY(vp));
  return Math.min(hi, Math.max(lo, y));
}

/** Clamp a feet-centre x so the whole body stays inside the viewport. */
export function clampX(x: number, vp: Viewport) {
  const lo = EDGE + CHAR.w / 2;
  const hi = Math.max(lo, vp.w - EDGE - CHAR.w / 2);
  return Math.min(hi, Math.max(lo, x));
}

/** The body box for a feet position. */
export function bodyRect(x: number, y: number): Rect {
  return { left: x - CHAR.w / 2, right: x + CHAR.w / 2, top: y - CHAR.h, bottom: y };
}

export function rectsOverlap(a: Rect, b: Rect) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

function overlapArea(a: Rect, b: Rect) {
  const w = Math.min(a.right, b.right) - Math.max(a.left, b.left);
  const h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
  return w > 0 && h > 0 ? w * h : 0;
}

/** True when the anchor's top edge can be stood on right now (inside the viewport, below the nav band). */
export function anchorInView(a: Anchor, vp: Viewport) {
  return a.top >= minFeetY(vp) && a.top <= maxFeetY(vp) && a.right > 0 && a.left < vp.w;
}

/** Turn measured rects of the tagged elements into anchors: skips empty ones, one per id (first wins), top-to-bottom. */
export function collectSurfaces(entries: readonly { id: string; rect: Rect }[]): Anchor[] {
  const seen = new Set<string>();
  const out: Anchor[] = [];
  for (const { id, rect } of entries) {
    if (!(GUIDE_SECTIONS as readonly string[]).includes(id) || seen.has(id)) continue;
    if (!(rect.right > rect.left) || !(rect.bottom > rect.top)) continue;
    seen.add(id);
    out.push({ id: id as GuideSectionId, left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom });
  }
  return out.sort((a, b) => a.top - b.top);
}

/**
 * The surface to settle on: the tagged top edge nearest the 45% line of the
 * viewport, but only inside the 20-70% band (and standable). Ties go to the
 * lower edge. Null when no edge qualifies.
 */
export function pickSurface(surfaces: readonly Anchor[], vp: Viewport): Anchor | null {
  const line = vp.h * 0.45;
  let best: Anchor | null = null;
  for (const s of surfaces) {
    if (!anchorInView(s, vp) || s.top < vp.h * 0.2 || s.top > vp.h * 0.7) continue;
    if (!best || Math.abs(s.top - line) < Math.abs(best.top - line) || (Math.abs(s.top - line) === Math.abs(best.top - line) && s.top > best.top)) best = s;
  }
  return best;
}

/** The standable anchor nearest `refY` (ties: the lower one). Null when none is in view. */
export function nearestAnchorInView(anchors: readonly Anchor[], vp: Viewport, refY: number): Anchor | null {
  let best: Anchor | null = null;
  for (const a of anchors) {
    if (!anchorInView(a, vp)) continue;
    const d = Math.abs(a.top - refY);
    if (!best) best = a;
    else {
      const bd = Math.abs(best.top - refY);
      if (d < bd || (d === bd && a.top > best.top)) best = a;
    }
  }
  return best;
}

/**
 * The section the viewport line `y` runs through (top <= y < bottom). Lets a
 * character standing on the floor still talk about what the visitor is reading.
 */
export function sectionUnder(anchors: readonly Anchor[], y: number): GuideSectionId | null {
  let best: Anchor | null = null;
  for (const a of anchors) if (a.top <= y && (a.bottom === undefined || a.bottom > y) && (!best || a.top > best.top)) best = a;
  return best?.id ?? null;
}

export type StepKind = "walk" | "hop" | "fall";

/** How the character gets from one standing point to another. Same level = walk, target above = hop, below = fall. */
export function planStep(from: Point, to: Point) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const kind: StepKind = Math.abs(dy) <= 4 ? "walk" : dy < 0 ? "hop" : "fall";
  return { kind, dx, dy } as const;
}

/** Previous / next anchor id in page order (reduced-motion stepping). Wraps nowhere: stays on the end. */
export function stepAnchor(anchors: readonly Anchor[], currentId: GuideSectionId | null, dir: 1 | -1) {
  if (anchors.length === 0) return null;
  const i = currentId ? anchors.findIndex((a) => a.id === currentId) : -1;
  if (i < 0) return dir === 1 ? anchors[0]! : anchors[anchors.length - 1]!;
  return anchors[Math.min(anchors.length - 1, Math.max(0, i + dir))]!;
}

/**
 * A standing x for the character at `feetY` that does not cover a link, button
 * or other tap target. Tries the right margin, the left margin, then a spread of
 * positions; falls back to the least-overlapping candidate. Pure.
 */
export function chooseStandX(vp: Viewport, feetY: number, avoid: readonly Rect[], preferred?: number) {
  const lo = EDGE + CHAR.w / 2;
  const hi = Math.max(lo, vp.w - EDGE - CHAR.w / 2);
  const candidates: number[] = [];
  if (preferred !== undefined) candidates.push(clampX(preferred, vp));
  candidates.push(hi, lo);
  for (let i = 1; i < 8; i++) candidates.push(lo + ((hi - lo) * i) / 8);
  let best = candidates[0]!;
  let bestArea = Infinity;
  for (const x of candidates) {
    const box = bodyRect(x, feetY);
    let area = 0;
    for (const r of avoid) area += overlapArea(box, r);
    if (area === 0) return x;
    if (area < bestArea) {
      bestArea = area;
      best = x;
    }
  }
  return best;
}

/** Which side of the character the speech bubble opens on: toward the roomier side. */
export function bubbleSide(x: number, vp: Viewport): "left" | "right" {
  return x > vp.w / 2 ? "left" : "right";
}

// ---- keyboard scope (N1) ---------------------------------------------------

/** The slice of a DOM node `shouldHandleGuideKey` needs, so it is testable without a DOM. */
export type KeyTarget = {
  nodeName?: string;
  parentElement?: KeyTarget | null;
  getAttribute?: (name: string) => string | null;
};

const BODY_LIKE = new Set(["BODY", "HTML", "#document"]);

function isInside(node: KeyTarget | null | undefined, root: KeyTarget | null | undefined) {
  for (let n = node ?? null; n; n = n.parentElement ?? null) if (n === root) return true;
  return false;
}

/**
 * Should an engaged guide act on this key? Only when the key landed on the page
 * itself (body / document) or inside the guide. A link, button, summary, input,
 * role=button|link|radio|menuitem|tab|slider|checkbox|option, contenteditable or
 * any other page element keeps its own keyboard behaviour, and a key pressed with
 * Ctrl / Meta / Alt is never ours. Controls inside the guide that activate on
 * Enter or Space themselves (Hide, Walk with me, the touch buttons) carry
 * `data-guide-native` keep Enter and Space but arrows still walk.
 */
export function shouldHandleGuideKey(
  target: KeyTarget | null | undefined,
  guideEl: KeyTarget | null | undefined,
  event: { key?: string; ctrlKey?: boolean; metaKey?: boolean; altKey?: boolean },
) {
  if (event.ctrlKey || event.metaKey || event.altKey) return false;
  if (!target) return true;
  const name = (target.nodeName ?? "").toUpperCase();
  if (BODY_LIKE.has(name) || BODY_LIKE.has(target.nodeName ?? "")) return true;
  if (isInside(target, guideEl)) {
    for (let n: KeyTarget | null = target; n && n !== guideEl; n = n.parentElement ?? null) {
      // Native guide controls keep Enter and Space (they activate); arrows still walk.
      if (n.getAttribute?.("data-guide-native") === "true" && (event.key === "Enter" || event.key === " " || event.key === "Spacebar")) return false;
    }
    return true;
  }
  return false;
}

// ---- lines -----------------------------------------------------------------

/**
 * The unsolicited line for arriving at `section`: line 1 from the role table, once
 * per section, at most MAX_PASSIVE_LINES in a visit. Null otherwise.
 */
export function nextLine(role: RoleId, section: GuideSectionId, visited: ReadonlySet<GuideSectionId>): string | null {
  if (visited.has(section) || visited.size >= MAX_PASSIVE_LINES) return null;
  return scriptFor(role, section)[0] ?? null;
}
