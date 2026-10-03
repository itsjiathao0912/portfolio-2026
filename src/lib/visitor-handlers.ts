// All route logic for /api/{geo,visit,stats,poll}. Each handler takes
// (req, deps) with deps = { db, env, now, geo }, so bun tests inject an
// in-memory D1 and a fake clock. The route.ts files only call liveDeps(req).
//
// Privacy: nothing is logged, and no IP or user agent is read. A visitor id
// never appears in a URL. Poll counts are a 10 s memoised aggregate that a vote
// patches in place (see poll.ts), so a voter sees their own vote at once.

import { z } from "zod";
import { POLL_OPTION_IDS, ROLE_IDS, isRoleId, type RoleId } from "../components/site/visitor/role-ids";
import { checkOrigin, readJsonBody } from "./api-guard";
import { readGeo, type Geo } from "./geo";
import { castVote, getPoll } from "./poll";
import { hashVisitor, resolveSalt, VISITOR_ID_PATTERN } from "./visitor-hash";
import { NO_COUNTRY, NO_ROLE, getStats, recordVisit } from "./visits";

export type VisitorEnv = Record<string, string | undefined>;
export type VisitorDeps = { db: D1Database; env: VisitorEnv; now: () => number; geo: Geo };

const visitorId = z.string().regex(VISITOR_ID_PATTERN);
const visitBody = z.object({ visitorId, role: z.enum(ROLE_IDS).nullable() }).strict();
const pollBody = z.object({ visitorId, option: z.enum(POLL_OPTION_IDS).nullable() }).strict();

function json(status: number, body: unknown, headers: Record<string, string> = {}) {
  return Response.json(body, { status, headers: { "cache-control": "no-store", ...headers } });
}

function fail(status: number, error: string, headers?: Record<string, string>) {
  return json(status, { error }, headers);
}

/** Real dependencies for a route. Lazy imports keep bun tests off the Cloudflare/native paths. */
export function liveDeps(req: Request): VisitorDeps {
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- lazy: getDb throws under bun
  const { getDb } = require("./db");
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- lazy: reads the Worker env first
  const { readRuntimeEnv } = require("./runtime-env");
  const env: VisitorEnv = {
    VISITOR_SALT: readRuntimeEnv("VISITOR_SALT"),
    PORTFOLIO_E2E: readRuntimeEnv("PORTFOLIO_E2E"),
    LOCAL_DB_PATH: readRuntimeEnv("LOCAL_DB_PATH"),
    NODE_ENV: readRuntimeEnv("NODE_ENV"),
  };
  return { db: getDb(), env, now: () => Date.now(), geo: readGeo(req, env) };
}

export async function handleGeo(_req: Request, deps: VisitorDeps) {
  return json(200, { country: deps.geo.country, city: deps.geo.city });
}

async function hashFor(id: string, env: VisitorEnv) {
  const salt = resolveSalt(env);
  if (!salt.ok) return null;
  return hashVisitor(id, salt.salt);
}

export async function handleVisit(req: Request, deps: VisitorDeps) {
  const origin = checkOrigin(req);
  if (!origin.ok) return fail(origin.status, origin.error);
  const body = await readJsonBody(req, visitBody);
  if (!body.ok) return fail(body.status, body.error);
  const hash = await hashFor(body.data.visitorId, deps.env);
  if (!hash) return fail(503, "unavailable");
  try {
    const res = await recordVisit(deps.db, {
      hash,
      role: body.data.role ?? NO_ROLE,
      country: deps.geo.country ?? NO_COUNTRY,
      now: deps.now(),
    });
    if (!res.ok) return fail(429, "throttled", { "retry-after": String(res.retryAfterSec) });
    return json(200, { ordinal: res.ordinal, counted: res.counted });
  } catch {
    return fail(500, "unavailable");
  }
}

export async function handleStats(req: Request, deps: VisitorDeps) {
  const raw = new URL(req.url).searchParams.get("role") ?? NO_ROLE;
  if (raw !== NO_ROLE && !isRoleId(raw)) return fail(400, "invalid role");
  try {
    const stats = await getStats(deps.db, { role: raw as RoleId | typeof NO_ROLE, country: deps.geo.country, now: deps.now });
    return json(200, stats, { "cache-control": "private, max-age=10" });
  } catch {
    return fail(500, "unavailable");
  }
}

export async function handlePoll(req: Request, deps: VisitorDeps) {
  try {
    if (req.method === "GET") {
      const { counts, total } = await getPoll(deps.db, { hash: null, now: deps.now });
      return json(200, { counts, total });
    }
    const origin = checkOrigin(req);
    if (!origin.ok) return fail(origin.status, origin.error);
    const body = await readJsonBody(req, pollBody);
    if (!body.ok) return fail(body.status, body.error);
    const hash = await hashFor(body.data.visitorId, deps.env);
    if (!hash) return fail(503, "unavailable");

    const option = body.data.option;
    if (option !== null) {
      const vote = await castVote(deps.db, { hash, option, now: deps.now() });
      if (!vote.ok) {
        if (vote.reason === "unknown-visitor") return fail(403, "visit first");
        return fail(429, "throttled", { "retry-after": String(vote.retryAfterSec) });
      }
    }
    return json(200, await getPoll(deps.db, { hash, now: deps.now }));
  } catch {
    return fail(500, "unavailable");
  }
}
