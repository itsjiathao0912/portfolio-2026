import { describe, expect, test } from "bun:test";
import project from "../../content/projects/reorc-data-platform";
import { blocks } from "../../src/components/case/reorc-data-platform";
import { related } from "../../src/components/case/reorc-data-platform/lineage-trace";
import { GAPS, openQuestions } from "../../src/components/case/reorc-data-platform/story-gap";
import { caughtAt } from "../../src/components/case/reorc-data-platform/uat-checkpoints";

describe("reorc-data-platform case study", () => {
  test("every custom block resolves and cites a source", () => {
    const custom = project.blocks.filter((b) => b.type === "custom");
    expect(custom.length).toBeGreaterThanOrEqual(2);
    for (const b of custom) {
      expect(blocks[b.component.split("/")[1]]).toBeTypeOf("function");
      expect(b.source?.length).toBeGreaterThan(10);
    }
  });
  test("story gaps close as requirements are added", () => {
    expect(openQuestions([]).length).toBe(GAPS.length);
    expect(openQuestions(GAPS.map((g) => g.id)).length).toBe(0);
  });
  test("lineage traces up from the report and down from a source", () => {
    expect([...related("rev", "up")].sort()).toEqual(["clean", "crm", "daily", "ltv", "orders", "rev"]);
    expect(related("crm", "down").has("rev")).toBe(true);
    expect(related("orders", "down").has("crm")).toBe(false);
  });
  test("a defect is caught late unless its checkpoint is on", () => {
    expect(caughtAt("join", [])).toBe(2);
    expect(caughtAt("join", ["data"])).toBe(1);
    expect(caughtAt("vague", ["req"])).toBe(0);
  });
  test("no confidential names or invented figures", () => {
    const text = JSON.stringify(project);
    for (const n of ["Chong Wei", "WAPS", "Taiwan Steel", "ARIZE"]) expect(text).not.toContain(n);
  });
});
