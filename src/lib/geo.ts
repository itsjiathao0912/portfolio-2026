// Geo for the greeting. The ONLY inputs are Cloudflare's `request.cf` country
// and city, or (tests only) the `x-e2e-geo` header seam. No IP, no user agent.
//
// Seam: header `x-e2e-geo: <country>|<city>` (city optional, e.g. `VN|Hanoi`).
// It is honoured only when env.PORTFOLIO_E2E === "1" AND the DB source is
// local, so it is inert on a deployed Worker. Seam values go through the same
// sanitisers as real cf values.

import { resolveDbSource } from "./db";

export type Geo = { country: string | null; city: string | null };

// Codes that look valid but mean "unknown" (Cloudflare uses XX and T1, ICU has
// ZZ, EU, UN, QO and friends). Checked BEFORE Intl.DisplayNames is consulted.
const DENY = new Set(["XX", "T1", "ZZ", "EU", "UN", "QO", "AA", "QU"]);

export function sanitizeCountry(raw: unknown) {
  if (typeof raw !== "string") return null;
  if (!/^[A-Z]{2}$/.test(raw)) return null;
  return DENY.has(raw) ? null : raw;
}

// Control characters and bidi overrides, which have no place in a place name.
const BAD_CHARS = /[\u0000-\u001f\u007f-\u009f‪-‮⁦-⁩]/g;

/** City: control chars stripped, trimmed. Over 64 chars (garbage) or empty is null. */
export function sanitizeCity(raw: unknown) {
  if (typeof raw !== "string") return null;
  const cleaned = raw.replace(BAD_CHARS, "").trim();
  if (!cleaned || cleaned.length > 64) return null;
  return cleaned;
}

/** English country name, or null when ICU has none (missing table, throw, or code echoed back). */
export function countryName(code: string) {
  try {
    const name = new Intl.DisplayNames(["en"], { type: "region" }).of(code);
    return name && name !== code ? name : null;
  } catch {
    return null;
  }
}

function readCf(): { country?: unknown; city?: unknown } | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- lazy: getCloudflareContext throws outside a Worker
    const { getCloudflareContext } = require("@opennextjs/cloudflare");
    const cf = getCloudflareContext().cf;
    return cf && typeof cf === "object" ? cf : null;
  } catch {
    return null;
  }
}

export function readGeo(
  req: Request,
  env: Record<string, string | undefined> = process.env,
  dbSource: "local" | "cloudflare" = resolveDbSource(env)
): Geo {
  if (env.PORTFOLIO_E2E === "1" && dbSource === "local") {
    const seam = req.headers.get("x-e2e-geo");
    if (seam !== null) {
      const cut = seam.indexOf("|");
      const country = cut === -1 ? seam : seam.slice(0, cut);
      const city = cut === -1 ? "" : seam.slice(cut + 1);
      return { country: sanitizeCountry(country), city: sanitizeCity(city) };
    }
  }
  const cf = readCf();
  return { country: sanitizeCountry(cf?.country), city: sanitizeCity(cf?.city) };
}

/** "Hey {city}", else "Hey {country name}", else "Hey stranger". Never a raw code. */
export function greetingFor(geo: Geo | null | undefined) {
  if (geo?.city) return `Hey ${geo.city}`;
  const name = geo?.country ? countryName(geo.country) : null;
  return name ? `Hey ${name}` : "Hey stranger";
}
