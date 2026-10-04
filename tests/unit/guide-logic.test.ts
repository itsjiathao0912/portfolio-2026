import { describe, expect, test } from "bun:test";
import {
  CHAR,
  chooseStandX,
  EDGE,
  guideAction,
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

describe("lines", () => {
  test("line 1 once per section, capped per visit", () => {
    expect(nextLine("founder", "statement", new Set())).toBe(scriptFor("founder", "statement")[0]!);
    expect(nextLine("founder", "statement", new Set(["statement"]))).toBeNull();
    const six = new Set(["statement", "highlights", "stack", "people", "linkedin", "contact"] as const);
    expect(six.size).toBe(MAX_PASSIVE_LINES);
    expect(nextLine("founder", "statement", new Set(["highlights", "stack", "people", "linkedin", "contact", "statement"] as const))).toBeNull();
  });
});
