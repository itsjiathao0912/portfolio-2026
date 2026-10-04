// Worker entrypoint (wrangler.jsonc `main`). Wraps OpenNext's generated worker.
//
// Why it exists: on Workers Free each request gets 10 ms CPU, and merely
// entering OpenNext/Next costs more than that (Error 1102 on reload). So:
//   - cacheable GETs (pages, robots/sitemap/OG images, /api/stats) are answered
//     from caches.default, keyed by the deploy's version id, WITHOUT importing
//     OpenNext;
//   - /api/geo is answered directly from request.cf;
//   - everything else (and every cache miss) dynamically imports OpenNext.
// Rules live in src/lib/edge-cache.ts (pure, unit-tested).
// OpenNext must never be imported at top level here: the import is the cost.
import { cacheRule, clientCacheControl, geoBody, isStorable } from "./src/lib/edge-cache.ts";

let openNext = null;
async function next(request, env, ctx) {
  openNext ??= (await import("./.open-next/worker.js")).default;
  return openNext.fetch(request, env, ctx);
}

function withHeaders(res, headers, head) {
  const out = new Response(head ? null : res.body, res);
  for (const [k, v] of Object.entries(headers)) out.headers.set(k, v);
  return out;
}

const worker = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/api/geo" && request.method === "GET") {
      return Response.json(geoBody(request.cf), { headers: { "cache-control": "no-store", "x-edge-cache": "DIRECT" } });
    }

    const version = env.CF_VERSION_METADATA?.id ?? "dev";
    const rule = cacheRule(request, version, typeof request.cf?.country === "string" ? request.cf.country : null);
    if (rule.kind === "bypass") return next(request, env, ctx);

    const head = request.method === "HEAD";
    const cache = caches.default;
    const key = new Request(rule.key, { method: "GET" });
    const hit = await cache.match(key);
    if (hit) return withHeaders(hit, { "cache-control": clientCacheControl(rule.kind), "x-edge-cache": "HIT" }, head);

    // Miss: render through Next with a GET (so HEAD can fill the cache too).
    const res = await next(head ? new Request(request, { method: "GET" }) : request, env, ctx);
    if (!isStorable(res)) return withHeaders(res, { "x-edge-cache": "BYPASS" }, head);
    const stored = withHeaders(res.clone(), { "cache-control": `public, max-age=${rule.ttl}` }, false);
    stored.headers.delete("x-edge-cache");
    ctx.waitUntil(cache.put(key, stored).catch(() => {}));
    return withHeaders(res, { "cache-control": clientCacheControl(rule.kind), "x-edge-cache": "MISS" }, head);
  },
};

export default worker;
