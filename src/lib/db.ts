// Database access. Raw SQL against a D1Database — no ORM at runtime.
//
// Two sources, chosen by `resolveDbSource()`:
//   local       → better-sqlite3 file DB (`next dev`, or LOCAL_DB_PATH set — the
//                 isolated E2E lane sets it on `next start`).
//   cloudflare  → the D1 binding `DB` on the deployed Worker.
//
// ⚠️ LOCAL_DB_PATH must NEVER be present at build time for production. OpenNext
// bakes dotenv values into the Worker, which would make the deployed Worker take
// the local branch and 500 every DB call while pages still return 200.
// `scripts/deploy-prod.mjs` blocks that before AND after the build.

import { assertCloudflareBindingsAllowed } from "./cf-guard";

export function resolveDbSource(env: Record<string, string | undefined> = process.env) {
  return env.NODE_ENV === "development" || env.LOCAL_DB_PATH ? "local" : "cloudflare";
}

export function getDb() {
  if (resolveDbSource() === "local") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- lazy dev/E2E-only load; a static import would pull the native driver into every path
    const { getLocalD1 } = require("./local-db");
    return getLocalD1() as D1Database;
  }

  // Guard BEFORE touching the Cloudflare context.
  assertCloudflareBindingsAllowed();
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- lazy prod-only load; getCloudflareContext throws outside a Worker
  const { getCloudflareContext } = require("@opennextjs/cloudflare");
  return getCloudflareContext().env.DB as D1Database;
}

export async function queryAll<T>(db: D1Database, sql: string, ...params: unknown[]) {
  const result = await db.prepare(sql).bind(...params).all<T>();
  return result.results;
}

export async function queryFirst<T>(db: D1Database, sql: string, ...params: unknown[]) {
  return db.prepare(sql).bind(...params).first<T>();
}

export async function execute(db: D1Database, sql: string, ...params: unknown[]) {
  return db.prepare(sql).bind(...params).run();
}
