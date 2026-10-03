import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { CAST, CHARACTER_NAMES, blinkDelay, buildWallTiles, cursorPath, numbersAreSourced, pupilOffset } from "../../src/components/signature/characters/logic";

describe("signature characters", () => {
  test("every cast member has a label", () => {
    for (const n of CHARACTER_NAMES) expect(CAST[n].label.length).toBeGreaterThan(0);
  });
  test("pupils stay inside the eye", () => {
    for (const [dx, dy] of [[1000, 0], [-500, 500], [0, 0], [3, -4]]) {
      const p = pupilOffset(dx, dy);
      expect(Math.hypot(p.x, p.y)).toBeLessThanOrEqual(2.2 + 1e-9);
    }
    expect(pupilOffset(0, 0)).toEqual({ x: 0, y: 0 });
  });
  test("blink delay is bounded", () => {
    expect(blinkDelay(-1)).toBe(2400);
    expect(blinkDelay(2)).toBe(5600);
  });
  test("cursor paths are deterministic and inside the safe box", () => {
    expect(cursorPath(7)).toEqual(cursorPath(7));
    for (const p of cursorPath(42, 50)) {
      expect(p.x).toBeGreaterThanOrEqual(6);
      expect(p.x).toBeLessThanOrEqual(80);
      expect(p.y).toBeGreaterThanOrEqual(8);
      expect(p.y).toBeLessThanOrEqual(92);
    }
  });
  test("wall tiles only show numbers found in their sourced text", () => {
    const tiles = buildWallTiles();
    expect(tiles.length).toBeGreaterThan(0);
    for (const t of tiles) expect(numbersAreSourced(t)).toBe(true);
    const site = readFileSync("content/site.ts", "utf8");
    for (const t of tiles) expect(site.includes(t.back.split(":")[0]) || site.includes(t.back)).toBe(true);
  });
  test("no external brand names in character art", () => {
    const src = readFileSync("src/components/signature/characters/character.tsx", "utf8").toLowerCase();
    for (const b of ["stripe", "linear", "apple", "notion", "duolingo"]) expect(src.includes(b)).toBe(false);
  });
});
