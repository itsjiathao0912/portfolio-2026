// Walking guide: pure logic (no React, no DOM reads). Everything here takes plain
// numbers and rectangles so it can be unit tested without a browser.
//
// Coordinates are PAGE pixels (document space), not viewport pixels. A "surface"
// is the top edge of a visible content block (heading, paragraph, card, image,
// button...). The character's feet rest exactly on it. Because the guide layer is
// absolutely positioned in the document, a character standing on a surface scrolls
// with the page natively, with no JS in the loop.

import { GUIDE_SECTION_IDS, type GuideSectionId, type RoleId } from "../role-ids";
import { scriptFor } from "./guide-story";

export type Rect = { left: number; top: number; right: number; bottom: number };

/** The pages the guide lives on. */
export type GuidePage = "home" | "case" | "about";

/** Spots on the case-study and about pages the guide can talk about (home uses GuideSectionId). */
export const PAGE_SPOT_IDS = ["case-intro", "case-depth", "case-body", "case-metric", "case-next", "about-intro", "about-career", "about-experience", "about-skills", "about-recognition"] as const;
export type PageSpotId = (typeof PAGE_SPOT_IDS)[number];
/** Anything the guide can say a line about: a home section or a page spot. */
export type GuideSpotId = GuideSectionId | PageSpotId;

/** Which guide page a pathname is, or null when the guide does not live there. */
export function guidePageFor(pathname: string | null): GuidePage | null {
  if (pathname === "/") return "home";
  if (pathname === "/about") return "about";
  if (pathname && /^\/work\/[^/]+\/?$/.test(pathname)) return "case";
  return null;
}

/** One standable top edge, in page px. `key` is stable across re-measures. */
export type Surface = { key: string; id: GuideSpotId | null; left: number; right: number; top: number };

/** A tagged section's vertical span in page px (what the visitor is "reading"). */
export type Span = { id: GuideSpotId; top: number; bottom: number };

/** The window onto the page: size, scroll offset, document height and the fixed nav band's bottom (viewport px). */
export type View = { w: number; h: number; scrollY: number; docH: number; nav: number };

/** The clay full-body viewBox (w x h), see clay-avatar.tsx FULL. The body box height derives from it so the svg fills the box exactly. */
export const CLAY_FULL_VIEWBOX = { w: 100, h: 150 } as const;
const CHAR_W = 68;
/** The character's body box in px: the clay figure at size 68, height from the viewBox ratio (the clay svg rounds the same way). */
export const CHAR = { w: CHAR_W, h: Math.round((CHAR_W * CLAY_FULL_VIEWBOX.h) / CLAY_FULL_VIEWBOX.w) } as const;
/** Minimum gap between the character and the viewport sides / bottom. */
export const EDGE = 12;
/** Extra gap kept below the nav band. */
export const KEEP_GAP = 8;
/** At most this many unsolicited (passive) guide lines in a whole visit. */
export const MAX_PASSIVE_LINES = 6;
/** Below this viewport width the guide is not shown at all. */
export const MIN_GUIDE_WIDTH = 360;
/** Surfaces narrower than this are not worth standing on. */
export const MIN_SURFACE_W = 40;

/** The home sections the guide may talk about, in page order (always <= 6). */
export const GUIDE_SECTIONS: readonly GuideSectionId[] = GUIDE_SECTION_IDS;

/** Smallest viewport y the FEET may be at: the head must clear the nav band. */
export function minFeetY(view: Pick<View, "nav">) {
  return (view.nav > 0 ? view.nav + KEEP_GAP : EDGE) + CHAR.h;
}

/** Largest viewport y a SURFACE may hold the feet at (a block hugging the bottom edge is not stood on). */
export function maxFeetY(view: Pick<View, "h">) {
  return view.h - EDGE;
}

/**
 * The visible viewport height: the visual viewport (excludes mobile browser bars and an on-screen
 * keyboard) when present, else innerHeight. Pure over the window slice it reads.
 */
export function visibleHeight(win: { innerHeight: number; visualViewport?: { height: number } | null }) {
  const v = win.visualViewport?.height;
  return v && v > 0 ? v : win.innerHeight;
}

/** Clamp a feet-centre x so the whole body stays inside the viewport width. */
export function clampX(x: number, view: Pick<View, "w">) {
  const lo = EDGE + CHAR.w / 2;
  const hi = Math.max(lo, view.w - EDGE - CHAR.w / 2);
  return Math.min(hi, Math.max(lo, x));
}

/** The body box for a feet position (page px). */
export function bodyRect(x: number, y: number): Rect {
  return { left: x - CHAR.w / 2, right: x + CHAR.w / 2, top: y - CHAR.h, bottom: y };
}

function overlapArea(a: Rect, b: Rect) {
  const w = Math.min(a.right, b.right) - Math.max(a.left, b.left);
  const h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
  return w > 0 && h > 0 ? w * h : 0;
}

/** True when the surface's top edge can be stood on right now: below the nav band, above the floor, on screen. */
export function surfaceStandable(s: Surface, view: View) {
  const feet = s.top - view.scrollY;
  return feet >= minFeetY(view) && feet <= maxFeetY(view) && s.right > 0 && s.left < view.w;
}

/** The page-space y of the viewport floor: the visible viewport bottom exactly, so resting soles touch the screen edge. */
export function floorY(view: Pick<View, "scrollY" | "h">) {
  return view.scrollY + view.h;
}

/** The standable surface nearest the viewport line at `frac` of its height (ties: the lower one). Null when none. */
export function pickSurface(surfaces: readonly Surface[], view: View, frac = 0.55): Surface | null {
  const line = view.scrollY + view.h * frac;
  let best: Surface | null = null;
  for (const s of surfaces) {
    if (!surfaceStandable(s, view)) continue;
    if (!best || Math.abs(s.top - line) < Math.abs(best.top - line) || (Math.abs(s.top - line) === Math.abs(best.top - line) && s.top > best.top)) best = s;
  }
  return best;
}

/** Visible surfaces in reading order (top, then left): what reduced motion steps through. */
export function visibleSurfaces(surfaces: readonly Surface[], view: View): Surface[] {
  return surfaces.filter((s) => surfaceStandable(s, view)).sort((a, b) => a.top - b.top || a.left - b.left);
}

/** Previous / next surface in reading order (reduced-motion stepping). Stays on the end. */
export function stepSurface(list: readonly Surface[], currentKey: string | null, dir: 1 | -1): Surface | null {
  if (list.length === 0) return null;
  const i = currentKey ? list.findIndex((s) => s.key === currentKey) : -1;
  if (i < 0) return dir === 1 ? list[0]! : list[list.length - 1]!;
  return list[Math.min(list.length - 1, Math.max(0, i + dir))]!;
}

/** The tagged section whose span runs through page `y`. Lets a character on an untagged block still speak about what is being read. */
export function sectionUnder(spans: readonly Span[], y: number): GuideSpotId | null {
  let best: Span | null = null;
  for (const s of spans) if (s.top <= y && s.bottom > y && (!best || s.top > best.top)) best = s;
  return best?.id ?? null;
}

/**
 * A standing x on `surface` that does not cover a link, button or other tap
 * target (`avoid`, page px). Tries the preferred x, the right quarter, the left
 * quarter, then a spread; falls back to the least-overlapping candidate. Pure.
 */
export function chooseStandX(surface: Pick<Surface, "left" | "right" | "top">, view: Pick<View, "w">, avoid: readonly Rect[], preferred?: number) {
  const lo = Math.max(surface.left + CHAR.w / 2, EDGE + CHAR.w / 2);
  const hi = Math.min(surface.right - CHAR.w / 2, view.w - EDGE - CHAR.w / 2);
  if (hi <= lo) return clampX((surface.left + surface.right) / 2, view);
  const span = hi - lo;
  const candidates: number[] = [];
  if (preferred !== undefined) candidates.push(Math.min(hi, Math.max(lo, preferred)));
  candidates.push(hi, lo, lo + span * 0.5);
  for (let i = 1; i < 8; i++) candidates.push(lo + (span * i) / 8);
  let best = candidates[0]!;
  let bestArea = Infinity;
  for (const x of candidates) {
    const box = bodyRect(x, surface.top);
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

/** How much of the body box (feet at x, y; page px) sits over tap targets. 0 = clear. */
export function coverage(x: number, y: number, avoid: readonly Rect[]) {
  const box = bodyRect(x, y);
  let area = 0;
  for (const r of avoid) area += overlapArea(box, r);
  return area;
}

export type BubblePlace = "right" | "left" | "above";
export const BUBBLE_W = 188;
export const BUBBLE_H = 58;

/**
 * Where the speech bubble goes so it never covers a link, button or other tap
 * target (`avoid`, page px): beside the character on the roomier side, else the
 * other side, else above the head. `w` is the width it may use; `dx` the left
 * offset (px, relative to the body box) for the above placement.
 */
export function placeBubble(x: number, y: number, view: Pick<View, "w">, avoid: readonly Rect[], preferAbove = false) {
  const roomR = view.w - (x + CHAR.w / 2) - EDGE - 8;
  const roomL = x - CHAR.w / 2 - EDGE - 8;
  const wAbove = Math.min(BUBBLE_W, view.w - 2 * EDGE);
  const aboveLeft = Math.min(view.w - EDGE - wAbove, Math.max(EDGE, x - wAbove / 2));
  const cands: { place: BubblePlace; w: number; rect: Rect; dx: number }[] = [];
  const side = (place: "right" | "left", room: number) => {
    const w = Math.max(0, Math.min(BUBBLE_W, Math.floor(room / 4) * 4));
    const left = place === "right" ? x + CHAR.w / 2 + 8 : x - CHAR.w / 2 - 8 - w;
    cands.push({ place, w, dx: 0, rect: { left, right: left + w, top: y - BUBBLE_H - 4, bottom: y - 4 } });
  };
  const above = () => cands.push({ place: "above", w: wAbove, dx: aboveLeft - (x - CHAR.w / 2), rect: { left: aboveLeft, right: aboveLeft + wAbove, top: y - CHAR.h - 8 - BUBBLE_H, bottom: y - CHAR.h - 8 } });
  if (preferAbove) above();
  const first = roomR >= roomL ? "right" : "left";
  side(first, first === "right" ? roomR : roomL);
  side(first === "right" ? "left" : "right", first === "right" ? roomL : roomR);
  if (!preferAbove) above();
  let best = cands[0]!;
  let bestArea = Infinity;
  for (const c of cands) {
    if (c.place !== "above" && c.w < 120) continue;
    let area = 0;
    for (const r of avoid) area += overlapArea(c.rect, r);
    if (area === 0) return c;
    if (area < bestArea) {
      bestArea = area;
      best = c;
    }
  }
  return best;
}

// ---- keyboard scope ----------------------------------------------------------

/** The slice of a DOM node `shouldHandleGuideKey` needs, so it is testable without a DOM. */
export type KeyTarget = {
  nodeName?: string;
  parentElement?: KeyTarget | null;
  getAttribute?: (name: string) => string | null;
  isContentEditable?: boolean;
  getBoundingClientRect?: () => { top: number; bottom: number };
};

const BODY_LIKE = new Set(["BODY", "HTML", "#DOCUMENT"]);
const FOCUSABLE_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT", "A", "BUTTON", "SUMMARY"]);
const OWN_KEY_ROLES = new Set(["button", "link", "radio", "menuitem", "tab", "slider", "checkbox", "option", "switch", "textbox", "combobox", "listbox", "searchbox", "spinbutton"]);

function isInside(node: KeyTarget | null | undefined, root: KeyTarget | null | undefined) {
  for (let n = node ?? null; n; n = n.parentElement ?? null) if (n === root) return true;
  return false;
}

/** Does this node (or an ancestor) keep its own keyboard behaviour: a field, a link, a button, a widget? */
function ownsKeys(node: KeyTarget | null | undefined) {
  for (let n = node ?? null; n; n = n.parentElement ?? null) {
    const name = (n.nodeName ?? "").toUpperCase();
    if (FOCUSABLE_TAGS.has(name)) return true;
    if (n.isContentEditable === true) return true;
    const ce = n.getAttribute?.("contenteditable");
    if (ce !== null && ce !== undefined && ce !== "false") return true;
    const role = n.getAttribute?.("role");
    if (role && OWN_KEY_ROLES.has(role)) return true;
  }
  return false;
}

/**
 * Should the character act on this key? The guide is always listening while it is
 * on screen, but a key that landed in an input, textarea, select, contenteditable,
 * or on a link / button / widget keeps its own behaviour, and a key pressed with
 * Ctrl / Meta / Alt / Shift is never ours. A key on the page itself (body) or on the guide
 * is ours. Only the keys the caller routes here (arrows, W) are ever claimed:
 * ArrowDown, Space and PageDown are never handled, so the page still scrolls.
 */
export function shouldHandleGuideKey(target: KeyTarget | null | undefined, guideEl: KeyTarget | null | undefined, event: { ctrlKey?: boolean; metaKey?: boolean; altKey?: boolean; shiftKey?: boolean }, viewportH?: number) {
  // Shift+arrow extends a text selection: always the browser's.
  if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return false;
  if (!target) return true;
  if (BODY_LIKE.has((target.nodeName ?? "").toUpperCase())) return true;
  if (isInside(target, guideEl)) return true;
  // Focus left behind on a radio whose group has scrolled off screen: the visitor is playing, not choosing.
  if (viewportH !== undefined && inOffscreenRadioGroup(target, viewportH)) return true;
  return !ownsKeys(target);
}

/** Is `node` inside a `role=radiogroup` that is entirely above or below the viewport? */
export function inOffscreenRadioGroup(node: KeyTarget | null | undefined, viewportH: number) {
  for (let n = node ?? null; n; n = n.parentElement ?? null) {
    if (n.getAttribute?.("role") !== "radiogroup") continue;
    const r = n.getBoundingClientRect?.();
    return !!r && (r.bottom <= 0 || r.top >= viewportH);
  }
  return false;
}

/** Page-px rects of reading text (`ink`) that sit in the band the body would fill above a standing edge, tagged by their element. */
export type Ink<E = unknown> = { el: E; rect: Rect };

/**
 * The ink the body box would cover when standing at `top`, ignoring the element it
 * stands on (and, with `inside`, anything within it). Cheap prefilter by height only.
 */
export function inkAbove<E>(ink: readonly Ink<E>[], top: number, own: E | null, inside?: (el: E, own: E) => boolean): Rect[] {
  const lo = top - CHAR.h;
  const out: Rect[] = [];
  for (const i of ink) {
    if (i.rect.bottom <= lo || i.rect.top >= top) continue;
    if (own !== null && (i.el === own || inside?.(i.el, own))) continue;
    out.push(i.rect);
  }
  return out;
}

/** Overlap area (px2) allowed before a spot counts as covering text (legacy area rule; see `INK_MARGIN`). */
export const INK_TOLERANCE = 120;
/** A text line counts as covered once the box overlaps it by more than this on BOTH axes. */
export const INK_MARGIN = 6;

/** Does `box` overlap any rect by more than `margin` px on both axes? */
export function boxHits(box: Rect, rects: readonly Rect[], margin = INK_MARGIN) {
  for (const r of rects) {
    if (Math.min(box.right, r.right) - Math.max(box.left, r.left) > margin && Math.min(box.bottom, r.bottom) - Math.max(box.top, r.top) > margin) return true;
  }
  return false;
}

/** Does the body (feet at x, y) visibly cover any of these text lines? */
export function bodyHits(x: number, y: number, rects: readonly Rect[]) {
  return boxHits(bodyRect(x, y), rects);
}

/** The one-time key hint above the head (page px). Left-aligned to the body, or right-aligned when near the right edge. */
export const HINT = { w: 168, h: 24, gap: 4 } as const;
export function hintRect(x: number, y: number, rightAligned: boolean, scale = 1): Rect {
  const top = y - CHAR.h * scale - HINT.gap - HINT.h;
  const left = rightAligned ? x + CHAR.w / 2 - HINT.w : x - CHAR.w / 2;
  return { left, right: left + HINT.w, top, bottom: top + HINT.h };
}

/** The keys the character claims, mapped to its actions. Anything else (ArrowDown, Space, PageDown, Enter) is left to the page. */
export function guideAction(key: string): "left" | "right" | "up" | null {
  switch (key) {
    case "ArrowLeft":
      return "left";
    case "ArrowRight":
      return "right";
    case "ArrowUp":
    case "w":
    case "W":
      return "up";
    default:
      return null;
  }
}

// ---- lines ---------------------------------------------------------------------

/**
 * The unsolicited line for arriving at `section`: line 1 from the role table, once
 * per section, at most MAX_PASSIVE_LINES in a visit. Null otherwise.
 */
export function nextLine(role: RoleId, section: GuideSpotId, visited: ReadonlySet<GuideSpotId>): string | null {
  if (visited.has(section) || visited.size >= MAX_PASSIVE_LINES) return null;
  return scriptFor(role, section)[0] ?? null;
}

// ---- the speech bubble follows the character ----------------------------------

/**
 * One step of a critically damped spring (semi-implicit Euler). `omega` is the natural
 * frequency (rad/s): it settles in about 4 / omega seconds and never overshoots much.
 */
export function springStep(p: number, v: number, target: number, omega: number, dt: number) {
  const a = omega * omega * (target - p) - 2 * omega * v;
  const nv = v + a * dt;
  return { p: p + nv * dt, v: nv } as const;
}

/**
 * Where the bubble's ANCHOR rests: the y of the surface the character stands on (page px).
 * Standing, it is the surface top (never the squash or the bob); in the air it keeps the
 * last standing y, so a jump never moves the bubble. Same surface = follow it exactly
 * (scroll on the floor, a hover lift); a new surface = ease there.
 */
export function bubbleAnchor(prev: { y: number; key: string | null }, body: { mode: "ground" | "air"; y: number; surface: string | null }) {
  if (body.mode !== "ground") return { y: prev.y, key: prev.key, snap: true } as const;
  return { y: body.y, key: body.surface, snap: body.surface === prev.key } as const;
}

/** Bubble rect (page px) for a centre x and a bottom y, clamped inside the viewport width. */
export function bubbleRectAt(cx: number, bottom: number, w: number, view: Pick<View, "w">): Rect {
  const left = Math.min(view.w - EDGE - w, Math.max(EDGE, cx - w / 2));
  return { left, right: left + w, top: bottom - BUBBLE_H, bottom };
}

/**
 * Visible lines that would cut through the body standing with its feet at `top`: every other
 * surface strictly above the feet and within the body height. Returned as thin rects so the
 * stand-x chooser treats them like tap targets: the body never rests UNDER a line with its head
 * poking above it. Same-height lines (within 1 px) are not "above".
 */
export function linesThroughBody(surfaces: readonly Surface[], top: number, ownKey: string | null): Rect[] {
  const out: Rect[] = [];
  for (const s of surfaces) {
    if (s.key === ownKey || s.top >= top - 1 || s.top < top - CHAR.h) continue;
    out.push({ left: s.left, right: s.right, top: s.top - 1, bottom: s.top + 1 });
  }
  return out;
}

/** Feet margin: the body stands on a line only when its centre is at least this far inside both ends. */
export const FEET_MARGIN = Math.round(CHAR.w / 4);
/** Can the body stand with its feet centred at `x` on this line (centre inside, half the feet's width of margin)? */
export function feetFit(s: Pick<Surface, "left" | "right">, x: number) {
  return x >= s.left + FEET_MARGIN && x <= s.right - FEET_MARGIN;
}
