// Visitor counting: pure SQL on an injected D1Database. No batch(), no logging.
//
// Tables: VisitorSeen (one row per hashed browser), VisitTally (role x country
// counters, derivable from VisitorSeen via rebuildTallies). The two writes of a
// first visit or role change are separate statements, so a crash between them
// can leave a tally off by one: rebuildTallies repairs that.
//
// D1 cost note (assumption, KG1): the free tier is about 5M rows read per day,
// (page renders read bundled content, not D1; /api/stats is also edge-cached 30 s). getStats runs ONE
// SELECT over VisitTally (distinct role x country cells seen, expected < 500
// rows) and memoises it for 10 s per isolate: worst case about 4.3M rows/day per
// isolate under constant traffic. Lengthen STATS_MEMO_MS to 30 s if real
// traffic approaches that. Real numbers are unmeasured until deploy.

import { ROLE_IDS, isRoleId, type RoleId } from "../components/site/visitor/role-ids";

export const MIN_WRITE_GAP_MS = 2000;
export const MAX_CHANGES = 30;
export const STATS_MEMO_MS = 10_000;
export const NO_ROLE = "none";
export const NO_COUNTRY = "XX";

export type Clock = () => number;

// ---- memo (module level, injected clock) ----

const memos = new Map<string, { at: number; value: unknown }>();

/** Run `compute` at most once per `ttl` ms for `key`, using the injected clock. */
export async function memoized<T>(key: string, now: Clock, ttl: number, compute: () => Promise<T>) {
  const hit = memos.get(key);
  const t = now();
  if (hit && t - hit.at >= 0 && t - hit.at < ttl) return hit.value as T;
  const value = await compute();
  memos.set(key, { at: t, value });
  return value;
}

/** Update a live memo entry in place (keeps its timestamp, so no extra query). No entry means nothing to patch. */
export function patchMemo<T>(key: string, patch: (value: T) => T) {
  const hit = memos.get(key);
  if (hit) hit.value = patch(hit.value as T);
}

/** Test seam: forget every memoised aggregate. */
export function resetVisitorMemos() {
  memos.clear();
}

export function dayOf(ms: number) {
  return new Date(ms).toISOString().slice(0, 10);
}

type Seen = { ordinal: number; role: string; country: string; changeCount: number; lastWriteAt: number };

async function readSeen(db: D1Database, hash: string) {
  return db
    .prepare(`SELECT rowid AS ordinal, role, country, changeCount, lastWriteAt FROM "VisitorSeen" WHERE hash = ?`)
    .bind(hash)
    .first<Seen>();
}

async function bumpTally(db: D1Database, role: string, country: string) {
  await db
    .prepare(
      `INSERT INTO "VisitTally" (role, country, count) VALUES (?, ?, 1) ON CONFLICT(role, country) DO UPDATE SET count = count + 1`
    )
    .bind(role, country)
    .run();
}

async function dropTally(db: D1Database, role: string, country: string) {
  await db
    .prepare(`UPDATE "VisitTally" SET count = MAX(count - 1, 0) WHERE role = ? AND country = ?`)
    .bind(role, country)
    .run();
}

export type VisitResult =
  | { ok: true; ordinal: number; counted: boolean }
  | { ok: false; reason: "throttled"; retryAfterSec: number };

export function throttleState(seen: Pick<Seen, "changeCount" | "lastWriteAt">, now: number) {
  if (seen.changeCount >= MAX_CHANGES) return 3600;
  const wait = seen.lastWriteAt + MIN_WRITE_GAP_MS - now;
  return wait > 0 ? Math.max(1, Math.ceil(wait / 1000)) : 0;
}

export async function recordVisit(
  db: D1Database,
  input: { hash: string; role: RoleId | typeof NO_ROLE; country: string; now: number }
): Promise<VisitResult> {
  const { hash, role, country, now } = input;
  let seen = await readSeen(db, hash);

  if (!seen) {
    const day = dayOf(now);
    const ins = await db
      .prepare(
        `INSERT OR IGNORE INTO "VisitorSeen" (hash, role, country, changeCount, firstSeenDay, updatedDay, lastWriteAt) VALUES (?, ?, ?, 0, ?, ?, ?)`
      )
      .bind(hash, role, country, day, day, now)
      .run();
    if (ins.meta.changes === 1) {
      await bumpTally(db, role, country);
      const row = await readSeen(db, hash);
      return { ok: true, ordinal: row?.ordinal ?? 0, counted: true };
    }
    seen = await readSeen(db, hash); // lost a race: treat as a returning visitor
    if (!seen) return { ok: true, ordinal: 0, counted: false };
  }

  if (seen.role === role) return { ok: true, ordinal: seen.ordinal, counted: false };

  const retryAfterSec = throttleState(seen, now);
  if (retryAfterSec > 0) return { ok: false, reason: "throttled", retryAfterSec };

  const upd = await db
    .prepare(
      `UPDATE "VisitorSeen" SET role = ?, changeCount = changeCount + 1, updatedDay = ?, lastWriteAt = ? WHERE hash = ? AND role = ? AND role IS NOT ?`
    )
    .bind(role, dayOf(now), now, hash, seen.role, role)
    .run();
  if (upd.meta.changes === 1) {
    await bumpTally(db, role, seen.country); // new cell first, then the old one
    await dropTally(db, seen.role, seen.country);
    return { ok: true, ordinal: seen.ordinal, counted: true };
  }
  const again = await readSeen(db, hash);
  return { ok: true, ordinal: again?.ordinal ?? seen.ordinal, counted: false };
}

/** Recompute every tally from VisitorSeen (repairs a crash between two statements). */
export async function rebuildTallies(db: D1Database) {
  await db.prepare(`DELETE FROM "VisitTally"`).run();
  await db
    .prepare(`INSERT INTO "VisitTally" (role, country, count) SELECT role, country, COUNT(*) FROM "VisitorSeen" GROUP BY role, country`)
    .run();
}

type Aggregate = {
  total: number;
  byRole: Record<RoleId, number>;
  topCountries: { country: string; count: number }[];
  countryTotals: Map<string, number>;
};

async function aggregate(db: D1Database, now: Clock) {
  return memoized<Aggregate>("visit-stats", now, STATS_MEMO_MS, async () => {
    const { results } = await db
      .prepare(`SELECT role, country, count FROM "VisitTally" WHERE count > 0`)
      .all<{ role: string; country: string; count: number }>();
    const byRole = Object.fromEntries(ROLE_IDS.map((id) => [id, 0])) as Record<RoleId, number>;
    const countryTotals = new Map<string, number>();
    let total = 0;
    for (const row of results) {
      total += row.count;
      if (isRoleId(row.role)) byRole[row.role] += row.count;
      if (row.country !== NO_COUNTRY) countryTotals.set(row.country, (countryTotals.get(row.country) ?? 0) + row.count);
    }
    const topCountries = [...countryTotals.entries()]
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count || a.country.localeCompare(b.country))
      // Every country (codes + counts only, no PII); capped so the payload stays small.
      .slice(0, MAX_COUNTRIES);
    return { total, byRole, topCountries, countryTotals };
  });
}

/** Upper bound on countries sent to the client (the flag cluster shows them all). */
export const MAX_COUNTRIES = 60;

export async function getStats(
  db: D1Database,
  input: { role: RoleId | typeof NO_ROLE; country: string | null; now: Clock }
) {
  const agg = await aggregate(db, input.now);
  const sum = async (column: "role" | "country", value: string) =>
    Number(
      (await db.prepare(`SELECT COALESCE(SUM(count), 0) AS n FROM "VisitTally" WHERE ${column} = ?`).bind(value).first<{ n: number }>())?.n ?? 0
    );
  const roleCount = await sum("role", input.role);
  const countryCount = input.country ? await sum("country", input.country) : 0;
  let countryRank = 0;
  if (input.country && countryCount > 0) {
    countryRank = 1;
    for (const total of agg.countryTotals.values()) if (total > countryCount) countryRank += 1;
  }
  return {
    total: agg.total,
    byRole: agg.byRole,
    topCountries: agg.topCountries,
    you: { country: input.country, countryCount, countryRank, roleCount },
  };
}
