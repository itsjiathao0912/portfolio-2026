import { describe, expect, test } from "bun:test";
import { prerenderRule, segmentFile, type PrerenderManifest } from "../../src/lib/edge-cache";
import { guardedTarget, navStalled } from "../../src/lib/nav-watchdog";
import { planEntry, segmentFile as emitSegmentFile } from "../../scripts/emit-prerender-assets.mjs";

const manifest: PrerenderManifest = {
  routes: {
    "/": { dir: "index", staleTime: "300", segments: ["/_tree", "/__PAGE__"] },
    "/work": { dir: "work", staleTime: "300", segments: ["/_tree", "/work/__PAGE__"] },
    "/work/cosap": { dir: "work/cosap", segments: ["/_tree", "/work/$d$slug/__PAGE__"] },
  },
};
const req = (path: string, headers: Record<string, string> = {}, method = "GET") => ({
  method,
  url: `https://itsjiathao.com${path}`,
  headers: new Headers(headers),
});

describe("prerenderRule", () => {
  test("plain page load serves the prerendered HTML", () => {
    const r = prerenderRule(req("/work"), manifest);
    expect(r?.kind).toBe("html");
    expect(r?.asset).toBe("/__prerender/work/html.dat");
    expect(r?.headers["content-type"]).toContain("text/html");
    expect(r?.headers.vary).toContain("rsc");
  });
  test("home maps to the index dir; HEAD is served too", () => {
    expect(prerenderRule(req("/", {}, "HEAD"), manifest)?.asset).toBe("/__prerender/index/html.dat");
  });
  test("RSC navigation serves one payload whatever the router state tree / prefetch flag", () => {
    const variants: Record<string, string>[] = [
      { rsc: "1" },
      { rsc: "1", "next-router-prefetch": "1" },
      { rsc: "1", "next-router-state-tree": "%5B%22%22%5D" },
    ];
    for (const h of variants) {
      const r = prerenderRule(req("/work?_rsc=abc12", h), manifest);
      expect(r?.kind).toBe("rsc");
      expect(r?.asset).toBe("/__prerender/work/rsc.dat");
      expect(r?.headers["content-type"]).toBe("text/x-component");
      expect(r?.headers["x-nextjs-stale-time"]).toBe("300");
    }
  });
  test("segment prefetch: known segment is an asset, unknown is a 204 like Next", () => {
    const hit = prerenderRule(req("/work/cosap?_rsc=x", { rsc: "1", "next-router-prefetch": "1", "next-router-segment-prefetch": "/work/$d$slug/__PAGE__" }), manifest);
    expect(hit?.kind).toBe("segment");
    expect(hit?.asset).toBe(`/__prerender/work/cosap/${segmentFile("/work/$d$slug/__PAGE__")}`);
    expect(hit?.headers["x-nextjs-postponed"]).toBe("2");
    const miss = prerenderRule(req("/work?_rsc=x", { rsc: "1", "next-router-segment-prefetch": "/nope" }), manifest);
    expect(miss?.kind).toBe("segment-miss");
  });
  test("bypasses: unknown route, server action, POST, extra query", () => {
    expect(prerenderRule(req("/lab/glass"), manifest)).toBeNull();
    expect(prerenderRule(req("/api/stats"), manifest)).toBeNull();
    expect(prerenderRule(req("/work", { rsc: "1", "next-action": "abc" }), manifest)).toBeNull();
    expect(prerenderRule(req("/work", {}, "POST"), manifest)).toBeNull();
    expect(prerenderRule(req("/work?utm=x"), manifest)).toBeNull();
    expect(prerenderRule(req("/work?_rsc=1&x=2", { rsc: "1" }), manifest)).toBeNull();
    expect(prerenderRule(req("/constructor"), manifest)).toBeNull();
  });
  test("segment file names match the build script", () => {
    for (const s of ["/_tree", "/work/$d$slug/__PAGE__", "/_full"]) expect(segmentFile(s)).toBe(emitSegmentFile(s));
  });
});

describe("planEntry (build script)", () => {
  const entry = { type: "app", html: "<h>", rsc: "0:{}", meta: { headers: { "x-nextjs-stale-time": "300" } }, segmentData: { "/_tree": "t" } };
  test("a prerendered 200 page becomes a route with html, rsc and segments", () => {
    const p = planEntry("work/cosap.cache", entry)!;
    expect(p.pathname).toBe("/work/cosap");
    expect(p.route).toEqual({ dir: "work/cosap", staleTime: "300", segments: ["/_tree"] });
    expect(Object.keys(p.files).sort()).toEqual(["html.dat", "rsc.dat", segmentFile("/_tree")].sort());
    expect(planEntry("index.cache", entry)!.pathname).toBe("/");
  });
  test("404 pages, internal pages and route handlers are skipped", () => {
    expect(planEntry("lab/glass.cache", { ...entry, meta: { status: 404 } })).toBeNull();
    expect(planEntry("_not-found.cache", entry)).toBeNull();
    expect(planEntry("opengraph-image.cache", { type: "route" })).toBeNull();
  });
});

describe("nav watchdog", () => {
  const click = { button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false, defaultPrevented: false };
  const a = (href: string, target = "") => ({ href, target, hasDownload: false });
  const here = "https://itsjiathao.com/";
  test("guards a plain click to another page on this site", () => {
    expect(guardedTarget(click, a("https://itsjiathao.com/work"), here)).toBe("https://itsjiathao.com/work");
  });
  test("ignores modifier clicks, new tabs, external, same-page and hash links", () => {
    expect(guardedTarget({ ...click, metaKey: true }, a("/work"), here)).toBeNull();
    expect(guardedTarget(click, a("https://itsjiathao.com/work", "_blank"), here)).toBeNull();
    expect(guardedTarget(click, a("https://linkedin.com/x"), here)).toBeNull();
    expect(guardedTarget(click, a("https://itsjiathao.com/#highlights"), here)).toBeNull();
    expect(guardedTarget(click, a("mailto:a@b.c"), here)).toBeNull();
    expect(guardedTarget(click, null, here)).toBeNull();
  });
  test("stalled only while still off the target page", () => {
    expect(navStalled("https://itsjiathao.com/work", "https://itsjiathao.com/")).toBe(true);
    expect(navStalled("https://itsjiathao.com/work", "https://itsjiathao.com/work")).toBe(false);
  });
});
