import { describe, expect, test } from "bun:test";
import { clamp, dockScale, DOCK_MAX_SCALE, DOCK_RANGE, kineticAxes, mixHex, pointerPercent, sectionProgress } from "../../src/components/signature/glass/math.ts";

describe("signature glass math", () => {
  test("pointerPercent clamps and handles empty rects", () => {
    const r = { left: 100, top: 100, width: 200, height: 100 };
    expect(pointerPercent(200, 150, r)).toEqual({ px: 50, py: 50 });
    expect(pointerPercent(0, 999, r)).toEqual({ px: 0, py: 100 });
    expect(pointerPercent(1, 1, { left: 0, top: 0, width: 0, height: 0 })).toEqual({ px: 50, py: 50 });
  });
  test("dockScale peaks at the pointer and fades to 1", () => {
    expect(dockScale(null, 50)).toBe(1);
    expect(dockScale(50, 50)).toBeCloseTo(DOCK_MAX_SCALE);
    expect(dockScale(50 + DOCK_RANGE, 50)).toBe(1);
    expect(dockScale(80, 50)).toBeGreaterThan(dockScale(120, 50));
  });
  test("sectionProgress 0..1 through a pinned section", () => {
    expect(sectionProgress(0, 2000, 1000)).toBe(0);
    expect(sectionProgress(-500, 2000, 1000)).toBe(0.5);
    expect(sectionProgress(-5000, 2000, 1000)).toBe(1);
    expect(sectionProgress(10, 500, 1000)).toBe(0);
  });
  test("mixHex blends and survives bad input", () => {
    expect(mixHex("#000000", "#ffffff", 0.5)).toBe("#808080");
    expect(mixHex("#0b1533", "#ffffff", 0)).toBe("#0b1533");
    expect(mixHex("nope", "#ffffff", 1)).toBe("nope");
  });
  test("kineticAxes stays within Archivo's axes", () => {
    for (const s of [-1, 0, 0.5, 1, 2]) for (const p of [0, 1]) {
      const { wght, wdth } = kineticAxes(s, p);
      expect(wght).toBeGreaterThanOrEqual(100);
      expect(wght).toBeLessThanOrEqual(900);
      expect(wdth).toBeGreaterThanOrEqual(62);
      expect(wdth).toBeLessThanOrEqual(125);
    }
    expect(clamp(5, 0, 1)).toBe(1);
  });
});
