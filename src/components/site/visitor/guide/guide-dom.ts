// Walking guide: the only module that reads the DOM for geometry.
//
// Two phases, so the physics loop never pays for layout:
// 1. `collectTracked` (rare: load, resize, scroll settle) finds the visible content
//    blocks, and for text blocks measures where the first line of glyphs really is
//    (cap height, tight width) RELATIVE to the element box.
// 2. `refreshSurfaces` (once per animation frame while scrolling or moving) reads one
//    bounding rect per nearby element and applies the cached offsets, writing page-px
//    surfaces in place. Elements far from the viewport keep their last position.

import { GUIDE_SECTION_IDS, type GuideSectionId } from "../role-ids";
import { CHAR, type Ink, MIN_SURFACE_W, type Rect, type Span, type Surface } from "./guide-logic";

const TEXT_TAGS = new Set(["H1", "H2", "H3", "P"]);
/** Headings, paragraphs, images, buttons, cards (article / figure) and anything tagged `data-guide-surface`. */
const SURFACE_SELECTOR = "h1,h2,h3,p,img,button,article,figure,[data-guide-surface]";
/** Never stand on these: chrome, hidden or decorative subtrees, and the marquee strips that slide sideways. */
const SKIP_SELECTOR = "header,nav,dialog,[inert],[hidden],[aria-hidden='true'],[data-guide-skip],[data-testid='section-logos'],[data-testid='proof-ticker'],.fixed";
const MAX_SURFACES = 320;
const CAP_OFFSET = 0.22; // cap-height top is ~0.22em below the inline box top for this type
const NEAR = 360; // px beyond the viewport that still gets refreshed each frame

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
  const seen = new Set<Element>();
  const out: Tracked[] = [];
  const range = document.createRange();
  for (const root of roots) {
    for (const el of root.querySelectorAll(SURFACE_SELECTOR)) {
      if (out.length >= MAX_SURFACES) break;
      if (seen.has(el) || guideRoot?.contains(el) || el.closest(SKIP_SELECTOR)) continue;
      seen.add(el);
      const r = el.getBoundingClientRect();
      if (r.width < MIN_SURFACE_W || r.height < 14) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === "hidden" || cs.display === "none" || Number.parseFloat(cs.opacity) < 0.05) continue;

      let relL = 0;
      let relR = r.width;
      let relT = 0;
      if (TEXT_TAGS.has(el.tagName)) {
        range.selectNodeContents(el);
        const rects = [...range.getClientRects()].filter((q) => q.width > 3 && q.height > 6);
        if (rects.length > 0) {
          const top = Math.min(...rects.map((q) => q.top));
          const line = rects.filter((q) => q.top - top < q.height * 0.5);
          // A little forgiving on both ends: feet may overhang the last letter.
          relL = Math.min(...line.map((q) => q.left)) - r.left - 20;
          relR = Math.max(...line.map((q) => q.right)) - r.left + 20;
          relT = top - r.top + Number.parseFloat(cs.fontSize) * CAP_OFFSET;
        }
      }
      if (relR - relL < MIN_SURFACE_W) continue;

      const sec = el.closest<HTMLElement>("[data-guide-id]")?.dataset.guideId;
      const surface: Surface = {
        key: keyOf(el),
        id: isSection(sec) ? sec : null,
        left: Math.max(0, r.left + relL),
        right: Math.min(vw, r.left + relR),
        top: r.top + scrollY + relT,
      };
      out.push({ el, surface, relL, relR, relT });
    }
  }
  range.detach();
  // Two blocks sharing one edge (a card and the heading flush at its top) are one platform: keep the first.
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

const INK_SELECTOR = "h1,h2,h3,p,figcaption";
const INK_LEAF = "[data-testid='visitor-stats-strip']";

/**
 * Where reading text really is (tight line boxes, page px): headings, paragraphs,
 * captions and the live stat numbers. The body must not stand in front of these.
 */
export function readInk(roots: readonly Element[], guideRoot: Element | null, scrollY: number): Ink<Element>[] {
  const out: Ink<Element>[] = [];
  const range = document.createRange();
  const push = (el: Element, r: { left: number; right: number; top: number; bottom: number }) => out.push({ el, rect: { left: r.left, right: r.right, top: r.top + scrollY, bottom: r.bottom + scrollY } });
  for (const root of roots) {
    for (const el of root.querySelectorAll(INK_SELECTOR)) {
      if (guideRoot?.contains(el) || el.closest(SKIP_SELECTOR)) continue;
      const box = el.getBoundingClientRect();
      if (box.width < 2 || box.height < 2) continue;
      range.selectNodeContents(el);
      for (const q of range.getClientRects()) if (q.width > 3 && q.height > 6) push(el, q);
    }
    for (const strip of root.querySelectorAll(INK_LEAF)) {
      for (const leaf of strip.querySelectorAll("*")) {
        if (leaf.children.length > 0 || !leaf.textContent?.trim()) continue;
        range.selectNodeContents(leaf);
        for (const q of range.getClientRects()) if (q.width > 3 && q.height > 6) push(strip, q);
      }
    }
  }
  range.detach();
  return out;
}
