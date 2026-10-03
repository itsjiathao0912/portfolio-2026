import { beforeEach, describe, expect, test } from "bun:test";
import { createTestDb } from "../helpers/test-db";
import { rebuildTallies, recordVisit, getStats, resetVisitorMemos } from "../../src/lib/visits";
import { applySqlFile } from "../../src/lib/apply-sql";
import { MIGRATION_PATH } from "../../src/lib/local-db";

beforeEach(() => resetVisitorMemos());

const T0 = 1_000_000;
async function tallies(db: D1Database) {
  return (await db.prepare(`SELECT role, country, count FROM VisitTally ORDER BY role, country`).all<{ role: string; country: string; count: number }>()).results;
}

describe("migration", () => {
  test("is idempotent", () => {
    const { sqlite } = createTestDb();
    expect(() => applySqlFile(sqlite, MIGRATION_PATH)).not.toThrow();
    expect(() => applySqlFile(sqlite, MIGRATION_PATH)).not.toThrow();
  });
});

describe("recordVisit", () => {
  test("one per hash, ordinal stable", async () => {
    const { db } = createTestDb();
    const a = await recordVisit(db, { hash: "a", role: "founder", country: "VN", now: T0 });
    const again = await recordVisit(db, { hash: "a", role: "founder", country: "VN", now: T0 + 10_000 });
    const b = await recordVisit(db, { hash: "b", role: "founder", country: "VN", now: T0 });
    expect(a).toEqual({ ok: true, ordinal: 1, counted: true });
    expect(again).toEqual({ ok: true, ordinal: 1, counted: false });
    expect(b).toEqual({ ok: true, ordinal: 2, counted: true });
    expect(await tallies(db)).toEqual([{ role: "founder", country: "VN", count: 2 }]);
  });

  test("role change moves tallies, country frozen", async () => {
    const { db } = createTestDb();
    await recordVisit(db, { hash: "a", role: "founder", country: "VN", now: T0 });
    const moved = await recordVisit(db, { hash: "a", role: "engineer", country: "US", now: T0 + 5000 });
    expect(moved).toMatchObject({ ok: true, counted: true });
    expect(await tallies(db)).toEqual([
      { role: "engineer", country: "VN", count: 1 },
      { role: "founder", country: "VN", count: 0 },
    ]);
    const row = await db.prepare(`SELECT country, changeCount FROM VisitorSeen WHERE hash='a'`).first<{ country: string; changeCount: number }>();
    expect(row).toEqual({ country: "VN", changeCount: 1 });
  });

  test("sentinels leave no duplicate tally rows for skip and null country", async () => {
    const { db } = createTestDb();
    await recordVisit(db, { hash: "a", role: "none", country: "XX", now: T0 });
    await recordVisit(db, { hash: "b", role: "none", country: "XX", now: T0 });
    await recordVisit(db, { hash: "c", role: "none", country: "XX", now: T0 });
    expect(await tallies(db)).toEqual([{ role: "none", country: "XX", count: 3 }]);
  });

  test("meta.changes guard: a second identical update does not move tallies", async () => {
    const { db } = createTestDb();
    await recordVisit(db, { hash: "a", role: "founder", country: "VN", now: T0 });
    await recordVisit(db, { hash: "a", role: "engineer", country: "VN", now: T0 + 5000 });
    await recordVisit(db, { hash: "a", role: "engineer", country: "VN", now: T0 + 10_000 });
    const rows = await tallies(db);
    expect(rows.reduce((n, r) => n + r.count, 0)).toBe(1);
  });

  test("tallies equal rebuildTallies", async () => {
    const { db } = createTestDb();
    for (const [i, role] of (["founder", "engineer", "none", "founder"] as const).entries()) {
      await recordVisit(db, { hash: `h${i}`, role, country: i % 2 ? "VN" : "US", now: T0 });
    }
    await recordVisit(db, { hash: "h0", role: "data", country: "US", now: T0 + 9000 });
    const live = (await tallies(db)).filter((r) => r.count > 0);
    await rebuildTallies(db);
    expect(await tallies(db)).toEqual(live);
  });

  test("throttle: under 2 s is refused with Retry-After, cap of 30 changes", async () => {
    const { db } = createTestDb();
    await recordVisit(db, { hash: "a", role: "founder", country: "VN", now: T0 });
    const fast = await recordVisit(db, { hash: "a", role: "engineer", country: "VN", now: T0 + 500 });
    expect(fast).toEqual({ ok: false, reason: "throttled", retryAfterSec: 2 });
    const roles = ["data", "pm", "growth"] as const;
    let t = T0 + 3000;
    for (let i = 0; i < 30; i++) {
      const r = await recordVisit(db, { hash: "a", role: roles[i % 3], country: "VN", now: (t += 3000) });
      expect(r.ok).toBe(true);
    }
    const capped = await recordVisit(db, { hash: "a", role: "student", country: "VN", now: t + 9000 });
    expect(capped).toMatchObject({ ok: false, reason: "throttled" });
  });
});

// A db whose first VisitorSeen read returns a stale row, to model a concurrent request.
function staleFirstRead(db: D1Database, stale: unknown) {
  let used = false;
  return {
    prepare(sql: string) {
      const st = db.prepare(sql);
      if (used || !sql.includes("SELECT rowid AS ordinal")) return st;
      used = true;
      return { bind: () => ({ first: async () => stale }) };
    },
  } as unknown as D1Database;
}

describe("recordVisit races", () => {
  test("losing the first-insert race does not count or throw", async () => {
    const { db } = createTestDb();
    await recordVisit(db, { hash: "a", role: "founder", country: "VN", now: T0 });
    const res = await recordVisit(staleFirstRead(db, null), { hash: "a", role: "founder", country: "VN", now: T0 + 5000 });
    expect(res).toEqual({ ok: true, ordinal: 1, counted: false });
    expect(await tallies(db)).toEqual([{ role: "founder", country: "VN", count: 1 }]);
  });

  test("a stale read that loses the guarded UPDATE moves no tally", async () => {
    const { db } = createTestDb();
    await recordVisit(db, { hash: "a", role: "founder", country: "VN", now: T0 });
    await recordVisit(db, { hash: "a", role: "engineer", country: "VN", now: T0 + 5000 });
    const before = await tallies(db);
    const stale = { ordinal: 1, role: "founder", country: "VN", changeCount: 0, lastWriteAt: 0 };
    const res = await recordVisit(staleFirstRead(db, stale), { hash: "a", role: "engineer", country: "VN", now: T0 + 60_000 });
    expect(res).toMatchObject({ ok: true, counted: false });
    expect(await tallies(db)).toEqual(before);
  });
});

describe("getStats", () => {
  test("empty state is zeros", async () => {
    const { db } = createTestDb();
    const s = await getStats(db, { role: "founder", country: "VN", now: () => T0 });
    expect(s.total).toBe(0);
    expect(s.topCountries).toEqual([]);
    expect(Object.values(s.byRole).every((n) => n === 0)).toBe(true);
    expect(s.you).toEqual({ country: "VN", countryCount: 0, countryRank: 0, roleCount: 0 });
  });

  test("counts, top countries, rank, you", async () => {
    const { db } = createTestDb();
    const people: [string, "founder" | "none", string][] = [
      ["a", "founder", "VN"], ["b", "founder", "VN"], ["c", "none", "US"], ["d", "none", "XX"],
    ];
    for (const [hash, role, country] of people) await recordVisit(db, { hash, role, country, now: T0 });
    const s = await getStats(db, { role: "founder", country: "US", now: () => T0 });
    expect(s.total).toBe(4);
    expect(s.byRole.founder).toBe(2);
    expect(s.topCountries).toEqual([{ country: "VN", count: 2 }, { country: "US", count: 1 }]);
    expect(s.you).toEqual({ country: "US", countryCount: 1, countryRank: 2, roleCount: 2 });
  });

  test("memo: two calls inside 10 s run one aggregate query", async () => {
    const { db } = createTestDb();
    let aggregates = 0;
    const spy = {
      prepare(sql: string) {
        if (sql.includes(`WHERE count > 0`)) aggregates++;
        return db.prepare(sql);
      },
    } as unknown as D1Database;
    let now = T0;
    await getStats(spy, { role: "none", country: null, now: () => now });
    now += 9000;
    await getStats(spy, { role: "none", country: null, now: () => now });
    expect(aggregates).toBe(1);
    now += 2000;
    await getStats(spy, { role: "none", country: null, now: () => now });
    expect(aggregates).toBe(2);
  });
});
