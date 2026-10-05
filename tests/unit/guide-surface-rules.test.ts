import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { alphaTops, analyseSurfaces, describeSurface, effectiveOpacity, firstLine, isGuideImageLoad, MIN_TEXT_OPACITY, checkCover, clusterTops, contentRect, silhouetteSegments, type Tracked } from "../../src/components/site/visitor/guide/guide-dom";
import { CHAR, FEET_MARGIN, feetFit, linesThroughBody } from "../../src/components/site/visitor/guide/guide-logic";

// ---- a tiny fake DOM: just enough for analyseSurfaces / checkCover -----------------------------
type Box = { left: number; top: number; width: number; height: number };
type Fake = {
  tagName: string;
  style: Record<string, string>;
  box: Box;
  parentElement: Fake | null;
  children: Fake[];
  dataset: Record<string, string>;
  textContent: string;
  getBoundingClientRect: () => DOMRect;
  closest: (sel: string) => Fake | null;
  contains: (o: Fake) => boolean;
  querySelectorAll: (sel: string) => Fake[];
  checkVisibility: () => boolean;
  removeAttribute: () => void;
};
const BASE: Record<string, string> = { display: "block", visibility: "visible", opacity: "1", backgroundColor: "rgba(0, 0, 0, 0)", backgroundImage: "none", borderTopWidth: "0px", borderTopStyle: "none", borderTopColor: "rgb(0, 0, 0)", borderBottomWidth: "0px", borderBottomStyle: "none", borderBottomColor: "rgb(0, 0, 0)", boxShadow: "none", outlineWidth: "0px", outlineStyle: "none", outlineColor: "rgb(0, 0, 0)", objectFit: "fill", objectPosition: "50% 50%" };
function node(tagName: string, box: Box, style: Record<string, string> = {}, kids: Fake[] = []): Fake {
  const n: Fake = {
    tagName,
    style: { ...BASE, ...style },
    box,
    parentElement: null,
    children: kids,
    dataset: {},
    textContent: "",
    getBoundingClientRect: () => ({ ...box, right: box.left + box.width, bottom: box.top + box.height, x: box.left, y: box.top, toJSON: () => 0 }) as DOMRect,
    closest: (sel: string) => {
      for (let a: Fake | null = n; a; a = a.parentElement) if (sel.includes("[data-testid='home']") && a.dataset.testid === "home") return a;
      return null;
    },
    contains: (o: Fake) => {
      for (let a: Fake | null = o; a; a = a.parentElement) if (a === n) return true;
      return false;
    },
    querySelectorAll: () => {
      const all: Fake[] = [];
      const walk = (x: Fake) => x.children.forEach((c) => (all.push(c), walk(c)));
      walk(n);
      return all;
    },
    checkVisibility: () => true,
    removeAttribute: () => {},
  };
  kids.forEach((k) => (k.parentElement = n));
  return n;
}
const WHITE = "rgb(255, 255, 255)";
let hitAt: (x: number, y: number) => Fake | null = () => null;
const g = globalThis as Record<string, unknown>;
const saved = { document: g.document, getComputedStyle: g.getComputedStyle, NodeFilter: g.NodeFilter };
beforeAll(() => {
  const body = node("BODY", { left: 0, top: 0, width: 1000, height: 3000 }, { backgroundColor: WHITE });
  g.NodeFilter = { SHOW_TEXT: 4 };
  g.getComputedStyle = (el: Fake) => el.style;
  g.document = {
    body,
    documentElement: body,
    createRange: () => ({ selectNodeContents: () => {}, getClientRects: () => [], detach: () => {} }),
    createTreeWalker: () => ({ nextNode: () => null }),
    createElement: () => ({ getContext: () => null }),
    elementFromPoint: (x: number, y: number) => hitAt(x, y),
    querySelector: () => null,
    querySelectorAll: () => [],
  };
});
afterAll(() => Object.assign(g, saved));

const keysOf = (ts: readonly Tracked[]) => ts.map((t) => `${t.el.tagName}:${t.kind}@${Math.round(t.surface.top)}`);

describe("box rules: every visibly drawn horizontal line counts", () => {
  test("a card nested inside a card counts (top edge of the inner card)", () => {
    const inner = node("DIV", { left: 120, top: 260, width: 300, height: 80 }, { backgroundColor: "rgb(40, 40, 40)" });
    const outer = node("DIV", { left: 100, top: 200, width: 500, height: 300 }, { backgroundColor: "rgb(230, 230, 230)" }, [inner]);
    const root = node("MAIN", { left: 0, top: 0, width: 1000, height: 1000 }, {}, [outer]);
    const a = analyseSurfaces([root as unknown as Element], null, 0, 1000);
    expect(keysOf(a.tracked)).toEqual(["DIV:box@200", "DIV:box@260"]);
  });
  test("a visible border-bottom is a line of its own (the band's lower rule)", () => {
    const band = node("DIV", { left: 0, top: 400, width: 1000, height: 60 }, { borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "rgb(0, 0, 0)", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "rgb(0, 0, 0)" });
    const root = node("MAIN", { left: 0, top: 0, width: 1000, height: 1000 }, {}, [band]);
    const a = analyseSurfaces([root as unknown as Element], null, 0, 1000);
    expect(keysOf(a.tracked)).toEqual(["DIV:box@400", "DIV:line@459"]);
  });
  test("a transparent wrapper with no drawn edge offers nothing; under 40 px wide drops out", () => {
    const wrap = node("DIV", { left: 0, top: 100, width: 600, height: 60 });
    const tiny = node("SPAN", { left: 0, top: 300, width: 30, height: 20 }, { backgroundColor: "rgb(0, 0, 0)" });
    const root = node("MAIN", { left: 0, top: 0, width: 1000, height: 1000 }, {}, [wrap, tiny]);
    expect(analyseSurfaces([root as unknown as Element], null, 0, 1000).tracked).toEqual([]);
  });
  test("a line covered by an opaque element in front of it is excluded; one with only its own content over it stays", () => {
    const card = node("DIV", { left: 0, top: 100, width: 400, height: 80 }, { backgroundColor: "rgb(40, 40, 40)" });
    const cover = node("DIV", { left: 0, top: 90, width: 400, height: 40 }, { backgroundColor: "rgb(200, 0, 0)" });
    const child = node("P", { left: 0, top: 100, width: 400, height: 20 }, {}, []);
    child.parentElement = card;
    const t = (): Tracked => ({ el: card as unknown as Element, kind: "box", probeDy: 1, surface: { key: "k", id: null, left: 0, right: 400, top: 100 }, relL: 0, relR: 400, relT: 0 });
    hitAt = () => cover;
    const covered = [t()];
    checkCover(covered, 0, 1000, 800);
    expect(covered[0]!.covered).toBe(true);
    hitAt = () => child;
    const free = [t()];
    checkCover(free, 0, 1000, 800);
    expect(free[0]!.covered).toBe(false);
  });
});

describe("images: stand on the opaque silhouette, never on transparent box space", () => {
  // A 10x10 RGBA image: transparent top half; a flat "shoulder" from row 5 across all columns, a "head" at row 2 in columns 4-5.
  const rgba = (w: number, h: number, opaque: (x: number, y: number) => boolean) => {
    const d = new Uint8ClampedArray(w * h * 4);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) d[(y * w + x) * 4 + 3] = opaque(x, y) ? 255 : 0;
    return d;
  };
  test("transparent image: platforms sit on the silhouette, not at the box top", () => {
    const data = rgba(10, 10, (x, y) => y >= 5 || (x >= 4 && x <= 5 && y >= 2));
    const tops = alphaTops(data, 10, 10);
    expect(tops[0]).toBe(0.5);
    expect(tops[4]).toBe(0.2);
    // box 400x400, fill: shoulders at y=200 (left 0..160 and right 240..400), head at y=80 (160..240).
    const segs = silhouetteSegments(tops, contentRect(400, 400, 10, 10), 400, 400);
    expect(segs).toEqual([
      { left: 0, right: 160, top: 200 },
      { left: 160, right: 240, top: 80 },
      { left: 240, right: 400, top: 200 },
    ]);
    expect(segs.every((s) => s.top > 0)).toBe(true);
  });
  test("a fully transparent image offers nothing; a fully opaque one is its content top", () => {
    expect(silhouetteSegments(alphaTops(rgba(10, 10, () => false), 10, 10), contentRect(400, 400, 10, 10), 400, 400)).toEqual([]);
    expect(silhouetteSegments(alphaTops(rgba(10, 10, () => true), 10, 10), contentRect(400, 400, 10, 10), 400, 400)).toEqual([{ left: 0, right: 400, top: 0 }]);
  });
  test("object-contain object-bottom maps the silhouette into the letterboxed content", () => {
    // 1:2 portrait in a 400x400 box: drawn 200x400 centred horizontally, bottom aligned.
    const c = contentRect(400, 400, 100, 200, "contain", "50% 100%");
    expect(c).toEqual({ left: 100, top: 0, width: 200, height: 400 });
    const wide = contentRect(400, 400, 200, 100, "contain", "50% 100%");
    expect(wide).toEqual({ left: 0, top: 200, width: 400, height: 200 });
    const segs = silhouetteSegments(alphaTops(rgba(10, 10, () => true), 10, 10), wide, 400, 400);
    expect(segs).toEqual([{ left: 0, right: 400, top: 200 }]);
  });
  test("a steep slope (side of a head) is not standable", () => {
    const tops = Array.from({ length: 20 }, (_, i) => i / 20);
    expect(silhouetteSegments(tops, contentRect(400, 400, 1, 1), 400, 400)).toEqual([]);
  });
});

describe("text: only the top line of a text cluster", () => {
  test("a heading over a paragraph over a list keeps just the heading", () => {
    const l = (top: number, h: number) => ({ left: 0, right: 400, top, bottom: top + h, lineHeight: 20 });
    expect(clusterTops([l(100, 30), l(140, 60), l(210, 24), l(240, 24)])).toEqual([0]);
  });
});

describe("never rests under a line with its head poking above it", () => {
  const s = (key: string, top: number, left = 0, right = 400) => ({ key, id: null, left, right, top });
  test("a line within the body height above the feet blocks; lines below or far above do not", () => {
    const feet = 500;
    const lines = linesThroughBody([s("own", feet), s("over", feet - 30), s("far", feet - CHAR.h - 10), s("below", feet + 20), s("same", feet - 0.5)], feet, "own");
    expect(lines).toEqual([{ left: 0, right: 400, top: feet - 31, bottom: feet - 29 }]);
  });
});

describe("image load re-analysis trigger", () => {
  test("only an IMG inside a root and outside the guide triggers a rebuild", () => {
    const img = node("IMG", { left: 0, top: 0, width: 100, height: 100 });
    const guideImg = node("IMG", { left: 0, top: 0, width: 50, height: 50 });
    const guide = node("DIV", { left: 0, top: 0, width: 50, height: 50 }, {}, [guideImg]);
    const script = node("SCRIPT", { left: 0, top: 0, width: 0, height: 0 });
    const root = node("MAIN", { left: 0, top: 0, width: 1000, height: 1000 }, {}, [img, guide, script]);
    const outside = node("IMG", { left: 0, top: 0, width: 100, height: 100 });
    const roots = [root as unknown as Element];
    const G = guide as unknown as Element;
    expect(isGuideImageLoad(img as unknown as EventTarget, roots, G)).toBe(true);
    expect(isGuideImageLoad(guideImg as unknown as EventTarget, roots, G)).toBe(false);
    expect(isGuideImageLoad(script as unknown as EventTarget, roots, G)).toBe(false);
    expect(isGuideImageLoad(outside as unknown as EventTarget, roots, G)).toBe(false);
    expect(isGuideImageLoad(null, roots, G)).toBe(false);
  });
});

describe("text x-extent: the feet stay on the letters", () => {
  test("the first line's extent is its glyph runs, not the block width; later lines ignored", () => {
    // Block is 215..1420 wide; line 1 words end at 1215; line 2 runs to 1420.
    const r = (left: number, right: number, top: number) => ({ left, right, top, width: right - left, height: 60 });
    const line = firstLine([r(215, 600, 100), r(612, 1215, 100), r(215, 1420, 170)])!;
    expect(line.left).toBe(215);
    expect(line.right).toBe(1215);
  });
  test("feet must be centred inside the line with a margin", () => {
    const s = { left: 215, right: 1215 };
    expect(feetFit(s, 700)).toBe(true);
    expect(feetFit(s, 1215 - FEET_MARGIN)).toBe(true);
    expect(feetFit(s, 1215 - FEET_MARGIN + 1)).toBe(false);
    expect(feetFit(s, 1530)).toBe(false); // the reported empty-space spot
    expect(feetFit(s, 215)).toBe(false);
  });
  test("faint text (scroll-words start at 0.18) is not ground until visible", () => {
    const parent = { parentElement: null, o: "1" };
    const word = { parentElement: parent, o: "0.18" };
    const styleOf = (e: Element) => ({ opacity: (e as unknown as { o: string }).o });
    expect(effectiveOpacity(word as unknown as Element, styleOf)).toBeLessThan(MIN_TEXT_OPACITY);
    word.o = "1";
    expect(effectiveOpacity(word as unknown as Element, styleOf)).toBe(1);
    const dim = { parentElement: { parentElement: null, o: "0.5" }, o: "0.5" };
    expect(effectiveOpacity(dim as unknown as Element, styleOf)).toBeLessThan(MIN_TEXT_OPACITY);
  });
  test("describeSurface labels kind, tag, first class and testid", () => {
    const el = { tagName: "H2", className: "scroll-words text-4xl", dataset: {} } as unknown as Element;
    expect(describeSurface({ kind: "text", el })).toBe("text:H2.scroll-words");
  });
});

describe("colour parsing: Tailwind v4 oklab fills count as drawn", () => {
  test("oklab(0 0 0 / 0.04) on white is a visible grey bar; on the same grey it is not", async () => {
    const { distinct, rgba } = await import("../../src/components/site/visitor/guide/guide-dom");
    const c = rgba("oklab(0 0 0 / 0.04)");
    expect(c.a).toBeCloseTo(0.04);
    expect(c.c.every((v) => v < 1)).toBe(true);
    expect(rgba("oklab(1 0 0)").c.every((v) => v > 254)).toBe(true);
    expect(distinct("oklab(0 0 0 / 0.04)", "rgb(255, 255, 255)")).toBe(true);
    expect(distinct("oklab(0 0 0 / 0.01)", "rgb(255, 255, 255)")).toBe(false);
    expect(distinct("oklch(0.95 0 0)", "rgb(255, 255, 255)")).toBe(true);
  });
  test("sr-only copies and clipped text are never text ground", async () => {
    const { clippedText } = await import("../../src/components/site/visitor/guide/guide-dom");
    const cs = (o: Partial<CSSStyleDeclaration> = {}) => ({ clip: "auto", clipPath: "none", position: "static", ...o }) as CSSStyleDeclaration;
    const el = (cls = "") => ({ classList: { contains: (c: string) => cls.split(" ").includes(c) } }) as unknown as Element;
    expect(clippedText(el("sr-only"), cs({ clip: "rect(0px, 0px, 0px, 0px)" }), { width: 1, height: 1 })).toBe(true);
    expect(clippedText(el(), cs(), { width: 1, height: 1 })).toBe(true);
    expect(clippedText(el(), cs({ clipPath: "inset(50%)" }), { width: 300, height: 40 })).toBe(true);
    expect(clippedText(el("inline"), cs(), { width: 300, height: 40 })).toBe(false);
  });
});

describe("landing settles onto the line", () => {
  test("a landing past the end (within tolerance) is moved inside by the feet margin", async () => {
    const { onLine } = await import("../../src/components/site/visitor/guide/guide-physics");
    expect(onLine({ left: 100, right: 400 }, 408)).toBe(400 - FEET_MARGIN);
    expect(onLine({ left: 100, right: 400 }, 95)).toBe(100 + FEET_MARGIN);
    expect(onLine({ left: 100, right: 400 }, 250)).toBe(250);
    expect(onLine({ left: 100, right: 110 }, 130)).toBe(105);
  });
});
