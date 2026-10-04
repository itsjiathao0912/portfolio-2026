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

/** One standable top edge, in page px. `key` is stable across re-measures. */
export type Surface = { key: string; id: GuideSectionId | null; left: number; right: number; top: number };

/** A tagged home section's vertical span in page px (what the visitor is "reading"). */
export type Span = { id: GuideSectionId; top: number; bottom: number };

/** The window onto the page: size, scroll offset, document height and the fixed nav band's bottom (viewport px). */
export type View = { w: number; h: number; scrollY: number; docH: number; nav: number };

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
/** Surfaces narrower than this are not worth standing on. */
export const MIN_SURFACE_W = 56;

/** The home sections the guide may talk about, in page order (always <= 6). */
export const GUIDE_SECTIONS: readonly GuideSectionId[] = GUIDE_SECTION_IDS;

/** Smallest viewport y the FEET may be at: the head must clear the nav band. */
export function minFeetY(view: Pick<View, "nav">) {
  return (view.nav > 0 ? view.nav + KEEP_GAP : EDGE) + CHAR.h;
}

/** Largest viewport y the feet may be at: the "floor" of the viewport. */
export function maxFeetY(view: Pick<View, "h">) {
  return view.h - EDGE;
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

/** The page-space y of the viewport floor. */
export function floorY(view: View) {
  return view.scrollY + maxFeetY(view);
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
export function sectionUnder(spans: readonly Span[], y: number): GuideSectionId | null {
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
 * Ctrl / Meta / Alt is never ours. A key on the page itself (body) or on the guide
 * is ours. Only the keys the caller routes here (arrows, W) are ever claimed:
 * ArrowDown, Space and PageDown are never handled, so the page still scrolls.
 */
export function shouldHandleGuideKey(target: KeyTarget | null | undefined, guideEl: KeyTarget | null | undefined, event: { ctrlKey?: boolean; metaKey?: boolean; altKey?: boolean }) {
  if (event.ctrlKey || event.metaKey || event.altKey) return false;
  if (!target) return true;
  if (BODY_LIKE.has((target.nodeName ?? "").toUpperCase())) return true;
  if (isInside(target, guideEl)) return true;
  return !ownsKeys(target);
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
export function nextLine(role: RoleId, section: GuideSectionId, visited: ReadonlySet<GuideSectionId>): string | null {
  if (visited.has(section) || visited.size >= MAX_PASSIVE_LINES) return null;
  return scriptFor(role, section)[0] ?? null;
}
