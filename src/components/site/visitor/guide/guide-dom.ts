// Walking guide: the only module that reads the DOM for geometry.
//
// Two phases, so the physics loop never pays for layout:
// 1. `collectTracked` (rare: load, resize, scroll settle) finds the visible content
//    blocks, and for text blocks measures where the first line of glyphs really is
//    (glyph-box top, tight width) RELATIVE to the element box.
// 2. `refreshSurfaces` (once per animation frame while scrolling or moving) reads one
//    bounding rect per nearby element and applies the cached offsets, writing page-px
//    surfaces in place. Elements far from the viewport keep their last position.

import { GUIDE_SECTION_IDS, type GuideSectionId } from "../role-ids";
import { CHAR, type Ink, MIN_SURFACE_W, type Rect, type Span, type Surface } from "./guide-logic";

/**
 * Candidates for a VISIBLY DRAWN top edge. A text line box or a transparent wrapper is never a
 * platform: only media, dividers, and boxes that paint something (background, top border,
 * shadow or outline) count. See `drawnEdge`.
 */
const SURFACE_SELECTOR = "img,svg,video,canvas,picture,iframe,hr,div,section,article,figure,aside,li,ul,ol,a,button,blockquote,table,form,[role='radio'],[data-guide-surface]";
const MEDIA_TAGS = new Set(["IMG", "SVG", "VIDEO", "CANVAS", "PICTURE", "IFRAME"]);
/** Never stand on these: chrome, hidden or decorative subtrees, and the marquee strips that slide sideways. */
const CHROME_SELECTOR = "header,nav,dialog,[inert],[hidden],[aria-hidden='true'],[data-guide-skip],[data-testid='section-logos'],[data-testid='proof-ticker'],.fixed";
const SKIP_SELECTOR = CHROME_SELECTOR;
const MAX_SURFACES = 600;
const NEAR = 360; // px beyond the viewport that still gets refreshed each frame

const transparent = (c: string) => !c || c === "transparent" || /^rgba\([^)]*,\s*0(\.0+)?\s*\)$|\/\s*0(\.0+)?\s*\)$/.test(c);

const rgb = (c: string) => (c.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
/** Is fill `a` visibly different from `b` (some channel differs by at least 12/255)? A near-white band on white draws no edge the eye finds. */
export function distinct(a: string, b?: string) {
  if (!b) return true;
  const x = rgb(a);
  const y = rgb(b);
  if (x.length < 3 || y.length < 3) return a !== b;
  return Math.max(...x.map((v, i) => Math.abs(v - y[i]!))) >= 12;
}

/** Does this element draw a top edge the eye can see? Media and dividers always do; a box only with a background, top border, shadow or outline. */
export function drawnEdge(tag: string, cs: CSSStyleDeclaration, behind?: string) {
  if (MEDIA_TAGS.has(tag.toUpperCase()) || tag.toUpperCase() === "HR") return true;
  // A fill the same colour as what is behind it draws no edge (a section painted "canvas" on a canvas page).
  const bg = (!transparent(cs.backgroundColor) && distinct(cs.backgroundColor, behind)) || (cs.backgroundImage !== "none" && cs.backgroundImage !== "");
  const border = Number.parseFloat(cs.borderTopWidth) > 0 && cs.borderTopStyle !== "none" && cs.borderTopStyle !== "hidden" && !transparent(cs.borderTopColor);
  const shadow = cs.boxShadow !== "none" && cs.boxShadow !== "";
  const outline = Number.parseFloat(cs.outlineWidth) > 0 && cs.outlineStyle !== "none" && !transparent(cs.outlineColor);
  return bg || border || shadow || outline;
}

export type Tracked = {
  el: Element;
  surface: Surface;
  /** offsets of the standable line from the element's border box (px) */
  relL: number;
  relR: number;
  relT: number;
};

const keys = new WeakMap<Element, string>();
let counter = 0;
const keyOf = (el: Element) => {
  let k = keys.get(el);
  if (!k) {
    k = `s${++counter}`;
    keys.set(el, k);
  }
  return k;
};

const isSection = (v: string | undefined): v is GuideSectionId => !!v && (GUIDE_SECTION_IDS as readonly string[]).includes(v);

/** Collect the standable blocks under the given roots. `guideRoot` is excluded. */
export function collectTracked(roots: readonly Element[], guideRoot: Element | null, scrollY: number, vw: number): Tracked[] {
  const out: Tracked[] = [];
  const drawn = new Map<Element, boolean>();
  const fills = new Map<Element, string>();
  // The colour showing behind an element: the nearest ancestor's opaque fill, else the page's.
  const behindOf = (el: Element): string => {
    const a = el.parentElement;
    if (!a) return getComputedStyle(document.body).backgroundColor;
    let f = fills.get(a);
    if (f === undefined) {
      const c = getComputedStyle(a).backgroundColor;
      f = transparent(c) ? behindOf(a) : c;
      fills.set(a, f);
    }
    return f;
  };
  const isDrawn = (el: Element) => {
    let v = drawn.get(el);
    if (v === undefined) {
      const cs = getComputedStyle(el);
      v = cs.display !== "none" && cs.visibility !== "hidden" && Number.parseFloat(cs.opacity) >= 0.05 && drawnEdge(el.tagName, cs, behindOf(el));
      drawn.set(el, v);
    }
    return v;
  };
  for (const root of roots) {
    for (const el of root.querySelectorAll(SURFACE_SELECTOR)) {
      if (out.length >= MAX_SURFACES) break;
      if (guideRoot?.contains(el) || el.closest(SKIP_SELECTOR) || el.closest("svg") !== el && el.closest("svg")) continue;
      const r = el.getBoundingClientRect();
      if (r.width < MIN_SURFACE_W || r.height < (el.tagName === "HR" ? 0.5 : 2)) continue;
      if (!isDrawn(el)) continue;
      // Never inside a card: an edge within a drawn (non page-wide) box would put the body inside that box.
      let inside = false;
      for (let a = el.parentElement; a && a !== root.parentElement; a = a.parentElement) {
        if (!isDrawn(a)) continue;
        const ar = a.getBoundingClientRect();
        if (ar.width < vw * 0.92 && r.top - ar.top > 1) {
          inside = true;
          break;
        }
      }
      if (inside) continue;
      // Covered by another opaque box right at its edge (in view only; off screen it is re-checked on the next collect).
      if (r.top >= 0 && r.top < window.innerHeight - 2) {
        const hit = document.elementFromPoint(Math.min(vw - 1, Math.max(0, (Math.max(0, r.left) + Math.min(vw, r.right)) / 2)), r.top + 1);
        if (hit && hit !== el && !el.contains(hit) && !hit.contains(el) && isDrawn(hit) && !hit.closest(SKIP_SELECTOR)) continue;
      }
      const sec = el.closest<HTMLElement>("[data-guide-id]")?.dataset.guideId;
      const surface: Surface = { key: keyOf(el), id: isSection(sec) ? sec : null, left: Math.max(0, r.left), right: Math.min(vw, r.right), top: r.top + scrollY };
      out.push({ el, surface, relL: 0, relR: r.width, relT: 0 });
    }
  }
  // Two boxes sharing one edge are one platform: keep the first.
  const dedup: Tracked[] = [];
  for (const t of out) {
    const s = t.surface;
    if (dedup.some((d) => Math.abs(d.surface.top - s.top) < 1.5 && Math.abs(d.surface.left - s.left) < 4 && Math.abs(d.surface.right - s.right) < 4)) continue;
    dedup.push(t);
  }
  return dedup.sort((a, b) => a.surface.top - b.surface.top);
}

/** Re-read nearby elements and update their surfaces in place (page px). */
export function refreshSurfaces(tracked: readonly Tracked[], scrollY: number, vw: number, vh: number) {
  const lo = scrollY - NEAR;
  const hi = scrollY + vh + NEAR;
  for (const t of tracked) {
    const s = t.surface;
    if (s.top < lo - 200 || s.top > hi + 200) continue;
    const r = t.el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    s.left = Math.max(0, r.left + t.relL);
    s.right = Math.min(vw, r.left + t.relR);
    s.top = r.top + scrollY + t.relT;
  }
}

/** Tagged sections' vertical spans in page px. */
export function readSpans(scrollY: number): Span[] {
  const out: Span[] = [];
  document.querySelectorAll<HTMLElement>("[data-guide-walkable]").forEach((n) => {
    const id = n.dataset.guideId;
    if (!isSection(id)) return;
    const r = n.getBoundingClientRect();
    if (r.height > 0) out.push({ id, top: r.top + scrollY, bottom: r.bottom + scrollY });
  });
  return out.sort((a, b) => a.top - b.top);
}

/** Bottom of the fixed nav band in viewport px (0 when there is none). */
export function readNav() {
  const header = document.querySelector("header[data-compact]");
  return header ? header.getBoundingClientRect().bottom : 0;
}

/** Page-px rects of tap targets within a screen or so of the viewport, so the character can pick a standing x that does not cover them. */
export function readAvoid(guideRoot: Element, scrollY: number, vh: number): Rect[] {
  const out: Rect[] = [];
  document.querySelectorAll<HTMLElement>("a[href], button, [role='button'], input, textarea, select, summary").forEach((n) => {
    if (guideRoot.contains(n)) return;
    const r = n.getBoundingClientRect();
    if (r.width < 2 || r.height < 2 || r.bottom < -vh || r.top > vh * 2 + CHAR.h) return;
    out.push({ left: r.left, right: r.right, top: r.top + scrollY, bottom: r.bottom + scrollY });
  });
  return out;
}

/** The roots whose descendants may be stood on: the home content plus the footer contact block. */
export function guideRoots(): Element[] {
  const roots: Element[] = [];
  const home = document.querySelector('[data-testid="home"]');
  if (home) roots.push(home);
  const contact = document.getElementById("get-in-touch");
  if (contact && !home?.contains(contact)) roots.push(contact);
  return roots;
}

/** Text the reading eye lands on even inside skipped chrome-free blocks: role tile labels count as ink too. */
const INK_SKIP = "header,nav,dialog,[inert],[hidden],[data-guide-skip],[data-testid='section-logos'],[data-testid='proof-ticker'],.fixed";

/**
 * Where reading text really is (tight line boxes, page px): every visible text run
 * under the roots (headings, paragraphs, card titles, list items, stat numbers,
 * tile labels). Tagged by the text's parent element. The body must not stand in
 * front of these; `own` exclusion is by containment (see `inkAbove`).
 * Only text within ~1.5 screens of the viewport is read, to keep it cheap.
 */
export function readInk(roots: readonly Element[], guideRoot: Element | null, scrollY: number, vh = window.innerHeight): Ink<Element>[] {
  const out: Ink<Element>[] = [];
  const range = document.createRange();
  const lo = -vh * 1.5;
  const hi = vh * 2.5;
  const skipCache = new Map<Element, boolean>();
  const skipped = (el: Element) => {
    let v = skipCache.get(el);
    if (v === undefined) {
      v = !!guideRoot?.contains(el) || !!el.closest(INK_SKIP);
      skipCache.set(el, v);
    }
    return v;
  };
  for (const root of roots) {
    const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let n = walk.nextNode(); n; n = walk.nextNode()) {
      const el = n.parentElement;
      if (!el || !n.textContent?.trim() || skipped(el)) continue;
      range.selectNodeContents(n);
      for (const q of range.getClientRects()) {
        if (q.width <= 3 || q.height <= 6 || q.bottom < lo || q.top > hi) continue;
        out.push({ el, rect: { left: q.left, right: q.right, top: q.top + scrollY, bottom: q.bottom + scrollY } });
      }
    }
  }
  range.detach();
  return out;
}
