import { describe, expect, test } from "bun:test";
import { siteEntry } from "../../content/index.ts";
import { headingAnchor, parseSite, tocEntries } from "../../content/schema.ts";
import { falloff, gridPoints, idleWave } from "../../src/lib/dot-grid-math";
import { execute } from "../../src/lib/db";
import { getSiteContent } from "../../src/lib/site";
import { buildSiteSeedStatements, rowsToSite, siteToRows } from "../../src/lib/site-rows";
import { createTestDb } from "../helpers/test-db";

const site = (() => {
  const result = parseSite(siteEntry);
  if (!result.ok) throw new Error(result.errors.join("\n"));
  return result.site;
})();
const AT = "2026-10-03T00:00:00.000Z";

describe("site rows", () => {
  test("site → rows → site round-trips", () => {
    const back = rowsToSite(siteToRows(site, AT));
    expect(back.ok && back.site).toEqual(site);
  });

  test("seed into SQLite and read back through getSiteContent, idempotently", async () => {
    const { db } = createTestDb();
    for (let i = 0; i < 2; i++) {
      for (const { sql, params } of buildSiteSeedStatements(site, AT)) await execute(db, sql, ...params);
    }
    const result = await getSiteContent(db);
    expect(result.ok && result.site).toEqual(site);
  });

  test("seed prunes entries removed from content", async () => {
    const { db, sqlite } = createTestDb();
    for (const { sql, params } of buildSiteSeedStatements(site, AT)) await execute(db, sql, ...params);
    const fewer = { ...site, awards: site.awards.slice(0, 1) };
    for (const { sql, params } of buildSiteSeedStatements(fewer, AT)) await execute(db, sql, ...params);
    const n = (sqlite.prepare(`SELECT COUNT(*) AS n FROM "ContentEntry" WHERE "collection" = 'awards'`).get() as { n: number }).n;
    expect(n).toBe(1);
  });

  test("corrupt JSON is reported, not thrown", () => {
    const rows = siteToRows(site, AT);
    rows[1] = { ...rows[1], data: "{nope" };
    const result = rowsToSite(rows);
    expect(result.ok).toBe(false);
  });

  test("an empty table fails validation instead of rendering a blank profile", () => {
    expect(rowsToSite([]).ok).toBe(false);
  });
});

describe("headings", () => {
  test("anchors are kebab-case and strip Vietnamese diacritics", () => {
    expect(headingAnchor("My role")).toBe("my-role");
    expect(headingAnchor("Hành trình kinh doanh")).toBe("hanh-trinh-kinh-doanh");
    expect(headingAnchor("Đào Thảo!")).toBe("dao-thao");
  });

  test("toc includes only level-2 headings", () => {
    expect(
      tocEntries([
        { type: "heading", text: "A", level: 2 },
        { type: "heading", text: "B", level: 3 },
        { type: "paragraph", text: "x" },
      ])
    ).toEqual([{ id: "a", label: "A" }]);
  });
});

describe("dot grid math", () => {
  test("falloff is 1 at the pointer, 0 at and beyond the radius, monotonic between", () => {
    expect(falloff(0, 100)).toBe(1);
    expect(falloff(100, 100)).toBe(0);
    expect(falloff(500, 100)).toBe(0);
    expect(falloff(25, 100)).toBeGreaterThan(falloff(75, 100));
    expect(falloff(10, 0)).toBe(0);
    expect(falloff(Number.NaN, 100)).toBe(0);
  });

  test("grid points cover the area and stay inside it", () => {
    const points = gridPoints(100, 50, 20);
    expect(points.length).toBe(5 * 2);
    for (const p of points) {
      expect(p.x).toBeGreaterThan(0);
      expect(p.x).toBeLessThan(100);
      expect(p.y).toBeGreaterThan(0);
      expect(p.y).toBeLessThan(50);
    }
    expect(gridPoints(0, 50, 20)).toEqual([]);
  });

  test("idle wave stays within 0..1", () => {
    for (let t = 0; t < 5000; t += 333) {
      const v = idleWave(37, 91, t);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });
});
