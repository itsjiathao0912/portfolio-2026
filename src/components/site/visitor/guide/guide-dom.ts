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
import { CHAR, type GuidePage, type GuideSpotId, type Ink, MIN_SURFACE_W, type PageSpotId, type Rect, type Span, type Surface } from "./guide-logic";

/**
 * Candidates for a VISIBLY DRAWN top edge. A text line box or a transparent wrapper is never a
 * platform: only media, dividers, and boxes that paint something (background, top border,
 * shadow or outline) count. See `drawnEdge`.
 */
const SURFACE_SELECTOR = "img,svg,video,canvas,picture,iframe,hr,div,section,article,figure,aside,li,ul,ol,a,button,blockquote,table,form,[data-guide-surface]";
const MEDIA_TAGS = new Set(["IMG", "SVG", "VIDEO", "CANVAS", "PICTURE", "IFRAME"]);
/** Never stand on these: chrome, hidden or decorative subtrees, the marquee strips that slide sideways, and interactive pickers (role tiles) or the card stamp. */
const CHROME_SELECTOR = "header,nav,dialog,[inert],[hidden],[aria-hidden='true'],[data-guide-skip],[data-testid='section-logos'],[data-testid='proof-ticker'],.fixed,[role='radiogroup'],[role='radio'],[data-testid='visitor-title'],[data-testid='card-stamp']";
const SKIP_SELECTOR = CHROME_SELECTOR;
const MAX_SURFACES = 600;
const NEAR = 360; // px beyond the viewport that still gets refreshed each frame

const transparent = (c: string) => !c || c === "transparent" || /^rgba\([^)]*,\s*0(\.0+)?\s*\)$|\/\s*0(\.0+)?\s*\)$/.test(c);

/** r, g, b (0-255) and alpha (0-1) of a computed colour. */
const rgba = (c: string) => {
  const n = (c.match(/[\d.]+/g) ?? []).map(Number);
  return { c: n.slice(0, 3), a: n.length >= 4 ? n[3]! : 1 };
};
/** Smallest per-channel step (0-255) the eye reliably reads as an edge against the page. */
export const EDGE_CONTRAST = 16;
/**
 * Is fill `a`, as actually PAINTED over `b` (its alpha composited onto what is behind it), visibly
 * different from `b`? A 5% tint or a near-white band on white draws no edge the eye finds.
 */
export function distinct(a: string, b?: string) {
  if (!b) return true;
  const x = rgba(a);
  const y = rgba(b);
  if (x.c.length < 3 || y.c.length < 3) return a !== b;
  const painted = x.c.map((v, i) => v * x.a + y.c[i]! * (1 - x.a));
  return Math.max(...painted.map((v, i) => Math.abs(v - y.c[i]!))) >= EDGE_CONTRAST;
}

/** Does this element draw a top edge the eye can see? Media and dividers always do; a box only with a background, top border, shadow or outline. */
export function drawnEdge(tag: string, cs: CSSStyleDeclaration, behind?: string) {
  if (MEDIA_TAGS.has(tag.toUpperCase()) || tag.toUpperCase() === "HR") return true;
  // A fill the same colour as what is behind it draws no edge (a section painted "canvas" on a canvas page).
  const bg = (!transparent(cs.backgroundColor) && distinct(cs.backgroundColor, behind)) || (cs.backgroundImage !== "none" && cs.backgroundImage !== "");
  const border = Number.parseFloat(cs.borderTopWidth) > 0 && cs.borderTopStyle !== "none" && cs.borderTopStyle !== "hidden" && !transparent(cs.borderTopColor) && distinct(cs.borderTopColor, behind);
  // A whisper shadow (alpha under 0.1) draws no edge the eye finds on a same-colour page.
  const shadow = cs.boxShadow !== "none" && cs.boxShadow !== "" && shadowVisible(cs.boxShadow);
  const outline = Number.parseFloat(cs.outlineWidth) > 0 && cs.outlineStyle !== "none" && !transparent(cs.outlineColor) && distinct(cs.outlineColor, behind);
  return bg || border || shadow || outline;
}

/** Does a computed box-shadow have a layer strong enough to see (a colour with alpha >= 0.1)? */
export function shadowVisible(shadow: string) {
  const cols = shadow.match(/rgba?\([^)]*\)/g) ?? [];
  if (cols.length === 0) return true;
  return cols.some((c) => {
    const n = (c.match(/[\d.]+/g) ?? []).map(Number);
    return (n.length < 4 ? 1 : n[3]!) >= 0.1;
  });
}

/** The painted page colour: body, else html, else white. */
function pageFill() {
  for (const n of [document.body, document.documentElement]) {
    const c = getComputedStyle(n).backgroundColor;
    if (!transparent(c)) return c;
  }
  return "rgb(255, 255, 255)";
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

/** The spots on the case-study and about pages, by selector (their components stay untouched). Later entries nest inside earlier ones. */
export const PAGE_SPOTS: Record<GuidePage, readonly (readonly [PageSpotId, string])[]> = {
  home: [],
  case: [
    ["case-intro", "[data-testid='case-hero']"],
    ["case-body", "#case-body"],
    ["case-depth", "[data-testid='depth-bar']"],
    ["case-metric", "[data-testid='metrics']"],
    ["case-next", "[data-testid='next-project']"],
  ],
  about: [
    ["about-intro", "[data-testid='about'] > section:first-of-type"],
    ["about-career", "[data-testid='career-rail']"],
    ["about-experience", "[data-testid='section-experience']"],
    ["about-skills", "[data-testid='section-skills']"],
    ["about-recognition", "[data-testid='section-recognition']"],
  ],
};

/** The spot an element belongs to: a tagged home section, else the innermost page spot containing it. */
function spotOf(el: Element, page: GuidePage): GuideSpotId | null {
  const sec = el.closest<HTMLElement>("[data-guide-id]")?.dataset.guideId;
  if (isSection(sec)) return sec;
  let best: { id: PageSpotId; n: Element } | null = null;
  for (const [id, sel] of PAGE_SPOTS[page]) {
    const n = el.closest(sel);
    if (n && (!best || best.n.contains(n))) best = { id, n };
  }
  return best?.id ?? null;
}

/** Collect the standable blocks under the given roots. `guideRoot` is excluded. */
export function collectTracked(roots: readonly Element[], guideRoot: Element | null, scrollY: number, vw: number, page: GuidePage = "home"): Tracked[] {
  const out: Tracked[] = [];
  const drawn = new Map<Element, boolean>();
  const fills = new Map<Element, string>();
  // The colour showing behind an element: the nearest ancestor's opaque fill, else the page's.
  const behindOf = (el: Element): string => {
    const a = el.parentElement;
    if (!a || a === document.body || a === document.documentElement) return pageFill();
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
      const surface: Surface = { key: keyOf(el), id: spotOf(el, page), left: Math.max(0, r.left), right: Math.min(vw, r.right), top: r.top + scrollY };
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
export function readSpans(scrollY: number, page: GuidePage = "home"): Span[] {
  const out: Span[] = [];
  for (const [id, sel] of PAGE_SPOTS[page]) {
    const n = document.querySelector(sel);
    const r = n?.getBoundingClientRect();
    if (r && r.height > 0) out.push({ id, top: r.top + scrollY, bottom: r.bottom + scrollY });
  }
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
  document.querySelectorAll<HTMLElement>("a[href], button, [role='button'], [role='radio'], input, textarea, select, summary, [data-testid='card-stamp']").forEach((n) => {
    if (guideRoot.contains(n)) return;
    const r = n.getBoundingClientRect();
    if (r.width < 2 || r.height < 2 || r.bottom < -vh || r.top > vh * 2 + CHAR.h) return;
    out.push({ left: r.left, right: r.right, top: r.top + scrollY, bottom: r.bottom + scrollY });
  });
  return out;
}

/** The page's main content, per guide page. */
export const PAGE_ROOT: Record<GuidePage, string> = { home: '[data-testid="home"]', case: '[data-testid="case-study"]', about: '[data-testid="about"]' };

/** The roots whose descendants may be stood on: the page content plus the footer contact block. */
export function guideRoots(page: GuidePage = "home"): Element[] {
  const roots: Element[] = [];
  const home = document.querySelector(PAGE_ROOT[page]);
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
