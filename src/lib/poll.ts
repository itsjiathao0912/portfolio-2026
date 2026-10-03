// Poll: "What should Thao build next?" One vote per visitor hash, changeable.
// Option labels are DRAFT copy for Thao to review. Counts are real only; the
// aggregate is memoised 10 s (injected clock) so reads cost one query per window.

import { POLL_OPTION_IDS, isPollOptionId, type PollOptionId } from "../components/site/visitor/role-ids";
import { dayOf, memoized, patchMemo, throttleState, type Clock } from "./visits";

export const MIN_POLL_VOTES = 20;
export const POLL_MEMO_MS = 10_000;

// DRAFT labels (Thao to review).
export const POLL_OPTIONS = [
  { id: "ai-agent", label: "An AI agent for recruiters" },
  { id: "design-system", label: "A design system library" },
  { id: "data-viz", label: "An interactive data story" },
  { id: "game", label: "A small browser game" },
] as const satisfies readonly { id: PollOptionId; label: string }[];

export type PollCounts = Record<PollOptionId, number>;

async function counts(db: D1Database, now: Clock) {
  return memoized<{ counts: PollCounts; total: number }>("poll-counts", now, POLL_MEMO_MS, async () => {
    const { results } = await db
      .prepare(`SELECT option, COUNT(*) AS n FROM "PollVote" GROUP BY option`)
      .all<{ option: string; n: number }>();
    const out = Object.fromEntries(POLL_OPTION_IDS.map((id) => [id, 0])) as PollCounts;
    let total = 0;
    for (const row of results) {
      if (isPollOptionId(row.option)) {
        out[row.option] = row.n;
        total += row.n;
      }
    }
    return { counts: out, total };
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
  return { counts: agg.counts, total: agg.total, mine };
}

export type VoteResult =
  | { ok: true; changed: boolean; previous: PollOptionId | null }
  | { ok: false; reason: "unknown-visitor" }
  | { ok: false; reason: "throttled"; retryAfterSec: number };

export async function castVote(db: D1Database, input: { hash: string; option: PollOptionId; now: number }): Promise<VoteResult> {
  const seen = await db
    .prepare(`SELECT changeCount, lastWriteAt FROM "VisitorSeen" WHERE hash = ?`)
    .bind(input.hash)
    .first<{ changeCount: number; lastWriteAt: number }>();
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
  patchMemo<{ counts: PollCounts; total: number }>("poll-counts", (agg) => {
    const counts = { ...agg.counts };
    if (previous) counts[previous] = Math.max(0, counts[previous] - 1);
    counts[input.option] += 1;
    return { counts, total: previous ? agg.total : agg.total + 1 };
  });
  return { ok: true, changed: true, previous };
}
