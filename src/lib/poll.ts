// Poll: "What should Thao build next?" One vote per visitor hash, changeable.
// Option labels are DRAFT copy for Thao to review. Counts are real only; the
// aggregate is memoised 10 s (injected clock) so reads cost one query per window.

import { POLL_OPTION_IDS, isPollOptionId, isRoleId, type PollOptionId, type RoleId } from "../components/site/visitor/role-ids";
import { dayOf, memoized, patchMemo, throttleState, type Clock } from "./visits";

export { MIN_POLL_VOTES, POLL_OPTIONS } from "./poll-options";
export const POLL_MEMO_MS = 10_000;

export type PollCounts = Record<PollOptionId, number>;
/** Per option, how many voters of each role (aggregate only: no hashes, no PII). */
export type PollRoleCounts = Record<PollOptionId, Partial<Record<RoleId, number>>>;
type Agg = { counts: PollCounts; total: number; roleCounts: PollRoleCounts };

/** Most common voter roles for an option, most frequent first (ties by role order), at most `max`. */
export function topRoles(byRole: Partial<Record<RoleId, number>>, max = 4): RoleId[] {
  return (Object.entries(byRole) as [RoleId, number][])
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([r]) => r);
}

async function counts(db: D1Database, now: Clock) {
  return memoized<Agg>("poll-counts", now, POLL_MEMO_MS, async () => {
    const { results } = await db
      .prepare(`SELECT p.option AS option, s.role AS role, COUNT(*) AS n FROM "PollVote" p LEFT JOIN "VisitorSeen" s ON s.hash = p.hash GROUP BY p.option, s.role`)
      .all<{ option: string; role: string | null; n: number }>();
    const out = Object.fromEntries(POLL_OPTION_IDS.map((id) => [id, 0])) as PollCounts;
    const roleCounts = Object.fromEntries(POLL_OPTION_IDS.map((id) => [id, {}])) as PollRoleCounts;
    let total = 0;
    for (const row of results) {
      if (isPollOptionId(row.option)) {
        out[row.option] += row.n;
        total += row.n;
        if (isRoleId(row.role)) roleCounts[row.option][row.role] = (roleCounts[row.option][row.role] ?? 0) + row.n;
      }
    }
    return { counts: out, total, roleCounts };
  });
}

/** Aggregate (memoised) plus this visitor's vote (one primary-key lookup). */
export async function getPoll(db: D1Database, input: { hash: string | null; now: Clock }) {
  const agg = await counts(db, input.now);
  let mine: PollOptionId | null = null;
  if (input.hash) {
    const row = await db.prepare(`SELECT option FROM "PollVote" WHERE hash = ?`).bind(input.hash).first<{ option: string }>();
    mine = row && isPollOptionId(row.option) ? row.option : null;
  }
  const roles = Object.fromEntries(POLL_OPTION_IDS.map((id) => [id, topRoles(agg.roleCounts[id])])) as Record<PollOptionId, RoleId[]>;
  return { counts: agg.counts, total: agg.total, mine, roles };
}

export type VoteResult =
  | { ok: true; changed: boolean; previous: PollOptionId | null }
  | { ok: false; reason: "unknown-visitor" }
  | { ok: false; reason: "throttled"; retryAfterSec: number };

export async function castVote(db: D1Database, input: { hash: string; option: PollOptionId; now: number }): Promise<VoteResult> {
  const seen = await db
    .prepare(`SELECT role, changeCount, lastWriteAt FROM "VisitorSeen" WHERE hash = ?`)
    .bind(input.hash)
    .first<{ role: string; changeCount: number; lastWriteAt: number }>();
  if (!seen) return { ok: false, reason: "unknown-visitor" };

  const prev = await db.prepare(`SELECT option FROM "PollVote" WHERE hash = ?`).bind(input.hash).first<{ option: string }>();
  const previous = prev && isPollOptionId(prev.option) ? prev.option : null;
  if (previous === input.option) return { ok: true, changed: false, previous };

  // Vote changes share only the minimum gap, not the role-change cap.
  const retryAfterSec = throttleState({ changeCount: 0, lastWriteAt: seen.lastWriteAt }, input.now);
  if (retryAfterSec > 0) return { ok: false, reason: "throttled", retryAfterSec };

  const res = await db
    .prepare(
      `INSERT INTO "PollVote" (hash, option, updatedDay) VALUES (?, ?, ?) ON CONFLICT(hash) DO UPDATE SET option = excluded.option, updatedDay = excluded.updatedDay WHERE option IS NOT excluded.option`
    )
    .bind(input.hash, input.option, dayOf(input.now))
    .run();
  if (res.meta.changes !== 1) return { ok: true, changed: false, previous };
  await db.prepare(`UPDATE "VisitorSeen" SET lastWriteAt = ? WHERE hash = ?`).bind(input.now, input.hash).run();
  // Keep the memoised aggregate honest about this write without another query.
  const role = isRoleId(seen.role) ? seen.role : null;
  patchMemo<Agg>("poll-counts", (agg) => {
    const counts = { ...agg.counts };
    const roleCounts = { ...agg.roleCounts };
    if (previous) {
      counts[previous] = Math.max(0, counts[previous] - 1);
      if (role) roleCounts[previous] = { ...roleCounts[previous], [role]: Math.max(0, (roleCounts[previous][role] ?? 0) - 1) };
    }
    counts[input.option] += 1;
    if (role) roleCounts[input.option] = { ...roleCounts[input.option], [role]: (roleCounts[input.option][role] ?? 0) + 1 };
    return { counts, total: previous ? agg.total : agg.total + 1, roleCounts };
  });
  return { ok: true, changed: true, previous };
}
