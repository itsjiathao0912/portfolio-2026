import { describe, expect, test } from "bun:test";
import { LIFT_SHADOW, PARALLAX_MAX, liftTarget, parallaxOffset } from "../../src/components/motion/lift.ts";
import { DURATION, SPRING } from "../../src/components/motion/springs.ts";

describe("lift card poses", () => {
  test("hover lifts 12px, grows 1.025 and deepens the shadow", () => {
    expect(liftTarget("hover")).toEqual({ y: -12, scale: 1.025, boxShadow: LIFT_SHADOW.hover });
  });
  test("press squishes to 0.985; rest is flat", () => {
    expect(liftTarget("press").scale).toBe(0.985);
    expect(liftTarget("rest")).toEqual({ y: 0, scale: 1, boxShadow: LIFT_SHADOW.rest });
  });
  test("rows only rise 2px with no scale", () => {
    expect(liftTarget("hover", "row")).toMatchObject({ y: -2, scale: 1 });
  });
  test("reduced motion never transforms, shadow only", () => {
    for (const m of ["rest", "hover", "press"] as const) {
      const t = liftTarget(m, "card", true);
      expect(t.y).toBe(0);
      expect(t.scale).toBe(1);
    }
    expect(liftTarget("hover", "card", true).boxShadow).toBe(LIFT_SHADOW.hover);
  });
  test("parallax goes against the pointer and is capped", () => {
    expect(parallaxOffset(1000, 0, 50, 20).x).toBe(-PARALLAX_MAX);
    expect(parallaxOffset(0, 0, 50, 20)).toEqual({ x: 0, y: 0 });
  });
  test("every shadow step has the same layer count (interpolates)", () => {
    const n = (s: string) => s.split("),").length;
    expect(n(LIFT_SHADOW.rest)).toBe(n(LIFT_SHADOW.hover));
    expect(n(LIFT_SHADOW.press)).toBe(n(LIFT_SHADOW.hover));
  });
});

describe("motion tokens", () => {
  test("lift and stamp springs match the design system", () => {
    expect(SPRING.lift).toMatchObject({ stiffness: 190, damping: 20, mass: 1 });
    expect(SPRING.stamp).toMatchObject({ stiffness: 520, damping: 22 });
    expect(DURATION.reveal).toBe(0.52);
  });
});
