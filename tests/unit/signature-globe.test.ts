import { describe, expect, test } from "bun:test";
import { arcPoints, decay, distToSegment, fibonacciSphere, isLand, latLonToVec, project, rotate, vecToLatLon } from "../../src/components/signature/globe/geo";
import { ARCS, CORRIDORS, PLACES, placeById, projectsAt } from "../../src/components/signature/globe/routes";
import { hexToRgb } from "../../src/components/signature/globe/brand-gradient";
import { projectEntries } from "../../content/index.ts";

describe("geo", () => {
  test("lat/lon round-trips", () => {
    const v = latLonToVec(10.82, 106.63);
    const ll = vecToLatLon(v);
    expect(ll.lat).toBeCloseTo(10.82, 5);
    expect(ll.lon).toBeCloseTo(106.63, 5);
  });
  test("rotation preserves length", () => {
    const r = rotate(latLonToVec(30, 40), 1.1, -0.3);
    expect(Math.hypot(...r)).toBeCloseTo(1, 9);
  });
  test("arc endpoints sit on the cities and the middle is lifted", () => {
    const a = latLonToVec(25.2, 55.27), b = latLonToVec(14.6, 120.98);
    const pts = arcPoints(a, b, 20);
    expect(pts[0][0]).toBeCloseTo(a[0], 9);
    expect(pts[20][2]).toBeCloseTo(b[2], 9);
    expect(Math.hypot(...pts[10])).toBeGreaterThan(1.05);
  });
  test("front face projects with z > 0", () => {
    expect(project(latLonToVec(0, 0), 0, 0, 1).z).toBeCloseTo(1, 9);
  });
  test("fibonacci sphere size and land mask", () => {
    expect(fibonacciSphere(100)).toHaveLength(100);
    expect(isLand(10.8, 106.6)).toBe(true); // Vietnam
    expect(isLand(0, -140)).toBe(false); // Pacific
  });
  test("segment distance and inertia decay", () => {
    expect(distToSegment(5, 5, 0, 0, 10, 0)).toBe(5);
    expect(Math.abs(decay(0.01, 16.67))).toBeLessThan(0.01);
    expect(decay(1e-6, 16)).toBe(0);
  });
});

describe("routes come from real content", () => {
  const slugs = new Set((projectEntries as { slug: string }[]).map((p) => p.slug));
  test("every corridor links to a published project slug", () => {
    for (const c of CORRIDORS) {
      expect(slugs.has(c.slug)).toBe(true);
      expect(c.href).toBe(`/work/${c.slug}`);
      placeById(c.from);
      placeById(c.to);
    }
  });
  test("stat lines are copied from the project's own proof", () => {
    for (const c of CORRIDORS) {
      const p = (projectEntries as { slug: string; meta: { proof?: { value: string }[] } }[]).find((x) => x.slug === c.slug)!;
      if (c.stat) expect(p.meta.proof?.[0]?.value).toBe(c.stat.value);
    }
  });
  test("arcs exclude local-only pins; home base lists local projects", () => {
    expect(ARCS.every((a) => a.from !== a.to)).toBe(true);
    expect(projectsAt(PLACES[0].id).length).toBeGreaterThan(2);
  });
});

test("hexToRgb", () => {
  expect(hexToRgb("#ffffff")).toEqual([1, 1, 1]);
  expect(hexToRgb("#000")).toEqual([0, 0, 0]);
});
