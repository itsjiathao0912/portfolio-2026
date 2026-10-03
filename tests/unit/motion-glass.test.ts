import { describe, expect, test } from "bun:test";
import { displacementAt, mapSize, roundedRectSdf, supportsSvgBackdrop, MAX_MAP } from "../../src/components/glass/displacement.ts";
import { formatCounter, magnetOffset, MAGNET_MAX, parseCounter, PRESS_SCALE, SPRING } from "../../src/components/motion/springs.ts";
import { burstParticles } from "../../src/components/motion/emoji-burst.tsx";
import { isActive, shouldCloseSheet } from "../../src/components/site/site-nav.tsx";
import { buildHighlights } from "../../src/components/site/highlights-grid.tsx";
import site from "../../content/site.ts";
import { parseProjects, parseSite } from "../../content/schema.ts";
import { projectEntries as projects } from "../../content/index.ts";

describe("liquid glass", () => {
  const CHROME = "Mozilla/5.0 (Macintosh) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";
  const SAFARI = "Mozilla/5.0 (Macintosh) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15";
  const IOS_CHROME = "Mozilla/5.0 (iPhone) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/130.0 Mobile/15E148 Safari/604.1";
  const FIREFOX = "Mozilla/5.0 (Macintosh; rv:131.0) Gecko/20100101 Firefox/131.0";
  test("refraction only on Chromium; WebKit (incl. iOS Chrome) and Firefox fall back", () => {
    expect(supportsSvgBackdrop(CHROME)).toBe(true);
    expect(supportsSvgBackdrop(SAFARI)).toBe(false);
    expect(supportsSvgBackdrop(IOS_CHROME)).toBe(false);
    expect(supportsSvgBackdrop(FIREFOX)).toBe(false);
  });
  test("SDF: negative inside, zero on the edge, positive outside", () => {
    expect(roundedRectSdf(0, 0, 50, 20, 10)).toBeLessThan(0);
    expect(roundedRectSdf(50, 0, 50, 20, 10)).toBeCloseTo(0, 5);
    expect(roundedRectSdf(60, 0, 50, 20, 10)).toBeGreaterThan(0);
  });
  test("no shift in the centre; rim pixels pushed along the outward normal", () => {
    expect(displacementAt(50, 16, 100, 32, 16, 10)).toEqual([128, 128]);
    const [rRight] = displacementAt(99, 16, 100, 32, 16, 10);
    const [rLeft] = displacementAt(0, 16, 100, 32, 16, 10);
    expect(rRight).toBeGreaterThan(128);
    expect(rLeft).toBeLessThan(128);
    const [, gTop] = displacementAt(50, 0, 100, 32, 16, 10);
    expect(gTop).toBeLessThan(128);
  });
  test("map is capped and keeps aspect ratio", () => {
    const s = mapSize(1200, 64);
    expect(Math.max(s.w, s.h)).toBeLessThanOrEqual(MAX_MAP);
    expect(s.w / s.h).toBeCloseTo(1200 / 64, 0);
    expect(mapSize(200, 64)).toEqual({ w: 200, h: 64, scale: 1 });
  });
});

describe("motion presets", () => {
  test("nav indicator spring and press grow match the spec", () => {
    expect(SPRING.indicator).toMatchObject({ stiffness: 500, damping: 38 });
    expect(PRESS_SCALE).toBe(1.06);
  });
  test("magnetic offset never exceeds 6px", () => {
    expect(magnetOffset(1000, -1000, 50, 20)).toEqual({ x: MAGNET_MAX, y: -MAGNET_MAX });
    expect(magnetOffset(0, 0, 50, 20)).toEqual({ x: 0, y: 0 });
    expect(Math.abs(magnetOffset(25, 0, 50, 20).x)).toBeLessThanOrEqual(6);
  });
  test("counters keep prefix/suffix and land on the source value", () => {
    for (const v of ["+30%", "~20", "95%", "27", "$635M", "2,500+", "-40%"]) {
      const spec = parseCounter(v);
      expect(spec).not.toBeNull();
      expect(formatCounter(spec!.target, spec!)).toBe(v);
    }
    expect(parseCounter("Top 10")).toBeNull();
    expect(parseCounter("2nd")).toBeNull();
    expect(formatCounter(0, parseCounter("+30%")!)).toBe("+0%");
  });
  test("bursts are capped and spray upward", () => {
    const p = burstParticles(["🇻🇳"], 40, 3);
    expect(p.length).toBeLessThanOrEqual(10);
    expect(p.every((x) => x.y < 0)).toBe(true);
  });
});

describe("nav", () => {
  test("active item per route", () => {
    expect(isActive("/", "/")).toBe(true);
    expect(isActive("/work/ledgr", "/#work")).toBe(true);
    expect(isActive("/about", "/about")).toBe(true);
    expect(isActive("/about", "/#work")).toBe(false);
  });
  test("sheet closes on a flick or a 30% drag, rubber-bands otherwise", () => {
    expect(shouldCloseSheet(-20, -800, 500)).toBe(true);
    expect(shouldCloseSheet(-160, 0, 500)).toBe(true);
    expect(shouldCloseSheet(-60, -100, 500)).toBe(false);
    expect(shouldCloseSheet(80, 900, 500)).toBe(false);
  });
});

describe("home content for motion", () => {
  test("every highlight tile has its own mark", () => {
    const parsed = parseSite(site);
    if (!parsed.ok) throw new Error(parsed.errors.join("; "));
    const { tiles } = buildHighlights(parsed.site);
    expect(new Set(tiles.map((t) => t.glyph)).size).toBe(tiles.length);
  });
  test("every project has an emoji and a hex colour, all distinct", () => {
    const parsed = parseProjects(projects);
    if (!parsed.ok) throw new Error(parsed.errors.join("; "));
    const metas = parsed.projects.map((p) => p.meta);
    for (const m of metas) {
      expect(m.emoji).toBeTruthy();
      expect(m.color).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
    expect(new Set(metas.map((m) => m.color)).size).toBe(metas.length);
    expect(new Set(metas.map((m) => m.emoji)).size).toBe(metas.length);
  });
});

describe("linkedin posts", () => {
  test("embed src from urn; junk rejected", async () => {
    const { linkedinEmbedSrc, dedupePosts } = await import("../../src/components/site/linkedin-posts.tsx");
    expect(linkedinEmbedSrc("urn:li:activity:7483045282734104576")).toBe(
      "https://www.linkedin.com/embed/feed/update/urn:li:activity:7483045282734104576?collapsed=1"
    );
    expect(linkedinEmbedSrc("javascript:alert(1)")).toBeNull();
    const a = { urn: "urn:li:share:1" };
    expect(dedupePosts([a, a, { urn: "bad" }, { urn: "urn:li:ugcPost:2" }]).map((p) => p.urn)).toEqual(["urn:li:share:1", "urn:li:ugcPost:2"]);
  });
  test("content: three distinct posts, each with an excerpt and a valid date", async () => {
    const { linkedinPosts } = await import("../../content/site.ts");
    const { formatPostDate } = await import("../../src/components/site/linkedin-posts.tsx");
    expect(new Set(linkedinPosts.map((p) => p.urn)).size).toBe(linkedinPosts.length);
    for (const p of linkedinPosts) {
      expect(p.excerpt.length).toBeGreaterThan(80);
      expect(formatPostDate(p.date)).toMatch(/^\d{1,2} [A-Z][a-z]{2} 2026$/);
    }
    expect(formatPostDate("2026-09-13")).toBe("13 Sep 2026");
  });
});

describe("home card pictures", () => {
  test("every mockup project points at its own screenshot file that exists", async () => {
    const parsed = parseProjects(projects);
    if (!parsed.ok) throw new Error(parsed.errors.join("; "));
    const srcs = parsed.projects.flatMap((p) => (p.meta.visual.kind === "mockup" ? [p.meta.visual.screen.src] : []));
    expect(srcs.length).toBeGreaterThanOrEqual(4);
    expect(new Set(srcs).size).toBe(srcs.length);
    for (const src of srcs) expect(await Bun.file(`public${src}`).exists()).toBe(true);
  });
});
