import { describe, expect, test } from "bun:test";
import { GUIDE_SECTION_IDS, ROLE_IDS } from "../../src/components/site/visitor/role-ids";
import {
  type Anchor,
  bodyRect,
  CHAR,
  chooseStandX,
  clampFeetY,
  clampX,
  collectSurfaces,
  GUIDE_SECTIONS,
  type KeyTarget,
  MAX_PASSIVE_LINES,
  maxFeetY,
  minFeetY,
  nearestAnchorInView,
  nextLine,
  pickSurface,
  planStep,
  rectsOverlap,
  sectionUnder,
  shouldHandleGuideKey,
  stepAnchor,
  type Viewport,
} from "../../src/components/site/visitor/guide/guide-logic";

const vp: Viewport = { w: 1000, h: 800, keepOut: { left: 0, top: 0, right: 1000, bottom: 72 } };
const a = (id: Anchor["id"], top: number, left = 0, right = 1000): Anchor => ({ id, top, left, right });

describe("guide sections", () => {
  test("at most 6 sections, all from the P0 contract", () => {
    expect(GUIDE_SECTIONS.length).toBeLessThanOrEqual(6);
    for (const id of GUIDE_SECTIONS) expect(GUIDE_SECTION_IDS).toContain(id);
  });
});

describe("collectSurfaces", () => {
  const r = (top: number, h = 200) => ({ left: 0, top, right: 800, bottom: top + h });
  test("skips empty rects and unknown ids, one per id, sorted top to bottom", () => {
    const out = collectSurfaces([
      { id: "stack", rect: r(900) },
      { id: "statement", rect: r(100) },
      { id: "statement", rect: r(5000) },
      { id: "people", rect: { left: 0, top: 10, right: 0, bottom: 50 } },
      { id: "nope", rect: r(0) },
      { id: "highlights", rect: r(400) },
    ]);
    expect(out.map((x) => x.id)).toEqual(["statement", "highlights", "stack"]);
    expect(out[0]!.top).toBe(100);
  });
});

describe("pickSurface", () => {
  test("nearest to the 45% line inside the 20-70% band", () => {
    // 45% of 800 = 360; band 160..560
    expect(pickSurface([a("statement", 250), a("highlights", 380), a("stack", 600)], vp)?.id).toBe("highlights");
  });
  test("ties go to the lower edge", () => {
    expect(pickSurface([a("statement", 300), a("highlights", 420)], vp)?.id).toBe("highlights");
  });
  test("an edge outside the band is never picked", () => {
    expect(pickSurface([a("statement", 150), a("stack", 620)], vp)).toBeNull();
  });
  test("an edge under the nav keep-out is never picked, even inside the band", () => {
    const tall: Viewport = { w: 1000, h: 800, keepOut: { left: 0, top: 0, right: 1000, bottom: 250 } };
    // feet must be >= 250 + 8 + 112 = 370
    expect(pickSurface([a("statement", 300)], tall)).toBeNull();
    expect(pickSurface([a("statement", 300), a("stack", 400)], tall)?.id).toBe("stack");
  });
  test("the band's upper and lower limits are enforced separately", () => {
    const tallVp: Viewport = { w: 1000, h: 2000, keepOut: { left: 0, top: 0, right: 1000, bottom: 72 } };
    // band 400..1400; 300 is standable but above it, 1500 below it
    expect(pickSurface([a("statement", 300)], tallVp)).toBeNull();
    expect(pickSurface([a("statement", 1500)], tallVp)).toBeNull();
    expect(pickSurface([a("statement", 300), a("stack", 900)], tallVp)?.id).toBe("stack");
  });
  test("empty list is null", () => expect(pickSurface([], vp)).toBeNull());
});

describe("nearestAnchorInView", () => {
  const list = [a("statement", 100), a("highlights", 300), a("stack", 500), a("people", 1500)];
  test("nearest standable edge to the reference y", () => {
    expect(nearestAnchorInView(list, vp, 320)?.id).toBe("highlights");
    expect(nearestAnchorInView(list, vp, 490)?.id).toBe("stack");
  });
  test("ties go to the lower edge", () => expect(nearestAnchorInView(list, vp, 400)?.id).toBe("stack"));
  test("edges outside the viewport are ignored", () => {
    expect(nearestAnchorInView(list, vp, 100)?.id).toBe("highlights");
    expect(nearestAnchorInView([a("people", 1500)], vp, 700)).toBeNull();
  });
  test("empty is null", () => expect(nearestAnchorInView([], vp, 300)).toBeNull());
});

describe("planStep", () => {
  test("walk on the same level, hop up, fall down", () => {
    expect(planStep({ x: 0, y: 300 }, { x: 80, y: 302 }).kind).toBe("walk");
    expect(planStep({ x: 0, y: 300 }, { x: 0, y: 200 }).kind).toBe("hop");
    expect(planStep({ x: 0, y: 300 }, { x: 0, y: 500 }).kind).toBe("fall");
  });
});

describe("stepAnchor (reduced motion)", () => {
  const list = [a("statement", 200), a("highlights", 400), a("stack", 600)];
  test("steps to the neighbour and stays on the ends", () => {
    expect(stepAnchor(list, "highlights", 1)?.id).toBe("stack");
    expect(stepAnchor(list, "highlights", -1)?.id).toBe("statement");
    expect(stepAnchor(list, "stack", 1)?.id).toBe("stack");
    expect(stepAnchor(list, null, 1)?.id).toBe("statement");
    expect(stepAnchor([], null, 1)).toBeNull();
  });
});

describe("keep-out and viewport clamps", () => {
  test("the body box never meets the nav band at any clamped y", () => {
    for (let y = -500; y <= 1500; y += 37) {
      const feet = clampFeetY(y, vp);
      expect(feet).toBeGreaterThanOrEqual(minFeetY(vp));
      expect(feet).toBeLessThanOrEqual(maxFeetY(vp));
      expect(rectsOverlap(bodyRect(500, feet), vp.keepOut!)).toBe(false);
    }
  });
  test("clampX keeps the whole body inside the viewport", () => {
    expect(clampX(-50, vp)).toBe(12 + CHAR.w / 2);
    expect(clampX(5000, vp)).toBe(vp.w - 12 - CHAR.w / 2);
  });
});

describe("chooseStandX", () => {
  test("prefers the right margin and moves off a tap target", () => {
    const right = vp.w - 12 - CHAR.w / 2;
    expect(chooseStandX(vp, 500, [])).toBe(right);
    const blocker = { left: right - 40, top: 420, right: right + 40, bottom: 500 };
    const x = chooseStandX(vp, 500, [blocker]);
    expect(x).not.toBe(right);
    expect(rectsOverlap(bodyRect(x, 500), blocker)).toBe(false);
  });
  test("falls back to the least overlapping candidate when everything is covered", () => {
    const wall = { left: 0, top: 0, right: 1000, bottom: 800 };
    const x = chooseStandX(vp, 500, [wall]);
    expect(x).toBeGreaterThanOrEqual(12 + CHAR.w / 2);
  });
});

// A tiny DOM stand-in so the key filter is tested without a browser.
const node = (name: string, attrs: Record<string, string> = {}, parent: KeyTarget | null = null): KeyTarget => ({
  nodeName: name,
  parentElement: parent,
  getAttribute: (n: string) => attrs[n] ?? null,
});

describe("shouldHandleGuideKey (engaged key scope)", () => {
  const body = node("BODY");
  const guide = node("DIV", { "data-testid": "visitor-guide-layer" }, body);
  const insideButton = node("BUTTON", { "data-testid": "guide-character" }, guide);
  const hide = node("BUTTON", { "data-guide-native": "true" }, guide);
  const ev = {};

  test("page itself: body, html, document", () => {
    expect(shouldHandleGuideKey(body, guide, ev)).toBe(true);
    expect(shouldHandleGuideKey(node("HTML"), guide, ev)).toBe(true);
    expect(shouldHandleGuideKey(node("#document"), guide, ev)).toBe(true);
    expect(shouldHandleGuideKey(null, guide, ev)).toBe(true);
  });
  test("inside the guide: the character handles keys, native controls keep Enter/Space", () => {
    expect(shouldHandleGuideKey(insideButton, guide, ev)).toBe(true);
    expect(shouldHandleGuideKey(hide, guide, { key: "Enter" })).toBe(false);
    expect(shouldHandleGuideKey(hide, guide, { key: " " })).toBe(false);
    expect(shouldHandleGuideKey(node("SPAN", {}, hide), guide, { key: "Enter" })).toBe(false);
    expect(shouldHandleGuideKey(hide, guide, { key: "ArrowLeft" })).toBe(true);
  });
  test.each([
    ["a", "A", {}],
    ["button", "BUTTON", {}],
    ["summary", "SUMMARY", {}],
    ["input", "INPUT", {}],
    ["textarea", "TEXTAREA", {}],
    ["select", "SELECT", {}],
    ["role=button", "DIV", { role: "button" }],
    ["role=link", "DIV", { role: "link" }],
    ["role=radio", "DIV", { role: "radio" }],
    ["role=menuitem", "DIV", { role: "menuitem" }],
    ["role=tab", "DIV", { role: "tab" }],
    ["role=slider", "DIV", { role: "slider" }],
    ["role=checkbox", "DIV", { role: "checkbox" }],
    ["role=option", "DIV", { role: "option" }],
    ["contenteditable", "DIV", { contenteditable: "true" }],
  ])("a focused %s outside the guide keeps its own keys", (_name, tag, attrs) => {
    expect(shouldHandleGuideKey(node(tag, attrs as Record<string, string>, body), guide, ev)).toBe(false);
  });
  test("any other page element is not ours either", () => {
    expect(shouldHandleGuideKey(node("DIV", {}, body), guide, ev)).toBe(false);
  });
  test("a held modifier is never ours", () => {
    expect(shouldHandleGuideKey(body, guide, { ctrlKey: true })).toBe(false);
    expect(shouldHandleGuideKey(body, guide, { metaKey: true })).toBe(false);
    expect(shouldHandleGuideKey(body, guide, { altKey: true })).toBe(false);
  });
});

describe("nextLine (passive lines)", () => {
  test("each section once, never more than 6 in total, never repeats", () => {
    for (const role of ROLE_IDS) {
      const visited = new Set<(typeof GUIDE_SECTION_IDS)[number]>();
      const lines: string[] = [];
      for (let pass = 0; pass < 3; pass++)
        for (const s of GUIDE_SECTION_IDS) {
          const l = nextLine(role, s, visited);
          if (l) {
            lines.push(l);
            visited.add(s);
          }
        }
      expect(lines.length).toBeLessThanOrEqual(MAX_PASSIVE_LINES);
      expect(new Set(lines).size).toBe(lines.length);
    }
  });
  test("a seventh visited section yields nothing", () => {
    const visited = new Set(GUIDE_SECTION_IDS) as Set<(typeof GUIDE_SECTION_IDS)[number]>;
    expect(nextLine("founder", "statement", new Set())).not.toBeNull();
    expect(nextLine("founder", "statement", visited)).toBeNull();
  });
});

describe("sectionUnder", () => {
  test("the section the line runs through, else null", () => {
    const list = [
      { id: "statement" as const, left: 0, right: 1, top: 100, bottom: 400 },
      { id: "highlights" as const, left: 0, right: 1, top: 400, bottom: 900 },
    ];
    expect(sectionUnder(list, 250)).toBe("statement");
    expect(sectionUnder(list, 400)).toBe("highlights");
    expect(sectionUnder(list, 50)).toBeNull();
    expect(sectionUnder(list, 900)).toBeNull();
  });
});
