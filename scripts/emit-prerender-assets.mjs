#!/usr/bin/env node
// Runs after `opennextjs-cloudflare build` (see package.json build:cf).
// Copies every prerendered 200 page out of OpenNext's build cache into static
// assets, plus a manifest the Worker wrapper imports. worker-entry.mjs then
// serves page HTML, RSC payloads and segment prefetches from env.ASSETS and
// never renders those routes at request time (Workers Free: 10 ms CPU).
// Naming must match src/lib/edge-cache.ts (segmentFile) — a unit test checks.
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

export function segmentFile(segment) {
  return `seg-${Buffer.from(segment, "utf8").toString("hex")}.dat`;
}

/** Turn one parsed .cache entry into the files to write, or null when it must not be served statically. */
export function planEntry(rel, entry) {
  if (entry?.type !== "app" || typeof entry.html !== "string" || typeof entry.rsc !== "string") return null;
  const status = entry.meta?.status;
  if (status !== undefined && status !== 200) return null;
  const route = rel.replace(/\.cache$/, "");
  if (route.split("/").some((part) => part.startsWith("_"))) return null; // _not-found, _global-error
  if (!/^[a-z0-9\-/]+$/.test(route)) return null;
  const pathname = route === "index" ? "/" : `/${route}`;
  const segments = Object.keys(entry.segmentData ?? {});
  const files = { "html.dat": entry.html, "rsc.dat": entry.rsc };
  for (const s of segments) files[segmentFile(s)] = entry.segmentData[s];
  const staleTime = entry.meta?.headers?.["x-nextjs-stale-time"];
  return { pathname, route: { dir: route, ...(typeof staleTime === "string" ? { staleTime } : {}), segments }, files };
}

function walk(dir, base = dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    return statSync(full).isDirectory() ? walk(full, base) : [path.relative(base, full)];
  });
}

function main() {
  const root = process.cwd();
  const buildId = readFileSync(path.join(root, ".next", "BUILD_ID"), "utf8").trim();
  const cacheDir = path.join(root, ".open-next", "cache", buildId);
  if (!existsSync(cacheDir)) {
    console.error(`emit-prerender-assets: ${cacheDir} not found`);
    process.exit(1);
  }
  const outDir = path.join(root, ".open-next", "assets", "__prerender");
  rmSync(outDir, { recursive: true, force: true });
  const routes = {};
  for (const rel of walk(cacheDir).filter((f) => f.endsWith(".cache")).sort()) {
    const plan = planEntry(rel.split(path.sep).join("/"), JSON.parse(readFileSync(path.join(cacheDir, rel), "utf8")));
    if (!plan) continue;
    const dir = path.join(outDir, plan.route.dir);
    mkdirSync(dir, { recursive: true });
    for (const [name, body] of Object.entries(plan.files)) writeFileSync(path.join(dir, name), body);
    routes[plan.pathname] = plan.route;
  }
  if (!routes["/"]) {
    console.error("emit-prerender-assets: the home page was not prerendered — refusing to continue");
    process.exit(1);
  }
  writeFileSync(path.join(root, ".open-next", "prerender-routes.json"), JSON.stringify({ routes }));
  console.log(`emit-prerender-assets: ${Object.keys(routes).length} routes -> ${Object.keys(routes).join(" ")}`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
