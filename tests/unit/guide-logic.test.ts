import { describe, expect, test } from "bun:test";
import {
  CHAR,
  chooseStandX,
  EDGE,
  guideAction,
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

describe("lines", () => {
  test("line 1 once per section, capped per visit", () => {
    expect(nextLine("founder", "statement", new Set())).toBe(scriptFor("founder", "statement")[0]!);
    expect(nextLine("founder", "statement", new Set(["statement"]))).toBeNull();
    const six = new Set(["statement", "highlights", "stack", "people", "linkedin", "contact"] as const);
    expect(six.size).toBe(MAX_PASSIVE_LINES);
    expect(nextLine("founder", "statement", new Set(["highlights", "stack", "people", "linkedin", "contact", "statement"] as const))).toBeNull();
  });
});
