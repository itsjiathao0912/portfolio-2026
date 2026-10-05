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
const SURFACE_SELECTOR = "img,svg,video,canvas,picture,iframe,hr,div,section,article,figure,aside,li,ul,ol,a,button,blockquote,table,form,label,summary,tr,span,dl,dd,p";
const MEDIA_TAGS = new Set(["IMG", "SVG", "VIDEO", "CANVAS", "PICTURE", "IFRAME"]);
/** Never stand on these: chrome, hidden or decorative subtrees, the title and the card stamp. Interactive tiles/rows ARE standable (the body has pointer-events none). */
const CHROME_SELECTOR = "header,nav,dialog,[inert],[hidden],[aria-hidden='true'],[data-guide-skip],.fixed,[data-testid='visitor-title'],[data-testid='card-stamp']";
const SKIP_SELECTOR = CHROME_SELECTOR;
/** Marquee strips: the band itself (its borders) is standable, the items sliding inside it are not. */
const MARQUEE_SELECTOR = "[data-testid='section-logos'],[data-testid='proof-ticker']";
const MAX_SURFACES = 900;
const NEAR = 360; // px beyond the viewport that still gets refreshed each frame

const transparent = (c: string) => !c || c === "transparent" || /^rgba\([^)]*,\s*0(\.0+)?\s*\)$|\/\s*0(\.0+)?%?\s*\)$/.test(c);

/** OKLab (L 0-1, a, b) to sRGB 0-255. */
function oklabToRgb(L: number, A: number, B: number) {
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  const lin = [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s];
  return lin.map((v) => {
    const c = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.max(0, v) ** (1 / 2.4) - 0.055;
    return Math.max(0, Math.min(255, c * 255));
  });
}
/** r, g, b (0-255) and alpha (0-1) of a computed colour: rgb()/rgba(), and oklab()/oklch() (Tailwind v4 emits these). */
export const rgba = (c: string) => {
  const n = (c.match(/-?[\d.]+(?:e-?\d+)?%?/g) ?? []).map((v) => (v.endsWith("%") ? Number.parseFloat(v) / 100 : Number(v)));
  const a = n.length >= 4 ? n[3]! : 1;
  if (/^oklab/i.test(c) && n.length >= 3) return { c: oklabToRgb(n[0]!, n[1]!, n[2]!), a };
  if (/^oklch/i.test(c) && n.length >= 3) {
    const h = (n[2]! * Math.PI) / 180;
    return { c: oklabToRgb(n[0]!, n[1]! * Math.cos(h), n[1]! * Math.sin(h)), a };
  }
  return { c: n.slice(0, 3), a };
};
/** Smallest per-channel step (0-255) that reads as an edge against the page (a 4% grey bar on white is ~10 and counts; a #f7f7f7 band on white is 8 and does not). */
export const EDGE_CONTRAST = 9;
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
export function glyphTop(lineTop: number, lineHeight: number, cs: CSSStyleDeclaration, sample = "H") {
  const fs = Number.parseFloat(cs.fontSize) || 16;
  const font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  const ck = `${font}|${sample}`;
  let off = metricCache.get(ck);
  if (off === undefined) {
    if (metricCtx === undefined) metricCtx = typeof document !== "undefined" ? document.createElement("canvas").getContext("2d") : null;
    off = null;
    if (metricCtx) {
      metricCtx.font = font;
      // The real glyphs of this line: a lowercase-only line starts at its x-height, not cap height.
      const m = metricCtx.measureText(sample || "H");
      if (m.fontBoundingBoxAscent && m.actualBoundingBoxAscent) off = m.fontBoundingBoxAscent - m.actualBoundingBoxAscent;
    }
    metricCache.set(ck, off);
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

/** Alpha (0-255) above which an image pixel counts as solid ground. */
export const OPAQUE_ALPHA = 32;
/** Columns sampled across an image's silhouette. */
const SIL_COLS = 96;
/** A standable stretch of silhouette may rise/fall at most this much (px) across its width. */
export const SIL_FLAT = 6;

/**
 * Pure: where an image's content is drawn inside its box (px, relative to the box), per
 * object-fit and object-position. `fill` (default) stretches; `contain` / `scale-down` letterbox;
 * `cover` crops; `none` keeps natural size.
 */
export function contentRect(boxW: number, boxH: number, natW: number, natH: number, fit = "fill", position = "50% 50%") {
  if (!natW || !natH || fit === "fill" || !fit) return { left: 0, top: 0, width: boxW, height: boxH };
  let sc = 1;
  if (fit === "contain") sc = Math.min(boxW / natW, boxH / natH);
  else if (fit === "cover") sc = Math.max(boxW / natW, boxH / natH);
  else if (fit === "scale-down") sc = Math.min(1, boxW / natW, boxH / natH);
  const w = natW * sc;
  const h = natH * sc;
  const parts = position.trim().split(/\s+/);
  const frac = (v: string | undefined, horiz: boolean) => {
    if (!v) return 0.5;
    if (v === "left" || v === "top") return 0;
    if (v === "right" || v === "bottom") return 1;
    if (v === "center") return 0.5;
    if (v.endsWith("%")) return Number.parseFloat(v) / 100;
    const px = Number.parseFloat(v);
    const free = horiz ? boxW - w : boxH - h;
    return Number.isFinite(px) && free !== 0 ? px / free : 0.5;
  };
  // "bottom" alone or "center bottom": a vertical keyword in the first slot.
  let [px, py] = parts;
  if (parts.length === 1 && (px === "top" || px === "bottom")) [px, py] = ["center", px];
  return { left: (boxW - w) * frac(px, true), top: (boxH - h) * frac(py, false), width: w, height: h };
}

/**
 * Pure: the flat standable stretches of a silhouette. `tops[i]` is the first opaque row (0..1 of
 * the image height) in sample column i, or null for a fully transparent column. Columns map
 * through `content` (box-relative px) into box px; runs whose top varies by <= `flat` px and
 * span >= `minW` px become one platform at the run's HIGHEST point (so the feet never sink
 * into it). Steep slopes (a shoulder, the side of a head) are skipped. Clipped to the box.
 */
export function silhouetteSegments(tops: readonly (number | null)[], content: { left: number; top: number; width: number; height: number }, boxW: number, boxH: number, flat = SIL_FLAT, minW = MIN_SURFACE_W) {
  const n = tops.length;
  const colW = content.width / n;
  const out: { left: number; right: number; top: number }[] = [];
  let start = -1;
  let lo = 0;
  let hi = 0;
  const flush = (end: number) => {
    if (start < 0) return;
    const left = Math.max(0, content.left + start * colW);
    const right = Math.min(boxW, content.left + end * colW);
    if (right - left >= minW && lo >= 0 && lo <= boxH) out.push({ left, right, top: lo });
    start = -1;
  };
  for (let i = 0; i < n; i++) {
    const t = tops[i];
    const y = t == null ? null : content.top + t * content.height;
    if (y == null || y < 0 || y > boxH) {
      flush(i);
      continue;
    }
    if (start >= 0 && Math.max(hi, y) - Math.min(lo, y) <= flat) {
      lo = Math.min(lo, y);
      hi = Math.max(hi, y);
      continue;
    }
    flush(i);
    start = i;
    lo = y;
    hi = y;
  }
  flush(n);
  return out;
}

/** Pure: per column, the first row (0..1) whose alpha exceeds OPAQUE_ALPHA, else null. `data` is RGBA, w x h. */
export function alphaTops(data: ArrayLike<number>, w: number, h: number) {
  const tops: (number | null)[] = [];
  for (let x = 0; x < w; x++) {
    let t: number | null = null;
    for (let y = 0; y < h; y++) {
      if (data[(y * w + x) * 4 + 3]! > OPAQUE_ALPHA) {
        t = y / h;
        break;
      }
    }
    tops.push(t);
  }
  return tops;
}

let silCtx: CanvasRenderingContext2D | null | undefined;
const silCache = new Map<string, (number | null)[] | null>();
/** The silhouette profile of an image/canvas (cached per src), or null when unreadable (not loaded, cross-origin). */
function readSilhouette(el: HTMLImageElement | HTMLCanvasElement) {
  const isImg = el.tagName === "IMG";
  const img = el as HTMLImageElement;
  const natW = isImg ? img.naturalWidth : el.width;
  const natH = isImg ? img.naturalHeight : el.height;
  if (!natW || !natH || (isImg && !img.complete)) return null;
  const key = isImg ? img.currentSrc || img.src : "";
  if (key && silCache.has(key)) return silCache.get(key)!;
  if (silCtx === undefined) silCtx = typeof document !== "undefined" ? document.createElement("canvas").getContext("2d", { willReadFrequently: true }) : null;
  let tops: (number | null)[] | null = null;
  if (silCtx) {
    const w = SIL_COLS;
    const h = Math.max(8, Math.round((natH / natW) * w));
    silCtx.canvas.width = w;
    silCtx.canvas.height = h;
    try {
      silCtx.clearRect(0, 0, w, h);
      silCtx.drawImage(el, 0, 0, w, h);
      tops = alphaTops(silCtx.getImageData(0, 0, w, h).data, w, h);
    } catch {
      tops = null; // tainted (cross-origin) or not decodable: not standable
    }
  }
  if (key) silCache.set(key, tops);
  return tops;
}

/** Did an image the guide could stand on just load (an IMG inside a root, outside the guide itself)? */
export function isGuideImageLoad(target: EventTarget | null, roots: readonly Element[], guideRoot: Element | null) {
  const el = target as Element | null;
  if (!el || el.tagName !== "IMG") return false;
  if (guideRoot?.contains(el)) return false;
  return roots.some((r) => r.contains(el));
}

/** Standable stretches of an image/canvas silhouette, box-relative px. Empty when unreadable. */
function imageSegments(el: HTMLImageElement | HTMLCanvasElement, r: DOMRect, cs: CSSStyleDeclaration) {
  const tops = readSilhouette(el);
  if (!tops) return [];
  const isImg = el.tagName === "IMG";
  const natW = isImg ? (el as HTMLImageElement).naturalWidth : el.width;
  const natH = isImg ? (el as HTMLImageElement).naturalHeight : el.height;
  const content = contentRect(r.width, r.height, natW, natH, cs.objectFit, cs.objectPosition);
  return silhouetteSegments(tops, content, r.width, r.height);
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

/**
 * Text surfaces: the glyph top of the TOP line of each text cluster (see `clusterTops`), measured
 * from the real glyphs of that text (canvas actualBoundingBoxAscent), so the feet touch letters.
 */
export const TEXT_SURFACES = true;

/**
 * Text that is laid out but not painted where its rects say: screen-reader-only copies (`sr-only`
 * is a 1x1 clipped box whose nowrap text still reports a full-width line rect) and anything clipped.
 */
export function clippedText(el: Element, cs: Pick<CSSStyleDeclaration, "clip" | "clipPath" | "position">, rect: Pick<DOMRect, "width" | "height">) {
  if (rect.width <= 2 || rect.height <= 2) return true;
  if (cs.clip && cs.clip !== "auto") return true;
  if (cs.clipPath && cs.clipPath !== "none" && /inset\(\s*50%|rect\(\s*0/.test(cs.clipPath)) return true;
  return el.classList?.contains("sr-only") ?? false;
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
  /** "box" = a drawn top edge; "line" = a drawn bottom border; "image" = a flat stretch of an image's opaque silhouette; "text" = the glyph top of a cluster's top line */
  kind: "box" | "line" | "image" | "text";
  /** where the cover probe samples, relative to the line (px): +1 just below it, -1 just above (inside the element) */
  probeDy: number;
  /** covered by another opaque box at its edge; undefined = not checked yet (only checked in view) */
  covered?: boolean;
  /** text only: the element whose effective opacity gates it (faded-in words are not ground until visible) */
  fadeEl?: Element;
  /** text only: still too faint to see (effective opacity < MIN_TEXT_OPACITY); re-checked in view each collect */
  faded?: boolean;
};

export type SurfaceCache = { tracked: Tracked[]; ink: Ink<Element>[]; avoid: Rect[]; ms: number; boxes: number; texts: number };

/**
 * The expensive pass: analyse the WHOLE page once (idle after load, then only after a resize or
 * a DOM change) and cache every standable line in page px with its offset from its element, so
 * a scroll only re-reads rects and never re-runs any style heuristics.
 * Rules: a box counts only when it is rendered and draws a visible top edge (fill that differs
 * from what is painted behind it, a top border, shadow, outline, or media / hr), at ANY nesting
 * depth (a card inside a card counts); a visible bottom border is a line too; images stand on
 * their opaque silhouette. Covered lines and lines under 40 px drop out (`checkCover`, MIN_SURFACE_W).
 * A text block whose container draws no edge offers the
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
      v = !!guideRoot?.contains(el) || !!el.closest(SKIP_SELECTOR) || !!el.parentElement?.closest(MARQUEE_SELECTOR) || (el.closest("svg") !== el && !!el.closest("svg"));
      skipped.set(el, v);
    }
    return v;
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
      const cs = css(el);
      if (!rendered(el, cs)) continue;
      const k = keyOf(el);
      const id = spotOf(el, page);
      const line = (suffix: string, relT: number, kind: Tracked["kind"], relL = 0, relR = r.width, probeDy = 1): Tracked => ({
        el,
        kind,
        probeDy,
        surface: { key: k + suffix, id, left: Math.max(0, r.left + relL), right: Math.min(vw, r.left + relR), top: r.top + scrollY + relT },
        relL,
        relR,
        relT,
      });
      // Images / canvases with transparency: stand on the opaque silhouette, never on the empty box top.
      if (el.tagName === "IMG" || el.tagName === "CANVAS") {
        const segs = imageSegments(el as HTMLImageElement | HTMLCanvasElement, r, cs);
        segs.forEach((g, i) => out.push(line(`i${i}`, g.top, "image", g.left, g.right, 2)));
        boxes += segs.length;
        continue;
      }
      if (isDrawn(el)) {
        out.push(line("", 0, "box"));
        boxes++;
      }
      // A visible bottom border is a drawn line of its own (a band's lower rule, a row divider).
      const bw = Number.parseFloat(cs.borderBottomWidth);
      if (bw > 0 && cs.borderBottomStyle !== "none" && cs.borderBottomStyle !== "hidden" && !transparent(cs.borderBottomColor) && distinct(cs.borderBottomColor, behindOf(el)) && r.height > bw + 2) {
        out.push(line("b", r.height - bw, "line", 0, r.width, -1));
        boxes++;
      }
    }
    // Text: the first line of each text block whose container draws no edge.
    if (!TEXT_SURFACES) continue;
    const range = document.createRange();
    const done = new Set<Element>();
    const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let n = walk.nextNode(); n; n = walk.nextNode()) {
      if (out.length >= MAX_SURFACES) break;
      const parent = n.parentElement;
      if (!parent || !n.textContent?.trim()) continue;
      if (clippedText(parent, css(parent), rectOf(parent))) continue; // sr-only copy: not the painted text
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
        const mp = m.parentElement;
        if (!mp || clippedText(mp, css(mp), rectOf(mp))) continue; // the sr-only copy reports a full-width line
        range.selectNodeContents(m);
        const qs = [...range.getClientRects()];
        if (qs.length === 0) continue;
        if (Number.isNaN(firstTop)) firstTop = qs.find((q) => q.width > 1 && q.height > 4)?.top ?? Number.NaN;
        lineRects.push(...qs);
        if (qs.some((q) => q.top > firstTop + 2)) break;
      }
      // Only the glyph runs of the FIRST line (clipped to the text, never the block's width).
      const line = firstLine(lineRects);
      if (!line || line.right - line.left < MIN_SURFACE_W) continue;
      const fs = Number.parseFloat(css(parent).fontSize) || 16;
      const top = glyphTop(line.top, line.height, css(parent), (owner.textContent ?? "").trim().slice(0, 48));
      const or = rectOf(owner);
      const t: Tracked = { el: owner, kind: "text", probeDy: 1, fadeEl: parent, surface: { key: keyOf(owner), id: spotOf(owner, page), left: Math.max(0, line.left), right: Math.min(vw, line.right), top: top + scrollY }, relL: line.left - or.left, relR: line.right - or.left, relT: top - or.top };
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

/** Text fainter than this (effective opacity up the tree) is not ground yet: scroll-words start at 0.18. */
export const MIN_TEXT_OPACITY = 0.3;
/** Pure-ish: the product of opacities from `el` up to the document. */
export function effectiveOpacity(el: Element | null, styleOf: (e: Element) => Pick<CSSStyleDeclaration, "opacity"> = getComputedStyle) {
  let o = 1;
  for (let a = el; a && o >= 0.01; a = a.parentElement) {
    const v = Number.parseFloat(styleOf(a).opacity);
    if (Number.isFinite(v)) o *= v;
  }
  return o;
}
/** Re-check faded text surfaces near the viewport (cheap: only in-view text). */
export function checkFade(tracked: readonly Tracked[], scrollY: number, vh: number) {
  for (const t of tracked) {
    if (!t.fadeEl) continue;
    const y = t.surface.top - scrollY;
    if (y < -vh || y > vh * 2) continue;
    t.faded = effectiveOpacity(t.fadeEl) < MIN_TEXT_OPACITY;
  }
}

/** Short label of what a tracked surface is (for the dev `data-guide-on` attribute): "text:H2.scroll-words". */
export function describeSurface(t: Pick<Tracked, "kind" | "el">) {
  const cls = typeof (t.el as HTMLElement).className === "string" ? (t.el as HTMLElement).className.trim().split(/\s+/)[0] : "";
  const tid = (t.el as HTMLElement).dataset?.testid;
  return `${t.kind}:${t.el.tagName}${cls ? `.${cls}` : ""}${tid ? `[${tid}]` : ""}`;
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
    const hit = document.elementFromPoint(x, y + t.probeDy);
    let covered = false;
    // Something opaque in FRONT of the line (not the element itself, its content, or an ancestor it sits in).
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
      if (clippedText(el, getComputedStyle(el), el.getBoundingClientRect())) continue;
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
