import { describe, expect, test } from "bun:test";
import { projectEntries } from "../../content/index.ts";
import { parseProjects, type ContentBlock } from "../../content/schema.ts";
import { glossBlocks } from "../../src/lib/glossary-blocks";
import { GLOSSARY, annotateText, segmentsText } from "../../src/lib/glossary";
import {
  defaultDepthForPersona,
  effectiveDepths,
  evidenceTone,
  groupRuns,
  isVisibleAt,
  parseDepthHash,
  resolveDepth,
  tocWithDepth,
  visibleToc,
} from "../../src/components/site/case-study/reading/logic";

const parsed = parseProjects(projectEntries);
if (!parsed.ok) throw new Error(parsed.errors.join("; "));
const projects = parsed.projects;

const h = (text: string, depth?: "skim" | "read" | "deep"): ContentBlock => ({ type: "heading", text, level: 2, ...(depth ? { depth } : {}) });
const p = (text: string, depth?: "skim" | "read" | "deep"): ContentBlock => ({ type: "paragraph", text, ...(depth ? { depth } : {}) });

describe("schema: reading aids", () => {
  test("every case parses with at most 2 decisions and exactly one results band, last", () => {
    for (const project of projects) {
      const types = project.blocks.map((b) => b.type);
      expect(types.filter((t) => t === "decision").length).toBeLessThanOrEqual(2);
      expect(types.filter((t) => t === "results").length).toBe(1);
      expect(types[types.length - 1]).toBe("results");
    }
  });
  test("every decision cites a source; results carry items or shipped; badges are on every item", () => {
    for (const project of projects) {
      for (const block of project.blocks) {
        if (block.type === "decision") expect(block.source.length).toBeGreaterThan(5);
        if (block.type === "results") {
          expect(block.items.length + block.shipped.length).toBeGreaterThan(0);
          for (const item of block.items) expect(item.badge, `${project.slug}: ${item.label}`).toBeTruthy();
        }
      }
    }
  });
  test("an empty results band is rejected", () => {
    const bad = { ...(projectEntries[0] as object), blocks: [{ type: "results", source: "x" }] };
    expect(parseProjects([bad]).ok).toBe(false);
  });
  test("three decisions are rejected", () => {
    const d = { type: "decision", title: "t", rejected: { label: "a", text: "a" }, chosen: { label: "b", text: "b" }, because: "c", source: "s" };
    const bad = { ...(projectEntries[0] as object), blocks: [d, d, d] };
    expect(parseProjects([bad]).ok).toBe(false);
  });
  test("an unknown depth is rejected", () => {
    const bad = { ...(projectEntries[0] as object), blocks: [{ type: "paragraph", text: "x", depth: "huge" }] };
    expect(parseProjects([bad]).ok).toBe(false);
  });
  test("no results figure carries a confidential customer name", () => {
    const text = JSON.stringify(projects.flatMap((pr) => pr.blocks.filter((b) => b.type === "results" || b.type === "decision")));
    expect(text).not.toMatch(/Chong Wei|WAPS|Taiwan Steel|ARIZE/i);
    expect(text).not.toContain("186");
  });
});

describe("depth filtering", () => {
  const blocks = [h("A", "skim"), p("a1"), h("B"), p("b1"), p("b2", "skim"), h("C", "deep"), p("c1")];
  test("a heading sets its section; a block override wins; results and decisions default to skim", () => {
    expect(effectiveDepths(blocks)).toEqual(["skim", "skim", "read", "read", "skim", "deep", "deep"]);
    const d = effectiveDepths([h("X"), { type: "decision", title: "t", rejected: { label: "a", text: "a" }, chosen: { label: "b", text: "b" }, because: "c", source: "s" }, { type: "results", heading: "R", items: [], shipped: ["x"], source: "s" }]);
    expect(d).toEqual(["read", "skim", "skim"]);
  });
  test("runs group consecutive equal depths", () => {
    expect(groupRuns(effectiveDepths(blocks))).toEqual([
      { depth: "skim", start: 0, end: 2 },
      { depth: "read", start: 2, end: 4 },
      { depth: "skim", start: 4, end: 5 },
      { depth: "deep", start: 5, end: 7 },
    ]);
  });
  test("visibility is cumulative", () => {
    expect(isVisibleAt("skim", "skim")).toBe(true);
    expect(isVisibleAt("read", "skim")).toBe(false);
    expect(isVisibleAt("read", "deep")).toBe(true);
    expect(isVisibleAt("deep", "read")).toBe(false);
  });
  test("the TOC lists only sections visible at the depth", () => {
    const toc = tocWithDepth(blocks);
    expect(visibleToc(toc, "skim").map((e) => e.label)).toEqual(["A"]);
    expect(visibleToc(toc, "read").map((e) => e.label)).toEqual(["A", "B"]);
    expect(visibleToc(toc, "deep").map((e) => e.label)).toEqual(["A", "B", "C"]);
  });
  test("skim shows strictly less than read, read less than deep, on every real case", () => {
    for (const project of projects) {
      const d = effectiveDepths(project.blocks);
      const n = (mode: "skim" | "read" | "deep") => d.filter((x) => isVisibleAt(x, mode)).length;
      expect(n("skim"), project.slug).toBeLessThan(n("read"));
      expect(n("read"), project.slug).toBeLessThanOrEqual(n("deep"));
      // Skim always keeps the results band and the first section's heading.
      expect(d[d.length - 1]).toBe("skim");
      expect(d[0]).toBe("skim");
    }
  });
  test("custom (interactive) blocks stay at read or deeper only where tagged, never hidden in read", () => {
    for (const project of projects) {
      const d = effectiveDepths(project.blocks);
      project.blocks.forEach((b, i) => {
        if (b.type === "custom") expect(d[i], `${project.slug} ${b.component}`).not.toBe("deep");
      });
    }
  });
});

describe("persona and hash resolution", () => {
  test("persona defaults", () => {
    expect(defaultDepthForPersona("recruiter")).toBe("skim");
    expect(defaultDepthForPersona("engineer")).toBe("deep");
    expect(defaultDepthForPersona("founder")).toBe("read");
    expect(defaultDepthForPersona(null)).toBe("read");
  });
  test("hash > own choice (same persona) > persona default > read", () => {
    expect(parseDepthHash("#deep")).toBe("deep");
    expect(parseDepthHash("#how-a-rule-is-born")).toBeNull();
    expect(resolveDepth({ hash: "#deep", stored: { depth: "skim", persona: "recruiter" }, persona: "recruiter" })).toBe("deep");
    expect(resolveDepth({ hash: "", stored: { depth: "read", persona: "recruiter" }, persona: "recruiter" })).toBe("read");
    expect(resolveDepth({ hash: "", stored: { depth: "read", persona: "recruiter" }, persona: "engineer" })).toBe("deep");
    expect(resolveDepth({ hash: "", stored: null, persona: null })).toBe("read");
  });
});

describe("evidence tone", () => {
  test("sourced figures are settled, modelled or targeted ones are muted", () => {
    for (const l of ["Live, seeded rules", "Company figure", "Public data", "Public result"]) expect(evidenceTone(l)).toBe("settled");
    for (const l of ["Backtest, sample data", "Target, synthetic data", "Strategy model, not a result", "My account", "My CV"]) expect(evidenceTone(l)).toBe("muted");
  });
});

describe("glossary", () => {
  test("first occurrence only, per page", () => {
    const seen = new Set<string>();
    const a = annotateText("AML checks and more AML checks.", seen);
    expect(a.filter((s) => typeof s !== "string").length).toBe(1);
    expect(segmentsText(a)).toBe("AML checks and more AML checks.");
    const b = annotateText("Another AML line.", seen);
    expect(b).toEqual(["Another AML line."]);
  });
  test("acronyms are case-sensitive and word-bounded; plain words are not", () => {
    const hit = (t: string) => annotateText(t, new Set()).some((s) => typeof s !== "string");
    expect(hit("a pit stop")).toBe(false);
    expect(hit("STRUCTURING")).toBe(false);
    expect(hit("the ERP draft")).toBe(true);
    expect(hit("the erp system")).toBe(false);
    expect(hit("custody of keys")).toBe(true);
    expect(hit("tokenised funds")).toBe(true);
  });
  test("definitions are short, plain and carry no numbers", () => {
    for (const e of GLOSSARY) {
      expect(e.def.length, e.id).toBeLessThan(200);
      expect(e.def, e.id).not.toMatch(/\d/);
    }
  });
  test("every glossary entry is used by at least one case study (no dead entries)", () => {
    const used = new Set<string>();
    for (const project of projects) {
      for (const g of glossBlocks(project.blocks).values()) {
        for (const segs of [g.text ?? [], ...(g.items ?? []), ...Object.values(g.fields ?? {})]) for (const s of segs) if (typeof s !== "string") used.add(s.id);
      }
    }
    expect(GLOSSARY.map((e) => e.id).filter((id) => !used.has(id))).toEqual([]);
  });
  test("a term is annotated at most once per case page", () => {
    for (const project of projects) {
      const ids: string[] = [];
      for (const g of glossBlocks(project.blocks).values()) {
        for (const segs of [g.text ?? [], ...(g.items ?? []), ...Object.values(g.fields ?? {})]) for (const s of segs) if (typeof s !== "string") ids.push(s.id);
      }
      expect(new Set(ids).size, project.slug).toBe(ids.length);
    }
  });
});
