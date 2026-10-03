import { describe, expect, test } from "bun:test";
import project from "../../content/projects/pac";
import { blocks } from "../../src/components/case/pac";
import { BOOKS, cheapest, total } from "../../src/components/case/pac/price-books";
import { correct, ROWS } from "../../src/components/case/pac/reconcile";

describe("pac case study", () => {
  test("custom blocks resolve and carry a source", () => {
    const custom = project.blocks.filter((b) => b.type === "custom");
    expect(custom.length).toBe(2);
    for (const b of custom) {
      expect(blocks[b.component.split("/")[1]]).toBeTypeOf("function");
      expect(b.source).toBeTruthy();
    }
  });
  test("normalised per-hour rates match the raw quotes", () => {
    for (const b of BOOKS) expect(total(b, 720)).toBeCloseTo(b.perHour * 720, 6);
    expect(cheapest(720).id).toBe("C");
  });
  test("reconcile picks the right correction", () => {
    expect(ROWS.map(correct)).toEqual(["none", "credit", "bill", "collect"]);
  });
  test("no confidential names or invented metrics", () => {
    expect(JSON.stringify(project)).not.toMatch(/Chong Wei|WAPS|Taiwan Steel|ARIZE|%/);
  });
});
