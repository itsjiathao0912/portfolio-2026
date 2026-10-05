import { describe, expect, test } from "bun:test";
import {
  bodyHits,
  boxHits,
  CHAR,
  chooseStandX,
  EDGE,
  guideAction,
  hintRect,
  INK_TOLERANCE,
  inkAbove,
  inOffscreenRadioGroup,
  MAX_PASSIVE_LINES,
  maxFeetY,
  minFeetY,
  nextLine,
  pickSurface,
  sectionUnder,
  shouldHandleGuideKey,
  stepSurface,
  surfaceStandable,
  visibleSurfaces,
  type KeyTarget,
  type Surface,
  type View,
} from "../../src/components/site/visitor/guide/guide-logic";
import { scriptFor } from "../../src/components/site/visitor/guide/guide-story";

const view: View = { w: 1000, h: 800, scrollY: 1000, docH: 5000, nav: 72 };
const S = (key: string, top: number, left = 0, right = 1000, id: Surface["id"] = null): Surface => ({ key, id, left, right, top });

describe("bands (page px, scrolled by 1000)", () => {
  test("feet band: head clears the nav, floor above the bottom edge", () => {
    expect(minFeetY(view)).toBe(72 + 8 + CHAR.h);
    expect(maxFeetY(view)).toBe(800 - EDGE);
  });
  test("a surface is standable only inside the band", () => {
    expect(surfaceStandable(S("a", 1000 + 400), view)).toBe(true);
    expect(surfaceStandable(S("b", 1000 + 100), view)).toBe(false); // head would be under the nav
    expect(surfaceStandable(S("c", 1000 + 795), view)).toBe(false); // below the floor
    expect(surfaceStandable(S("d", 1400, 1100, 1300), view)).toBe(false); // off to the side
  });
});

describe("choosing surfaces", () => {
  const list = [S("top", 1000 + 120), S("mid", 1000 + 430), S("low", 1000 + 700), S("gone", 3000)];
  test("pickSurface: nearest the 55% line among the standable ones", () => expect(pickSurface(list, view)?.key).toBe("mid"));
  test("pickSurface: null when nothing is standable", () => expect(pickSurface([S("x", 50)], view)).toBeNull());
  test("visibleSurfaces are in reading order and stepSurface stays on the ends", () => {
    const v = visibleSurfaces(list, view);
    expect(v.map((s) => s.key)).toEqual(["mid", "low"]);
    expect(stepSurface(v, "mid", 1)?.key).toBe("low");
    expect(stepSurface(v, "low", 1)?.key).toBe("low");
    expect(stepSurface(v, null, 1)?.key).toBe("mid");
    expect(stepSurface([], null, 1)).toBeNull();
  });
  test("sectionUnder: the tagged span through a page y", () => {
    const spans = [
      { id: "statement" as const, top: 100, bottom: 500 },
      { id: "stack" as const, top: 500, bottom: 900 },
    ];
    expect(sectionUnder(spans, 300)).toBe("statement");
    expect(sectionUnder(spans, 500)).toBe("stack");
    expect(sectionUnder(spans, 50)).toBeNull();
  });
});

describe("chooseStandX", () => {
  const s = S("a", 900, 100, 900);
  test("prefers the right quarter, stays on the surface", () => {
    const x = chooseStandX(s, view, []);
    expect(x).toBe(900 - CHAR.w / 2);
  });
  test("steps away from a tap target", () => {
    const x = chooseStandX(s, view, [{ left: 800, right: 900, top: 800, bottom: 880 }]);
    expect(x).toBeLessThan(900 - CHAR.w / 2);
    expect(x).toBeGreaterThanOrEqual(100 + CHAR.w / 2);
  });
  test("a surface narrower than the body centres it", () => expect(chooseStandX(S("n", 900, 400, 440), view, [])).toBe(420));
});

describe("keys: the character claims arrows and W only, never in a field or on a link", () => {
  const node = (nodeName: string, extra: Partial<KeyTarget> = {}, parent: KeyTarget | null = null): KeyTarget => ({ nodeName, parentElement: parent, getAttribute: () => null, ...extra });
  const guide = node("DIV");
  test("actions", () => {
    expect(guideAction("ArrowLeft")).toBe("left");
    expect(guideAction("ArrowRight")).toBe("right");
    expect(guideAction("ArrowUp")).toBe("up");
    expect(guideAction("w")).toBe("up");
    for (const k of ["ArrowDown", " ", "PageDown", "Enter", "a", "d", "Tab"]) expect(guideAction(k)).toBeNull();
  });
  test("body and page elements are ours", () => {
    expect(shouldHandleGuideKey(node("BODY"), guide, {})).toBe(true);
    expect(shouldHandleGuideKey(node("MAIN"), guide, {})).toBe(true);
    expect(shouldHandleGuideKey(null, guide, {})).toBe(true);
  });
  test("fields, links, buttons, widgets keep their own keys", () => {
    for (const n of ["INPUT", "TEXTAREA", "SELECT", "A", "BUTTON", "SUMMARY"]) expect(shouldHandleGuideKey(node(n), guide, {})).toBe(false);
    expect(shouldHandleGuideKey(node("DIV", { isContentEditable: true }), guide, {})).toBe(false);
    expect(shouldHandleGuideKey(node("DIV", { getAttribute: (a) => (a === "contenteditable" ? "true" : null) }), guide, {})).toBe(false);
    expect(shouldHandleGuideKey(node("DIV", { getAttribute: (a) => (a === "role" ? "radio" : null) }), guide, {})).toBe(false);
    expect(shouldHandleGuideKey(node("SPAN", {}, node("A")), guide, {})).toBe(false); // inside a link
  });
  test("the guide's own button still walks it; modifiers never do", () => {
    expect(shouldHandleGuideKey(node("BUTTON", {}, guide), guide, {})).toBe(true);
    expect(shouldHandleGuideKey(node("BODY"), guide, { metaKey: true })).toBe(false);
    expect(shouldHandleGuideKey(node("BODY"), guide, { ctrlKey: true })).toBe(false);
    expect(shouldHandleGuideKey(node("BODY"), guide, { shiftKey: true })).toBe(false); // Shift+arrow selects text
    expect(shouldHandleGuideKey(node("BODY"), guide, { altKey: true })).toBe(false);
  });
});

describe("keys: a radio left focused in a group that scrolled away does not hold the arrows", () => {
  const node = (nodeName: string, extra: Partial<KeyTarget> = {}, parent: KeyTarget | null = null): KeyTarget => ({ nodeName, parentElement: parent, getAttribute: () => null, ...extra });
  const guide = node("DIV");
  const group = (top: number, bottom: number) => node("DIV", { getAttribute: (a) => (a === "role" ? "radiogroup" : null), getBoundingClientRect: () => ({ top, bottom }) });
  const radio = (g: KeyTarget) => node("BUTTON", { getAttribute: (a) => (a === "role" ? "radio" : null) }, g);
  test("off screen above or below: the guide takes the key", () => {
    expect(shouldHandleGuideKey(radio(group(-900, -300)), guide, {}, 800)).toBe(true);
    expect(shouldHandleGuideKey(radio(group(900, 1400)), guide, {}, 800)).toBe(true);
  });
  test("on screen (even partly): the radio group keeps its keys", () => {
    expect(shouldHandleGuideKey(radio(group(100, 500)), guide, {}, 800)).toBe(false);
    expect(shouldHandleGuideKey(radio(group(-200, 40)), guide, {}, 800)).toBe(false);
  });
  test("no viewport height given: unchanged behaviour", () => {
    expect(shouldHandleGuideKey(radio(group(-900, -300)), guide, {})).toBe(false);
  });
  test("a plain button outside any radio group is unaffected", () => {
    expect(shouldHandleGuideKey(node("BUTTON"), guide, {}, 800)).toBe(false);
    expect(inOffscreenRadioGroup(node("BUTTON"), 800)).toBe(false);
  });
});

describe("ink: the body must not stand in front of text", () => {
  const ink = (el: string, left: number, right: number, top: number, bottom: number) => ({ el, rect: { left, right, top, bottom } });
  test("only text inside the body band above the edge counts, and never the element stood on", () => {
    const list = [ink("h", 0, 300, 100, 150), ink("p", 0, 300, 400, 420), ink("own", 0, 300, 480, 500)];
    // feet at 500: band is 388..500
    expect(inkAbove(list, 500, "own").map((r) => r.top)).toEqual([400]);
    expect(inkAbove(list, 500, null).map((r) => r.top)).toEqual([400, 480]);
    expect(inkAbove(list, 140, "x").map((r) => r.top)).toEqual([100]);
  });
  test("a heading just above a paragraph is not standable there, but is on the open side", () => {
    const list = [ink("h", 100, 260, 300, 350)];
    const surface = { left: 100, right: 700, top: 360 };
    const blockers = inkAbove(list, surface.top, "p");
    const x = chooseStandX(surface, { w: 1000 }, blockers);
    const area = (px: number) => {
      const l = Math.max(px - CHAR.w / 2, 100), r = Math.min(px + CHAR.w / 2, 260);
      return Math.max(0, r - l) * Math.max(0, 350 - Math.max(360 - CHAR.h, 300));
    };
    expect(area(x)).toBeLessThanOrEqual(INK_TOLERANCE);
  });
});

describe("strict ink rule (>6 px on both axes) and the hint", () => {
  const ink = (el: string, left: number, right: number, top: number, bottom: number) => ({ el, rect: { left, right, top, bottom } });
  test("boxHits ignores grazes of 6 px or less, catches real overlaps", () => {
    const box = { left: 0, right: 68, top: 0, bottom: 112 };
    expect(boxHits(box, [{ left: 62, right: 200, top: 50, bottom: 70 }])).toBe(false); // 6 px wide graze
    expect(boxHits(box, [{ left: 60, right: 200, top: 50, bottom: 70 }])).toBe(true);
    expect(boxHits(box, [{ left: 0, right: 200, top: 106, bottom: 130 }])).toBe(false); // 6 px tall graze
  });
  test("a small area that the old 120 px2 rule let through now counts", () => {
    // 10 x 10 = 100 px2 < 120, but visibly over a letter.
    expect(bodyHits(500, 500, [{ left: 500 + CHAR.w / 2 - 10, right: 600, top: 440, bottom: 450 }])).toBe(true);
  });
  test("inkAbove drops text inside the element stood on (a card's own title)", () => {
    const tree: Record<string, string> = { title: "card", body: "card" };
    const within = (a: string, b: string) => tree[a] === b;
    const list = [ink("title", 0, 300, 420, 440), ink("other", 0, 300, 430, 450)];
    expect(inkAbove(list, 500, "card", within).map((r) => r.top)).toEqual([430]);
    expect(inkAbove(list, 500, "card").map((r) => r.top)).toEqual([420, 430]);
  });
  test("hintRect sits just above the head, left- or right-aligned to the body", () => {
    const l = hintRect(200, 500, false);
    expect(l.left).toBe(200 - CHAR.w / 2);
    expect(l.bottom).toBe(500 - CHAR.h - 4);
    const r = hintRect(200, 500, true);
    expect(r.right).toBe(200 + CHAR.w / 2);
  });
});

describe("lines", () => {
  test("line 1 once per section, capped per visit", () => {
    expect(nextLine("founder", "statement", new Set())).toBe(scriptFor("founder", "statement")[0]!);
    expect(nextLine("founder", "statement", new Set(["statement"]))).toBeNull();
    const six = new Set(["statement", "highlights", "stack", "people", "linkedin", "contact"] as const);
    expect(six.size).toBe(MAX_PASSIVE_LINES);
    expect(nextLine("founder", "statement", new Set(["highlights", "stack", "people", "linkedin", "contact", "statement"] as const))).toBeNull();
  });
});

// ---- the body as a physical object: swept landing, no fades -----------------------------
import { FLOOR_KEY, makeScene, NO_INPUT, standingBody, stepBody, type Body } from "../../src/components/site/visitor/guide/guide-physics";
import { floorY, maxFeetY, visibleHeight } from "../../src/components/site/visitor/guide/guide-logic";

describe("swept landing (physics)", () => {
  const v: View = { w: 1000, h: 800, scrollY: 1000, docH: 5000, nav: 72 };
  const fall = (y: number, vy: number, surfaces: Surface[]): Body => {
    const sc = makeScene(surfaces, v);
    return { ...standingBody(500, null, sc), mode: "air", surface: null, y, vy, vx: 0 };
  };
  test("at terminal fall speed it never tunnels: thin, close surfaces are each caught", () => {
    // Two edges 3 px apart, a body falling at 2400 px/s (20 px per 1/120 s sub-step).
    const thin = [S("a", 1500, 400, 600), S("b", 1503, 400, 600)];
    const sc = makeScene(thin, v);
    let b = fall(1300, 2400, thin);
    for (let i = 0; i < 60 && b.mode === "air"; i++) b = stepBody(b, NO_INPUT, 1 / 60, sc);
    // Lands (possibly after one small rebound) on the FIRST edge it crosses, never the lower one.
    for (let i = 0; i < 120 && b.mode === "air"; i++) b = stepBody(b, NO_INPUT, 1 / 60, sc);
    expect([b.mode, b.surface, b.y]).toEqual(["ground", "a", 1500]);
  });
  test("a single huge frame (clamped dt) still lands on the first surface it crosses", () => {
    const surfaces = [S("hi", 1400, 0, 1000), S("lo", 1600, 0, 1000)];
    const sc = makeScene(surfaces, v);
    let b = fall(1300, 2400, surfaces);
    b = stepBody(b, NO_INPUT, 1, sc); // a 1 s hitch
    for (let i = 0; i < 200 && b.mode === "air"; i++) b = stepBody(b, NO_INPUT, 1 / 60, sc);
    expect(b.surface).toBe("hi");
    expect(b.y).toBe(1400);
  });
  test("lands on the first surface under its column, not one off to the side", () => {
    const surfaces = [S("side", 1350, 0, 200), S("under", 1500, 400, 600)];
    const sc = makeScene(surfaces, v);
    let b = fall(1300, 0, surfaces);
    for (let i = 0; i < 200 && (b.mode === "air" || b.landSeq === 0); i++) b = stepBody(b, NO_INPUT, 1 / 60, sc);
    expect(b.surface).toBe("under");
  });
  test("nothing under it: the viewport floor holds it, feet exactly on the floor line", () => {
    const sc = makeScene([], v);
    let b = fall(1300, 0, []);
    for (let i = 0; i < 200 && (b.mode === "air" || b.landSeq === 0); i++) b = stepBody(b, NO_INPUT, 1 / 60, sc);
    expect([b.surface, b.y]).toEqual([FLOOR_KEY, floorY(v)]);
  });
  test("the body model has no fade or hidden state: only ground and air", () => {
    const b = standingBody(500, null, makeScene([], v));
    expect(Object.keys(b).some((k) => /opacity|fade|tuck|hidden|visible/i.test(k))).toBe(false);
    expect(["ground", "air"]).toContain(b.mode);
  });
});

describe("drawnEdge: only visibly drawn top edges are platforms", () => {
  const cs = (o: Partial<Record<string, string>>) => ({ backgroundColor: "rgba(0, 0, 0, 0)", backgroundImage: "none", borderTopWidth: "0px", borderTopStyle: "none", borderTopColor: "rgb(0, 0, 0)", boxShadow: "none", outlineWidth: "0px", outlineStyle: "none", outlineColor: "rgb(0, 0, 0)", ...o }) as unknown as CSSStyleDeclaration;
  test("a transparent wrapper is not; a background, top border or shadow is; media and hr always are", async () => {
    const { drawnEdge } = await import("../../src/components/site/visitor/guide/guide-dom");
    expect(drawnEdge("DIV", cs({}))).toBe(false);
    expect(drawnEdge("DIV", cs({ backgroundColor: "transparent" }))).toBe(false);
    expect(drawnEdge("DIV", cs({ backgroundColor: "rgb(255, 255, 255)" }))).toBe(true);
    expect(drawnEdge("DIV", cs({ borderTopWidth: "1px", borderTopStyle: "solid" }))).toBe(true);
    expect(drawnEdge("DIV", cs({ borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "rgba(0, 0, 0, 0)" }))).toBe(false);
    expect(drawnEdge("ARTICLE", cs({ boxShadow: "0 1px 2px black" }))).toBe(true);
    expect(drawnEdge("IMG", cs({}))).toBe(true);
    expect(drawnEdge("svg", cs({}))).toBe(true);
    expect(drawnEdge("HR", cs({}))).toBe(true);
    expect(drawnEdge("P", cs({}))).toBe(false);
    // A fill only counts when it differs visibly from what is behind it.
    expect(drawnEdge("SECTION", cs({ backgroundColor: "rgb(247, 247, 247)" }), "rgb(255, 255, 255)")).toBe(false);
    expect(drawnEdge("DIV", cs({ backgroundColor: "rgb(230, 230, 232)" }), "rgb(255, 255, 255)")).toBe(true);
    // Painted contrast: a faint tint is composited onto what is behind it before comparing.
    expect(drawnEdge("DIV", cs({ backgroundColor: "rgba(0, 0, 0, 0.04)" }), "rgb(255, 255, 255)")).toBe(false);
    expect(drawnEdge("DIV", cs({ backgroundColor: "rgba(0, 0, 0, 0.2)" }), "rgb(255, 255, 255)")).toBe(true);
    expect(drawnEdge("DIV", cs({ backgroundColor: "rgb(244, 244, 244)" }), "rgb(255, 255, 255)")).toBe(false);
    // A near-white hairline on white is no edge either; a real grey one is.
    expect(drawnEdge("DIV", cs({ borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "rgb(250, 250, 250)" }), "rgb(255, 255, 255)")).toBe(false);
    expect(drawnEdge("DIV", cs({ borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "rgb(200, 200, 205)" }), "rgb(255, 255, 255)")).toBe(true);
  });
});

// ---- the guide on every page + the bubble follows the character -------------------------
import { bubbleAnchor, bubbleRectAt, guidePageFor, PAGE_SPOT_IDS, springStep } from "../../src/components/site/visitor/guide/guide-logic";
import { PAGE_STORIES, STORY_LINE_MAX as STORY_LINE_MAX_PAGE } from "../../src/components/site/visitor/guide/guide-story";

describe("pages", () => {
  test("home, /about and case studies host the guide; nothing else does", () => {
    expect(guidePageFor("/")).toBe("home");
    expect(guidePageFor("/about")).toBe("about");
    expect(guidePageFor("/work/cortex-sentinel")).toBe("case");
    expect(guidePageFor("/work")).toBeNull();
    expect(guidePageFor("/lab/clay")).toBeNull();
    expect(guidePageFor(null)).toBeNull();
  });
  test("every page spot has a short script (2-4 lines, <= 90 chars, no digits, no duplicates)", () => {
    for (const id of PAGE_SPOT_IDS) {
      expect(PAGE_STORIES[id]).toBeDefined();
      for (const role of ["recruiter", "founder", "engineer", "curious"] as const) {
        const s = scriptFor(role, id);
        expect(s.length).toBeGreaterThanOrEqual(2);
        expect(s.length).toBeLessThanOrEqual(4);
        expect(new Set(s).size).toBe(s.length);
        for (const l of s) {
          expect(l.length).toBeLessThanOrEqual(STORY_LINE_MAX_PAGE);
          expect(/\d/.test(l)).toBe(false);
        }
      }
      expect(nextLine("founder", id, new Set())).toBe(scriptFor("founder", id)[0]!);
    }
  });
});

describe("bubble follow", () => {
  test("anchor: a jump keeps the standing y; the same surface is followed exactly; a new one eases", () => {
    const prev = { y: 500, key: "a" };
    expect(bubbleAnchor(prev, { mode: "air", y: 380, surface: null })).toEqual({ y: 500, key: "a", snap: true });
    expect(bubbleAnchor(prev, { mode: "ground", y: 498, surface: "a" })).toEqual({ y: 498, key: "a", snap: true });
    expect(bubbleAnchor(prev, { mode: "ground", y: 700, surface: "b" })).toEqual({ y: 700, key: "b", snap: false });
  });
  test("spring: critically damped, settles near the target within 0.25 s, overshoot < 1 px", () => {
    let p = 0;
    let v = 0;
    let peak = 0;
    for (let i = 0; i < 30; i++) {
      ({ p, v } = springStep(p, v, 100, 26, 1 / 120));
      peak = Math.max(peak, p);
    }
    expect(Math.abs(p - 100)).toBeLessThan(25); // 0.25 s at omega 26: well on its way
    for (let i = 0; i < 120; i++) {
      ({ p, v } = springStep(p, v, 100, 26, 1 / 120));
      peak = Math.max(peak, p);
    }
    expect(Math.abs(p - 100)).toBeLessThan(0.5);
    expect(peak).toBeLessThan(101);
  });
  test("rect stays inside the viewport width", () => {
    const r = bubbleRectAt(10, 300, 188, { w: 390 });
    expect(r.left).toBe(EDGE);
    expect(bubbleRectAt(385, 300, 188, { w: 390 }).right).toBe(390 - EDGE);
  });
});

describe("viewport floor", () => {
  test("the floor is the visible viewport bottom, no margin", () => {
    const v = { w: 390, h: 700, scrollY: 1200, docH: 5000, nav: 0 };
    expect(floorY(v)).toBe(1900);
    expect(maxFeetY(v)).toBe(700 - 12); // surfaces still keep off the very bottom edge
  });
  test("visible height prefers the visual viewport (mobile browser bars), else innerHeight", () => {
    expect(visibleHeight({ innerHeight: 844, visualViewport: { height: 763 } })).toBe(763);
    expect(visibleHeight({ innerHeight: 844, visualViewport: null })).toBe(844);
    expect(visibleHeight({ innerHeight: 844 })).toBe(844);
    expect(visibleHeight({ innerHeight: 844, visualViewport: { height: 0 } })).toBe(844);
  });
});
