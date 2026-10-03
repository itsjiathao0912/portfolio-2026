import { describe, expect, test } from "bun:test";
import { blocks } from "../../src/components/case/gocrypto";
import { WALKTHROUGH_STEPS, stepAt } from "../../src/components/case/gocrypto/phone-walkthrough";

describe("gocrypto phone walkthrough", () => {
  test("is registered as a custom block", () => {
    expect(blocks.PhoneWalkthrough).toBeDefined();
  });
  test("uses the five real concept screens, each with alt text and a caption", () => {
    expect(WALKTHROUGH_STEPS).toHaveLength(5);
    for (const s of WALKTHROUGH_STEPS) {
      expect(s.src).toMatch(/^\/work\/gocrypto\/screen-[1-5]\.webp$/);
      expect(s.alt.length).toBeGreaterThan(10);
      expect(s.caption.length).toBeGreaterThan(20);
    }
  });
  test("stepAt maps scroll progress to a clamped step", () => {
    expect(stepAt(0, 5)).toBe(0);
    expect(stepAt(0.199, 5)).toBe(0);
    expect(stepAt(0.2, 5)).toBe(1);
    expect(stepAt(0.99, 5)).toBe(4);
    expect(stepAt(1, 5)).toBe(4);
    expect(stepAt(-1, 5)).toBe(0);
    expect(stepAt(0.5, 1)).toBe(0);
  });
});
