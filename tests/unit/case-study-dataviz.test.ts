import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import path from "node:path";
import { projectEntries } from "../../content/index.ts";
import { parseProjects } from "../../content/schema.ts";
import { formatValue, groupsOf, niceMax, percentChange, ticks } from "../../src/components/dataviz/scale.ts";

const parsed = parseProjects(projectEntries);
if (!parsed.ok) throw new Error(parsed.errors.join("\n"));
const projects = parsed.projects;
const byslug = (slug: string) => projects.find((p) => p.slug === slug)!;

describe("chart scale helpers", () => {
  test("niceMax rounds up to 1/2/2.5/5 x 10^k", () => {
    expect(niceMax(15)).toBe(20);
    expect(niceMax(60)).toBe(100);
    expect(niceMax(85)).toBe(100);
    expect(niceMax(40)).toBe(50);
    expect(niceMax(0)).toBe(1);
  });
  test("ticks are evenly spaced from 0", () => {
    expect(ticks(20, 4)).toEqual([0, 5, 10, 15, 20]);
  });
  test("percentChange and formatting", () => {
    expect(percentChange(100, 81.6)).toBe(-18.4);
    expect(percentChange(0, 5)).toBeNull();
    expect(formatValue(6.5, "%")).toBe("6.5%");
    expect(formatValue(1200)).toBe("1,200");
  });
  test("groups keep first-appearance order", () => {
    expect(groupsOf([{ group: "b" }, { group: "a" }, { group: "b" }, {}])).toEqual(["b", "a"]);
  });
});

describe("case-study content", () => {
  test("every layout is used at least once", () => {
    const layouts = new Set(projects.map((p) => p.meta.layout));
    expect([...layouts].sort()).toEqual(["magazine", "showcase", "story"]);
  });

  test("headlines are short and the lede never repeats them", () => {
    for (const p of projects) {
      const headline = p.meta.headline || p.title;
      expect(headline.split(/\s+/).length).toBeLessThanOrEqual(10);
      const lede = (p.meta.lede || p.summary).trim().toLowerCase();
      expect(lede).not.toBe(headline.trim().toLowerCase());
    }
  });

  test("every chart names a source", () => {
    for (const p of projects)
      for (const b of p.blocks)
        if (b.type === "barChart" || b.type === "lineChart" || b.type === "funnel" || b.type === "beforeAfter") expect(b.source.length).toBeGreaterThan(0);
  });

  test("Ledgr rule tree matches the seeded split: 27 rules, 6 types, 15 labour", () => {
    // The bar chart became the interactive ledgr/RuleTree; the seeded facts must still hold.
    const l = byslug("ledgr");
    const tree = l.blocks.find((b) => b.type === "custom" && b.component === "ledgr/RuleTree");
    if (tree?.type !== "custom") throw new Error("missing Ledgr rule tree");
    expect(tree.source).toMatch(/15 labour rules/);
    expect(tree.source).toMatch(/12 rules over 5 document types/);
    expect(JSON.stringify(l.meta)).toMatch(/"27"[^}]*6 document types/);
  });

  test("Cortex numbers are labelled as backtest", () => {
    const viz = byslug("cortex-sentinel").blocks.filter((b) => b.type === "funnel" || b.type === "beforeAfter");
    expect(viz.length).toBe(2);
    for (const b of viz) if (b.type === "funnel" || b.type === "beforeAfter") expect(b.badge?.toLowerCase()).toContain("backtest");
  });

  test("Zalo shows CV deltas only, no trend line", () => {
    const blocks = byslug("zalo-game-center").blocks;
    expect(blocks.some((b) => b.type === "lineChart" || b.type === "beforeAfter")).toBe(false);
  });

  test("every referenced /work asset exists in public/", () => {
    const json = JSON.stringify(projects);
    const assets = [...json.matchAll(/"(\/work\/[^"]+)"/g)].map((m) => m[1]);
    expect(assets.length).toBeGreaterThan(5);
    for (const a of assets) expect(existsSync(path.join(process.cwd(), "public", a))).toBe(true);
  });
});
