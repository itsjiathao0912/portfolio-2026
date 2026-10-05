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
const SURFACE_SELECTOR = "img,svg,video,canvas,picture,iframe,hr,div,section,article,figure,aside,li,ul,ol,a,button,blockquote,table,form";
const MEDIA_TAGS = new Set(["IMG", "SVG", "VIDEO", "CANVAS", "PICTURE", "IFRAME"]);
/** Never stand on these: chrome, hidden or decorative subtrees, the marquee strips that slide sideways, and interactive pickers (role tiles) or the card stamp. */
const CHROME_SELECTOR = "header,nav,dialog,[inert],[hidden],[aria-hidden='true'],[data-guide-skip],[data-testid='section-logos'],[data-testid='proof-ticker'],.fixed,[role='radiogroup'],[role='radio'],[data-testid='visitor-title'],[data-testid='card-stamp']";
const SKIP_SELECTOR = CHROME_SELECTOR;
const MAX_SURFACES = 900;
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

/** Is this element rendered at all (display, visibility, effective opacity up the tree)? */
export function rendered(el: Element, cs: CSSStyleDeclaration) {
  if (cs.display === "none" || cs.visibility === "hidden" || Number.parseFloat(cs.opacity) < 0.05) return false;
  const cv = (el as Element & { checkVisibility?: (o: object) => boolean }).checkVisibility;
  return cv ? cv.call(el, { opacityProperty: true, visibilityProperty: true, contentVisibilityAuto: true }) : true;
}

/**
 * Pure: the glyph top of a text line, from its content-area box (a Range rect). The box top
 * is the font's ascent line; the baseline sits ~80% down it and capitals rise ~0.72 em above
 * the baseline, so the feet land on the letters, not on the air above them.
 */
export function capTop(lineTop: number, lineHeight: number, fontSize: number) {
  const t = lineTop + lineHeight * 0.8 - fontSize * 0.72;
  return Math.min(lineTop + lineHeight / 2, Math.max(lineTop, t));
}

let metricCtx: CanvasRenderingContext2D | null | undefined;
const metricCache = new Map<string, number | null>();
/**
 * The glyph top of a line from real font metrics: the Range rect top is the font's ascent line,
 * so capitals start (fontAscent - capAscent) below it. Measured once per font via canvas;
 * falls back to the `capTop` estimate when canvas metrics are unavailable.
 */
export function glyphTop(lineTop: number, lineHeight: number, cs: CSSStyleDeclaration) {
  const fs = Number.parseFloat(cs.fontSize) || 16;
  const font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  let off = metricCache.get(font);
  if (off === undefined) {
    if (metricCtx === undefined) metricCtx = typeof document !== "undefined" ? document.createElement("canvas").getContext("2d") : null;
    off = null;
    if (metricCtx) {
      metricCtx.font = font;
      const m = metricCtx.measureText("H");
      if (m.fontBoundingBoxAscent && m.actualBoundingBoxAscent) off = m.fontBoundingBoxAscent - m.actualBoundingBoxAscent;
    }
    metricCache.set(font, off);
  }
  return off == null ? capTop(lineTop, lineHeight, fs) : Math.min(lineTop + lineHeight / 2, Math.max(lineTop, lineTop + off));
}

/** Pure: the first rendered line out of a text block's client rects (in document order): same top +-2 px, unioned. */
export function firstLine(rects: readonly { left: number; right: number; top: number; height: number; width: number }[]) {
  let line: { left: number; right: number; top: number; height: number } | null = null;
  for (const q of rects) {
    if (q.width <= 1 || q.height <= 4) continue;
    if (!line) line = { left: q.left, right: q.right, top: q.top, height: q.height };
    else if (Math.abs(q.top - line.top) <= 2) {
      line.left = Math.min(line.left, q.left);
      line.right = Math.max(line.right, q.right);
      line.height = Math.max(line.height, q.height);
    } else if (q.top > line.top + 2) break;
  }
  return line;
}

export type TextLine = { left: number; right: number; top: number; bottom: number; lineHeight: number };

/**
 * Pure: which text lines are the TOP line of their text cluster. Stacked text blocks (heading +
 * paragraph, consecutive paragraphs, list items, label + value) read as one cluster; only its
 * topmost line is a surface, so the guide never hops line to line down a column of text.
 * A line is dropped when any cluster line sits above it with horizontal overlap and a vertical gap
 * (that block's bottom to this line's top) under 1.5x this line's height. Returns kept indices.
 */
export function clusterTops(lines: readonly TextLine[]) {
  const order = lines.map((_, i) => i).sort((a, b) => lines[a].top - lines[b].top);
  const kept: number[] = [];
  for (const i of order) {
    const l = lines[i];
    const covered = order.some((j) => {
      if (j === i) return false;
      const o = lines[j];
      if (o.top >= l.top) return false;
      if (Math.min(o.right, l.right) - Math.max(o.left, l.left) <= 0) return false;
      return l.top - o.bottom < 1.5 * l.lineHeight;
    });
    if (!covered) kept.push(i);
  }
  return kept.sort((a, b) => a - b);
}

/** Elements whose text reads as one block (a heading, a paragraph, a label, a stat). */
const TEXT_BLOCK = "h1,h2,h3,h4,h5,h6,p,li,dt,dd,blockquote,figcaption,label,button,a,td,th,[data-guide-text]";

export type Tracked = {
  el: Element;
  surface: Surface;
  /** offsets of the standable line from the element's border box (px) */
  relL: number;
  relR: number;
  relT: number;
  /** "box" = a drawn edge; "text" = the glyph top of the first line of a text block with no drawn container */
  kind: "box" | "text";
  /** covered by another opaque box at its edge; undefined = not checked yet (only checked in view) */
  covered?: boolean;
};

export type SurfaceCache = { tracked: Tracked[]; ink: Ink<Element>[]; avoid: Rect[]; ms: number; boxes: number; texts: number };

/**
 * The expensive pass: analyse the WHOLE page once (idle after load, then only after a resize or
 * a DOM change) and cache every standable line in page px with its offset from its element, so
 * a scroll only re-reads rects and never re-runs any style heuristics.
 * Rules: a box counts only when it is rendered and draws a visible top edge (fill that differs
 * from what is painted behind it, a top border, shadow, outline, or media / hr) and is not
 * nested inside a smaller drawn card. A text block whose container draws no edge offers the
 * glyph top of its first line instead; the invisible container itself never does.
 */
export function analyseSurfaces(roots: readonly Element[], guideRoot: Element | null, scrollY: number, vw: number, page: GuidePage = "home"): SurfaceCache {
  const t0 = performance.now();
  const out: Tracked[] = [];
  const styles = new Map<Element, CSSStyleDeclaration>();
  const css = (el: Element) => {
    let c = styles.get(el);
    if (!c) {
      c = getComputedStyle(el);
      styles.set(el, c);
    }
    return c;
  };
  const drawn = new Map<Element, boolean>();
  const fills = new Map<Element, string>();
  const rects = new Map<Element, DOMRect>();
  const rectOf = (el: Element) => {
    let r = rects.get(el);
    if (!r) {
      r = el.getBoundingClientRect();
      rects.set(el, r);
    }
    return r;
  };
  const behindOf = (el: Element): string => {
    const a = el.parentElement;
    if (!a || a === document.body || a === document.documentElement) return pageFill();
    let f = fills.get(a);
    if (f === undefined) {
      const c = css(a).backgroundColor;
      f = transparent(c) ? behindOf(a) : c;
      fills.set(a, f);
    }
    return f;
  };
  const isDrawn = (el: Element) => {
    let v = drawn.get(el);
    if (v === undefined) {
      const cs = css(el);
      v = rendered(el, cs) && drawnEdge(el.tagName, cs, behindOf(el));
      drawn.set(el, v);
    }
    return v;
  };
  const skipped = new Map<Element, boolean>();
  const skip = (el: Element) => {
    let v = skipped.get(el);
    if (v === undefined) {
      v = !!guideRoot?.contains(el) || !!el.closest(SKIP_SELECTOR) || (el.closest("svg") !== el && !!el.closest("svg"));
      skipped.set(el, v);
    }
    return v;
  };
  // The nearest drawn ancestor that is a card (narrower than the page): its top edge is the platform, nothing inside it is.
  const cardAbove = (el: Element, root: Element, top: number) => {
    for (let a = el.parentElement; a && a !== root.parentElement; a = a.parentElement) {
      if (!isDrawn(a)) continue;
      const ar = rectOf(a);
      if (ar.width < vw * 0.92 && top - ar.top > 1) return true;
    }
    return false;
  };
  let boxes = 0;
  let texts = 0;
  const textLines = new Map<Tracked, TextLine>();
  for (const root of roots) {
    for (const el of root.querySelectorAll(SURFACE_SELECTOR)) {
      if (out.length >= MAX_SURFACES) break;
      if (skip(el)) continue;
      const r = rectOf(el);
      if (r.width < MIN_SURFACE_W || r.height < (el.tagName === "HR" ? 0.5 : 2)) continue;
      if (!isDrawn(el) || cardAbove(el, root, r.top)) continue;
      out.push({ el, kind: "box", surface: { key: keyOf(el), id: spotOf(el, page), left: Math.max(0, r.left), right: Math.min(vw, r.right), top: r.top + scrollY }, relL: 0, relR: r.width, relT: 0 });
      boxes++;
    }
    // Text: the first line of each text block whose container draws no edge.
    const range = document.createRange();
    const done = new Set<Element>();
    const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let n = walk.nextNode(); n; n = walk.nextNode()) {
      if (out.length >= MAX_SURFACES) break;
      const parent = n.parentElement;
      if (!parent || !n.textContent?.trim()) continue;
      const owner = parent.closest(TEXT_BLOCK) ?? parent;
      if (done.has(owner) || !root.contains(owner)) continue;
      done.add(owner);
      if (skip(owner) || isDrawn(owner) || !rendered(parent, css(parent))) continue;
      // The owner's own text nodes, in order, until the first line ends.
      const lineRects: DOMRect[] = [];
      const inner = document.createTreeWalker(owner, NodeFilter.SHOW_TEXT);
      let firstTop = Number.NaN;
      for (let m = inner.nextNode(); m; m = inner.nextNode()) {
        if (!m.textContent?.trim()) continue;
        range.selectNodeContents(m);
        const qs = [...range.getClientRects()];
        if (qs.length === 0) continue;
        if (Number.isNaN(firstTop)) firstTop = qs.find((q) => q.width > 1 && q.height > 4)?.top ?? Number.NaN;
        lineRects.push(...qs);
        if (qs.some((q) => q.top > firstTop + 2)) break;
      }
      const line = firstLine(lineRects);
      if (!line || line.right - line.left < MIN_SURFACE_W) continue;
      if (cardAbove(owner, root, line.top)) continue;
      const fs = Number.parseFloat(css(parent).fontSize) || 16;
      const top = glyphTop(line.top, line.height, css(parent));
      const or = rectOf(owner);
      const t: Tracked = { el: owner, kind: "text", surface: { key: keyOf(owner), id: spotOf(owner, page), left: Math.max(0, line.left), right: Math.min(vw, line.right), top: top + scrollY }, relL: line.left - or.left, relR: line.right - or.left, relT: top - or.top };
      out.push(t);
      textLines.set(t, { left: or.left, right: or.right, top: line.top + scrollY, bottom: or.bottom + scrollY, lineHeight: Math.max(line.height, fs) });
      texts++;
    }
    range.detach();
  }
  // Text clusters: keep only the topmost line of each stack of text blocks.
  const textEntries = out.filter((t) => t.kind === "text");
  const keepText = new Set(clusterTops(textEntries.map((t) => textLines.get(t)!)).map((i) => textEntries[i]));
  const clustered = out.filter((t) => t.kind !== "text" || keepText.has(t));
  texts = keepText.size;
  // Two lines sharing one edge are one platform: keep the first (boxes come first).
  const dedup: Tracked[] = [];
  for (const t of clustered) {
    const s = t.surface;
    if (dedup.some((d) => Math.abs(d.surface.top - s.top) < 1.5 && Math.abs(d.surface.left - s.left) < 4 && Math.abs(d.surface.right - s.right) < 4)) continue;
    dedup.push(t);
  }
  dedup.sort((a, b) => a.surface.top - b.surface.top);
  const ink = readInk(roots, guideRoot, scrollY, Number.POSITIVE_INFINITY);
  const avoid = guideRoot ? readAvoid(guideRoot, scrollY, Number.POSITIVE_INFINITY) : [];
  return { tracked: dedup, ink, avoid, ms: performance.now() - t0, boxes, texts };
}

/** Tag analysed elements (`data-guide-surface="box" | "text"`) after all reads; untag ones that dropped out. Returns the new tagged set. */
export function markSurfaces(tracked: readonly Tracked[], prev: ReadonlySet<Element>) {
  const next = new Set<Element>();
  for (const t of tracked) {
    next.add(t.el);
    if ((t.el as HTMLElement).dataset.guideSurface !== t.kind) (t.el as HTMLElement).dataset.guideSurface = t.kind;
  }
  for (const el of prev) if (!next.has(el)) (el as HTMLElement).removeAttribute("data-guide-surface");
  return next;
}

/** Covered by an opaque box right at its edge? Checked lazily, only for surfaces in view, once per analysis. */
export function checkCover(tracked: readonly Tracked[], scrollY: number, vw: number, vh: number) {
  const fill = pageFill();
  for (const t of tracked) {
    if (t.covered !== undefined) continue;
    const y = t.surface.top - scrollY;
    if (y < 0 || y >= vh - 2) continue;
    const x = Math.min(vw - 1, Math.max(0, (t.surface.left + t.surface.right) / 2));
    const hit = document.elementFromPoint(x, y + 1);
    let covered = false;
    if (hit && hit !== t.el && !t.el.contains(hit) && !hit.contains(t.el) && !hit.closest(SKIP_SELECTOR)) {
      const cs = getComputedStyle(hit);
      covered = rendered(hit, cs) && drawnEdge(hit.tagName, cs, fill);
    }
    t.covered = covered;
  }
}

/** Re-read nearby elements and update their surfaces in place (page px). */
export function refreshSurfaces(tracked: readonly Tracked[], scrollY: number, vw: number, vh: number, onlyKey?: string | null) {
  const lo = scrollY - NEAR;
  const hi = scrollY + vh + NEAR;
  for (const t of tracked) {
    const s = t.surface;
    if (onlyKey !== undefined ? s.key !== onlyKey : s.top < lo - 200 || s.top > hi + 200) continue;
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
