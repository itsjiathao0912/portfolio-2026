import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { projectEntries } from "../../content/index.ts";
import { parseProjects } from "../../content/schema.ts";
import { photos } from "../../content/site.ts";

const parsed = parseProjects(projectEntries);
if (!parsed.ok) throw new Error(parsed.errors.join("\n"));
const json = JSON.stringify(parsed.projects) + JSON.stringify(photos);
const pub = (src: string) => join(import.meta.dir, "../../public", src);

describe("round-5 privacy and sourcing rules", () => {
  test("every metrics block carries a non-empty source line", () => {
    for (const p of parsed.projects)
      for (const b of p.blocks)
        if (b.type === "metrics") expect(b.source.trim().length, `${p.slug} metrics`).toBeGreaterThan(0);
  });
  test("schema rejects a metrics block without a source", () => {
    const bad = structuredClone(parsed.projects[0]) as unknown as { blocks: unknown[] };
    bad.blocks.push({ type: "metrics", items: [{ value: "1", label: "x" }] });
    expect(parseProjects([bad]).ok).toBe(false);
  });
  test("the BS34 group photo and the laptop-screen photo are gone", () => {
    for (const f of ["/photos/ledgr-meetup-group.webp", "/projects/ledgr/meetup/laptop-2.webp"]) {
      expect(json).not.toContain(f);
      expect(existsSync(pub(f))).toBe(false);
    }
    expect(json.toLowerCase()).not.toContain("the whole room");
  });
  test("the Ledgr demo photo is the BS33 room shot, captioned accurately", () => {
    const p = photos.find((x) => x.id === "bs33-ledgr-demo");
    expect(p?.caption).toBe("Build Stuffs #33 · Ledgr demo");
    expect(existsSync(pub(p!.src))).toBe(true);
  });
  test("AABW is described as 2nd place, never as winners", () => {
    expect(json.toLowerCase()).not.toMatch(/track winners|as winners/);
    expect(photos.find((x) => x.id === "aabw-winners")?.caption).toContain("2nd place");
  });
  test("every referenced photo exists on disk", () => {
    for (const p of photos) expect(existsSync(pub(p.src)), p.src).toBe(true);
  });
});

describe("card visuals", () => {
  test("no two illustrated projects share a motif", () => {
    const motifs = parsed.projects.flatMap((p) => (p.meta.visual.kind === "illustration" ? [p.meta.visual.motif] : []));
    expect(new Set(motifs).size).toBe(motifs.length);
    expect(parsed.projects.find((p) => p.slug === "guardline")!.meta.visual).toMatchObject({ motif: "fraudRing" });
  });
});
