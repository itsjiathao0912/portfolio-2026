import { describe, expect, test } from "bun:test";
import project from "../../content/projects/zalo-game-center";
import { blocks } from "../../src/components/case/zalo-game-center";
import { reveal, RESULT } from "../../src/components/case/zalo-game-center/experiment-reveal";
import { resultsThrough, STEPS } from "../../src/components/case/zalo-game-center/measure-first";
import { LENSES } from "../../src/components/case/zalo-game-center/ownership-lens";

describe("zalo-game-center case study", () => {
  test("every custom block resolves and cites its source", () => {
    const custom = project.blocks.filter((b) => b.type === "custom");
    expect(custom.length).toBe(3);
    for (const b of custom) {
      expect(blocks[b.component.split("/")[1]]).toBeTypeOf("function");
      expect(b.source).toMatch(/CV/);
    }
  });
  test("reveal never names a winning placement", () => {
    expect(reveal(null)).toBeNull();
    for (const c of ["a", "b"] as const) {
      const r = reveal(c)!;
      expect(r.body).toContain(RESULT.value);
      expect(r.body + r.headline).not.toMatch(/placement (a|b) (won|earned)/i);
    }
  });
  test("results accumulate in order and use CV wording", () => {
    expect(resultsThrough(0)).toEqual(["−40%"]);
    expect(resultsThrough(2)).toEqual(["−40%", "+30%", "+15%", "+3% paying users"]);
    expect(STEPS).toHaveLength(3);
  });
  test("ownership lenses are distinct and never name clients", () => {
    expect(new Set(LENSES.map((l) => l.id)).size).toBe(3);
    expect(JSON.stringify(LENSES)).not.toMatch(/Chong Wei|WAPS|Taiwan Steel|ARIZE/);
  });
});
