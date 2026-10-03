import { describe, expect, test } from "bun:test";
import { projectEntries } from "../../content/index.ts";
import { parseProjects } from "../../content/schema.ts";
import { connectedTo } from "../../src/components/dataviz/graph.ts";
import { bandFor, lerp, nearestStop } from "../../src/components/dataviz/scale.ts";

const parsed = parseProjects(projectEntries);
if (!parsed.ok) throw new Error(parsed.errors.join("\n"));
const bySlug = (slug: string) => parsed.projects.find((p) => p.slug === slug)!;
const json = JSON.stringify(parsed.projects);

describe("interactive viz helpers", () => {
  test("bandFor picks the last band at or below the score", () => {
    const bands = [{ from: 0, l: "approve" }, { from: 30, l: "review" }, { from: 80, l: "block" }, { from: 100, l: "decline" }];
    expect(bandFor(0, bands).l).toBe("approve");
    expect(bandFor(45, bands).l).toBe("review");
    expect(bandFor(80, bands).l).toBe("block");
    expect(bandFor(200, bands).l).toBe("decline");
  });
  test("lerp clamps and nearestStop snaps", () => {
    expect(lerp(10, 20, 0.5)).toBe(15);
    expect(lerp(10, 20, 2)).toBe(20);
    expect(nearestStop(0.49, 5)).toBe(2);
    expect(nearestStop(1, 5)).toBe(4);
  });
  test("connectedTo follows a node's path both ways only", () => {
    const edges = [{ from: "a", to: "b" }, { from: "b", to: "c" }, { from: "x", to: "c" }, { from: "c", to: "d" }];
    expect([...connectedTo("b", edges)].sort()).toEqual(["a", "b", "c", "d"]);
  });
  test("schema rejects an explorable edge to an unknown node", () => {
    const bad = structuredClone(bySlug("guardline")) as unknown as { blocks: { type: string; edges?: { from: string; to: string }[] }[] };
    bad.blocks.find((b) => b.type === "explorable")!.edges!.push({ from: "signals", to: "ghost" });
    expect(parseProjects([bad]).ok).toBe(false);
  });
});

describe("round-4 content rules", () => {
  test("no client names from the confidential decks", () => {
    for (const name of ["Chong Wei", "WAPS", "Taiwan Steel", "ARIZE"]) expect(json).not.toContain(name);
  });
  test("GoCrypto uses the corrected appendix figures, not stale ones", () => {
    const g = JSON.stringify(bySlug("gocrypto"));
    expect(g).toContain("₱85M");
    expect(g).toContain("₱1.5B");
    expect(g).not.toContain("₱112M");
    expect(g).not.toContain("1,750,000");
    expect(g.toLowerCase()).toContain("not affiliated with gotyme");
  });
  test("Guardline claims no placement; Cortex has no track name", () => {
    const g = JSON.stringify(bySlug("guardline")).toLowerCase();
    for (const w of ["winner", "1st", "2nd", "runner-up", "place,"]) expect(g).not.toContain(w);
    expect(JSON.stringify(bySlug("cortex-sentinel"))).not.toMatch(/Fintech track|GoTymeX track/);
    expect(bySlug("cortex-sentinel").category).toBe("Hackathon");
  });
  test("Lumicap is titled by Luminet; multisig needs 2 of 3", () => {
    const l = bySlug("lumicap");
    expect(l.meta.subtitle).toBe("by Luminet");
    const x = l.blocks.find((b) => b.type === "explorable");
    if (x?.type !== "explorable" || !x.quorum) throw new Error("missing multisig");
    expect(x.quorum.need).toBe(2);
    expect(x.quorum.nodes.length).toBe(3);
  });
  test("every new chart names a source and case studies keep ≤2 heavy interactives", () => {
    const heavy = ["scoreLadder", "compareSlider", "scrubTimeline", "explorable"];
    for (const p of parsed.projects) {
      for (const b of p.blocks) if (b.type === "stackedBar" || heavy.includes(b.type)) expect((b as { source: string }).source.length).toBeGreaterThan(0);
      expect(p.blocks.filter((b) => heavy.includes(b.type)).length).toBeLessThanOrEqual(2);
    }
  });
  test("the Cortex video is a small loop, never the full file", async () => {
    const { statSync } = await import("node:fs");
    expect(statSync("public/work/cortex-sentinel/demo-loop.mp4").size).toBeLessThan(2 * 1024 * 1024);
  });
});
