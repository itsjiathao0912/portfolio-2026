import { describe, expect, test } from "bun:test";
import { nextDepthIndex } from "../../src/components/site/case-study/reading/logic";

describe("depth radiogroup keys (WAI-ARIA radio pattern)", () => {
  test("arrows wrap, Home/End jump, other keys ignored", () => {
    expect(nextDepthIndex("ArrowRight", 2, 3)).toBe(0);
    expect(nextDepthIndex("ArrowDown", 0, 3)).toBe(1);
    expect(nextDepthIndex("ArrowLeft", 0, 3)).toBe(2);
    expect(nextDepthIndex("ArrowUp", 1, 3)).toBe(0);
    expect(nextDepthIndex("Home", 2, 3)).toBe(0);
    expect(nextDepthIndex("End", 0, 3)).toBe(2);
    expect(nextDepthIndex("Tab", 0, 3)).toBeNull();
  });
});
