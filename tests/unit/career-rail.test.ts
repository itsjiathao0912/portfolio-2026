import { describe, expect, test } from "bun:test";
import { inertiaTarget, markerPercent, nearestCardIndex, stepScrollTarget } from "../../src/components/signature/ledger/career-rail-logic";
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
    expect(inertiaTarget(500, 0, 1000)).toBe(500);
    expect(inertiaTarget(500, -10, 1000)).toBe(1000);
    expect(inertiaTarget(500, 10, 1000)).toBe(0);
  });
  test("end-cap summary is derived from content", () => {
    expect(railSummary(9)).toMatch(/^\d+ roles · \d+\+ years · 9 products$/);
    expect(railSummary()).not.toContain("products");
  });
});
