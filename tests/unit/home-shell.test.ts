import { describe, expect, test } from "bun:test";
import site from "../../content/site.ts";
import { parseSite } from "../../content/schema.ts";
import { heroHeadline } from "../../src/lib/hero.ts";
import { bwVariant } from "../../src/components/site/portrait.tsx";
import { groupProjects, surfaceFor } from "../../src/components/site/project-stack.tsx";
import { buildHighlights } from "../../src/components/site/highlights-grid.tsx";

const parsed = parseSite(site);
if (!parsed.ok) throw new Error(parsed.errors.join("; "));
const data = parsed.site;

describe("hero headline", () => {
  test("uses the authored sentence with the real company", () => {
    expect(heroHeadline(data.profile)).toBe("Thao Dao is Technical Product Manager at SkyLab Group");
  });
  test("builds the sentence when the headline is not one", () => {
    expect(heroHeadline({ name: "A", title: "PM", company: "X", headline: "Hi" })).toBe("A is PM at X");
    expect(heroHeadline({ name: "A", title: "PM", company: "", headline: "Hi" })).toBe("A is PM");
  });
});

describe("portrait", () => {
  test("content points at a colour cut-out with a B/W sibling that exists", async () => {
    const src = data.profile.portrait!;
    expect(src).toMatch(/-color\.webp$/);
    const bw = bwVariant(src)!;
    expect(bw).toBe(src.replace("-color", "-bw"));
    for (const path of [src, bw]) expect(await Bun.file(`public${path}`).exists()).toBe(true);
  });
  test("no pair → null (CSS grayscale fallback)", () => {
    expect(bwVariant("/portrait.jpg")).toBeNull();
  });
});

describe("project stack", () => {
  const mk = (slug: string, category: string) => ({ slug, category }) as never;
  test("groups hackathons then personal after shipped platforms, keeping order", () => {
    const groups = groupProjects([mk("a", "Product"), mk("b", "Personal"), mk("c", "Growth & data"), mk("d", "Hackathon")]);
    expect(groups.map((g) => g.label)).toEqual(["Shipped platforms", "Hackathons", "Personal products"]);
    expect(groups[0].projects.map((p) => p.slug)).toEqual(["a", "c"]);
  });
  test("surfaces: no dark card, every third gradient", () => {
    expect([0, 1, 2, 3].map((i) => surfaceFor(i))).toEqual(["white", "gradient", "white", "white"]);
  });
});

describe("highlights", () => {
  test("lead is the first award; six supporting tiles", () => {
    const { lead, tiles } = buildHighlights(data);
    expect(lead?.id).toBe(data.awards[0].id);
    expect(tiles).toHaveLength(6);
    expect(tiles.filter((t) => t.icon === "cert")).toHaveLength(data.certifications.length);
  });
});

describe("socials", () => {
  test("only the confirmed LinkedIn and GitHub links", () => {
    expect(data.profile.socials.map((s) => s.href)).toEqual([
      "https://www.linkedin.com/in/thaodao0912/",
      "https://github.com/itsjiathao0912",
    ]);
  });
});
