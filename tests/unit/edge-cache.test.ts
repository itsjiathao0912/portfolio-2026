import { describe, expect, test } from "bun:test";
import { cacheRule, clientCacheControl, edgeCity, edgeCountry, geoBody, isStorable } from "../../src/lib/edge-cache";
import { sanitizeCity, sanitizeCountry } from "../../src/lib/geo";

const req = (path: string, init: { method?: string; headers?: Record<string, string> } = {}) => ({
  method: init.method ?? "GET",
  url: `https://itsjiathao.com${path}`,
  headers: new Headers(init.headers ?? {}),
});

describe("cacheRule", () => {
  test("pages are cached under a key carrying the version and host", () => {
    for (const p of ["/", "/about", "/work", "/work/gocrypto"]) {
      const r = cacheRule(req(p), "v1");
      expect(r.kind).toBe("page");
      if (r.kind === "page") expect(r.key).toBe(`https://edge-cache.internal/v1/itsjiathao.com${p}`);
    }
  });
  test("a new deploy version is a new key", () => {
    const a = cacheRule(req("/"), "v1");
    const b = cacheRule(req("/"), "v2");
    expect(a.kind !== "bypass" && b.kind !== "bypass" && a.key !== b.key).toBe(true);
  });
  test("static metadata routes are cached long, including the OG hash query", () => {
    for (const p of ["/robots.txt", "/sitemap.xml", "/opengraph-image", "/about/opengraph-image", "/work/gocrypto/opengraph-image", "/apple-icon", "/icon.svg"]) {
      expect(cacheRule(req(p), "v1").kind).toBe("static");
    }
    const r = cacheRule(req("/opengraph-image?a1b2c3d4"), "v1");
    expect(r.kind === "static" && r.key.endsWith("/opengraph-image?a1b2c3d4")).toBe(true);
  });
  test("bypass: non-GET, RSC navigations, unknown queries, unknown and private paths", () => {
    expect(cacheRule(req("/", { method: "POST" }), "v1")).toEqual({ kind: "bypass", reason: "method" });
    expect(cacheRule(req("/about", { headers: { RSC: "1" } }), "v1")).toEqual({ kind: "bypass", reason: "rsc" });
    expect(cacheRule(req("/about", { headers: { "Next-Router-Prefetch": "1" } }), "v1")).toEqual({ kind: "bypass", reason: "rsc" });
    expect(cacheRule(req("/about?_rsc=abc"), "v1")).toEqual({ kind: "bypass", reason: "rsc" });
    expect(cacheRule(req("/?utm=x"), "v1")).toEqual({ kind: "bypass", reason: "query" });
    for (const p of ["/lab", "/api/visit", "/api/poll", "/api/health", "/work/a/b", "/_next/static/x.js"]) {
      expect(cacheRule(req(p), "v1").kind).toBe("bypass");
    }
  });
  test("HEAD shares the GET key", () => {
    const g = cacheRule(req("/"), "v1");
    const h = cacheRule(req("/", { method: "HEAD" }), "v1");
    expect(g).toEqual(h);
  });
  test("/api/stats is cached 30 s per role and country, other params bypass", () => {
    const r = cacheRule(req("/api/stats?role=pm"), "v1", "VN");
    expect(r).toEqual({ kind: "stats", ttl: 30, key: "https://edge-cache.internal/v1/itsjiathao.com/api/stats?role=pm&country=VN" });
    const none = cacheRule(req("/api/stats"), "v1", "garbage");
    expect(none.kind === "stats" && none.key.endsWith("?role=&country=none")).toBe(true);
    expect(cacheRule(req("/api/stats?x=1"), "v1").kind).toBe("bypass");
    expect(cacheRule(req("/api/stats?role=%3Cscript"), "v1").kind).toBe("bypass");
  });
});

test("isStorable: only clean 200s", () => {
  const res = (status: number, h: Record<string, string> = {}) => ({ status, headers: new Headers(h) });
  expect(isStorable(res(200))).toBe(true);
  expect(isStorable(res(404))).toBe(false);
  expect(isStorable(res(500))).toBe(false);
  expect(isStorable(res(200, { "set-cookie": "a=b" }))).toBe(false);
  expect(isStorable(res(200, { vary: "Cookie" }))).toBe(false);
});

test("client cache-control: pages revalidate, stats stay private", () => {
  expect(clientCacheControl("page")).toContain("max-age=0");
  expect(clientCacheControl("stats")).toBe("private, max-age=10");
});

test("edge geo matches src/lib/geo.ts sanitisers", () => {
  for (const c of ["VN", "US", "XX", "T1", "vn", "VNM", 12, null, undefined, "EU"]) expect(edgeCountry(c)).toBe(sanitizeCountry(c));
  for (const c of ["Hanoi", "  Hồ Chí Minh ", "‮evil", "a".repeat(65), "", 5, null]) expect(edgeCity(c)).toBe(sanitizeCity(c));
  expect(geoBody({ country: "VN", city: "Hanoi" })).toEqual({ country: "VN", city: "Hanoi" });
  expect(geoBody(undefined)).toEqual({ country: null, city: null });
});
