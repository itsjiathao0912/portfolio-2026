import { describe, expect, test } from "bun:test";
import { dragReleaseTarget, markerPercent, nearestCardIndex, stepScrollTarget } from "../../src/components/signature/ledger/career-rail-logic";
import { railSummary } from "../../src/components/signature/ledger/ledger-data";

describe("career rail logic", () => {
  test("nearest card to the centre", () => {
    expect(nearestCardIndex([100, 400, 700], 380)).toBe(1);
    expect(nearestCardIndex([100, 400, 700], 900)).toBe(2);
    expect(nearestCardIndex([], 0)).toBe(0);
  });
  test("marker sits at the centre of each segment and stays in range", () => {
    expect(markerPercent(0, 4)).toBe(12.5);
    expect(markerPercent(3, 4)).toBe(87.5);
    expect(markerPercent(99, 4)).toBe(87.5);
    expect(markerPercent(-2, 4)).toBe(12.5);
    expect(markerPercent(0, 0)).toBe(0);
  });
  test("arrow steps and drag coasting clamp to the scroll range", () => {
    expect(stepScrollTarget(0, 300, -1, 1000)).toBe(0);
    expect(stepScrollTarget(900, 300, 1, 1000)).toBe(1000);
    expect(stepScrollTarget(100, 300, 1, 1000)).toBe(400);
  });
  test("drag release snaps to the nearest card with modest momentum", () => {
    const snaps = [0, 300, 600, 900, 1200];
    // 40px nudge from card 1 (rest at 300), slow release: stays
    expect(dragReleaseTarget(340, 0, 1200, snaps)).toBe(300);
    // 40px drag left with small velocity (0.1 px/ms): still the same card
    expect(dragReleaseTarget(260, 0.1, 1200, snaps)).toBe(300);
    // 230px drag, slow: lands one card over, not the end
    expect(dragReleaseTarget(530, 0, 1200, snaps)).toBe(600);
    // fast flick (huge velocity is capped): moves about one card, never to the end
    expect(dragReleaseTarget(300, -50, 1200, snaps)).toBe(600);
    expect(dragReleaseTarget(300, 50, 1200, snaps)).toBe(0);
    // clamps to the scroll range
    expect(dragReleaseTarget(1190, -5, 1000, snaps)).toBe(1000);
    expect(dragReleaseTarget(50, 0, 1200, [])).toBe(50);
  });
  test("end-cap summary is derived from content", () => {
    expect(railSummary(9)).toMatch(/^\d+ roles · \d+\+ years · 9 products$/);
    expect(railSummary()).not.toContain("products");
  });
});
