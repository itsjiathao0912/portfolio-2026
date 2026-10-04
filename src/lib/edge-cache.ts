// Edge-cache rules for worker-entry.mjs. Pure: no imports, no Cloudflare globals,
// so bun unit tests cover it and the Worker can load it without the Next bundle.
//
// Why: the Worker runs on Workers Free (10 ms CPU per request). Entering
// OpenNext costs 27 ms+ even for a prerendered route, so cacheable GETs must be
// answered from caches.default BEFORE the OpenNext bundle is imported.
// See process/features/portfolio-site/active/prod-probe_04-10-26/prod-1102_REPORT_04-10-26.md.

/** Cache API TTL (s) for page HTML. The key carries the deploy version, so a deploy invalidates everything. */
export const PAGE_TTL_S = 3600;
/** Static metadata routes (robots, sitemap, OG images, icons) only change on deploy. */
export const STATIC_TTL_S = 86400;
/** /api/stats: shared across visitors for 30 s (keyed by role and country). */
export const STATS_TTL_S = 30;

const PAGE_PATHS = /^\/(?:about|work|work\/[a-z0-9-]+)?$/;
const STATIC_PATHS = /^\/(?:robots\.txt|sitemap\.xml|icon\.svg|apple-icon|(?:(?:about|work|work\/[a-z0-9-]+)\/)?(?:opengraph|twitter)-image(?:-[a-z0-9]+)?)$/;
const ROLE_PARAM = /^[a-z0-9-]{1,40}$/;
const COUNTRY = /^[A-Z]{2}$/;

export type CacheRule =
  | { kind: "page" | "static"; ttl: number; key: string }
  | { kind: "stats"; ttl: number; key: string }
  | { kind: "bypass"; reason: string };

type Req = { method: string; url: string; headers: { get(name: string): string | null } };

/**
 * Decide whether a request is answered from the edge cache, and under which key.
 * `version` is the Worker version id (one cache generation per deploy).
 */
export function cacheRule(req: Req, version: string, country: string | null = null): CacheRule {
  if (req.method !== "GET" && req.method !== "HEAD") return { kind: "bypass", reason: "method" };
  const url = new URL(req.url);
  // Client navigations fetch RSC payloads that depend on the router state: never share them.
  if (req.headers.get("rsc") !== null || req.headers.get("next-router-prefetch") !== null || url.searchParams.has("_rsc")) {
    return { kind: "bypass", reason: "rsc" };
  }
  const base = `https://edge-cache.internal/${encodeURIComponent(version)}/${url.host}${url.pathname}`;

  if (url.pathname === "/api/stats") {
    const keys = [...url.searchParams.keys()];
    if (keys.some((k) => k !== "role")) return { kind: "bypass", reason: "query" };
    const role = url.searchParams.get("role") ?? "";
    if (role && !ROLE_PARAM.test(role)) return { kind: "bypass", reason: "query" };
    const c = country && COUNTRY.test(country) ? country : "none";
    return { kind: "stats", ttl: STATS_TTL_S, key: `${base}?role=${role}&country=${c}` };
  }

  // Next links metadata images as `/opengraph-image?<hash>`: that bare hash is part of the key.
  if (STATIC_PATHS.test(url.pathname) && (url.search === "" || /^\?[a-z0-9]{1,32}$/i.test(url.search))) {
    return { kind: "static", ttl: STATIC_TTL_S, key: base + url.search };
  }
  // Any other query string means a variant we do not know about: let Next handle it.
  if (url.search !== "") return { kind: "bypass", reason: "query" };
  if (PAGE_PATHS.test(url.pathname)) return { kind: "page", ttl: PAGE_TTL_S, key: base };
  return { kind: "bypass", reason: "path" };
}

/** Only a clean 200 without cookies may be shared between visitors. */
export function isStorable(res: { status: number; headers: { get(name: string): string | null } }) {
  if (res.status !== 200) return false;
  if (res.headers.get("set-cookie") !== null) return false;
  const vary = res.headers.get("vary");
  if (vary && /\bcookie\b|\*/i.test(vary)) return false;
  return true;
}

/** The cache-control a visitor's browser sees for a response served by the wrapper. */
export function clientCacheControl(kind: "page" | "static" | "stats") {
  if (kind === "stats") return "private, max-age=10";
  if (kind === "static") return "public, max-age=3600";
  return "public, max-age=0, must-revalidate";
}

// ---- /api/geo without the Next bundle ---------------------------------------
// Must match src/lib/geo.ts (sanitizeCountry / sanitizeCity); a unit test asserts parity.
const DENY = new Set(["XX", "T1", "ZZ", "EU", "UN", "QO", "AA", "QU"]);
const BAD_CHARS = /[\u0000-\u001f\u007f-\u009f‪-‮⁦-⁩]/g;

export function edgeCountry(raw: unknown) {
  if (typeof raw !== "string" || !/^[A-Z]{2}$/.test(raw)) return null;
  return DENY.has(raw) ? null : raw;
}

export function edgeCity(raw: unknown) {
  if (typeof raw !== "string") return null;
  const cleaned = raw.replace(BAD_CHARS, "").trim();
  if (!cleaned || cleaned.length > 64) return null;
  return cleaned;
}

export function geoBody(cf: { country?: unknown; city?: unknown } | null | undefined) {
  return { country: edgeCountry(cf?.country), city: edgeCity(cf?.city) };
}
