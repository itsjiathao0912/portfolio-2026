import { beforeEach, describe, expect, test } from "bun:test";
import { createTestDb } from "../helpers/test-db";
import { castVote, getPoll, MIN_POLL_VOTES, POLL_OPTIONS, topRoles } from "../../src/lib/poll";
import { applyVote, parsePoll } from "../../src/components/site/visitor/stats/use-poll";
import { POLL_OPTION_IDS } from "../../src/components/site/visitor/role-ids";
import { recordVisit, resetVisitorMemos } from "../../src/lib/visits";

beforeEach(() => resetVisitorMemos());
const T0 = 5_000_000;

async function seen(db: D1Database, hash: string, role: Parameters<typeof recordVisit>[1]["role"] = "none") {
  await recordVisit(db, { hash, role, country: "XX", now: T0 - 10_000 });
}

describe("poll", () => {
  test("labels cover every option id and the threshold is 20", () => {
    expect(POLL_OPTIONS.map((o) => o.id)).toEqual([...POLL_OPTION_IDS]);
    expect(MIN_POLL_VOTES).toBe(20);
  });

  test("a vote requires an existing visitor hash", async () => {
    const { db } = createTestDb();
    expect(await castVote(db, { hash: "ghost", option: "remittance", now: T0 })).toEqual({ ok: false, reason: "unknown-visitor" });
  });

  test("one vote, changeable, same option is a no-op", async () => {
    const { db } = createTestDb();
    await seen(db, "a");
    expect(await castVote(db, { hash: "a", option: "remittance", now: T0 })).toEqual({ ok: true, changed: true, previous: null });
    expect(await castVote(db, { hash: "a", option: "remittance", now: T0 + 5000 })).toEqual({ ok: true, changed: false, previous: "remittance" });
    expect(await castVote(db, { hash: "a", option: "fraud-toolkit", now: T0 + 10_000 })).toEqual({ ok: true, changed: true, previous: "remittance" });
    const poll = await getPoll(db, { hash: "a", now: () => T0 + 10_000 });
    expect(poll.total).toBe(1);
    expect(poll.counts["fraud-toolkit"]).toBe(1);
    expect(poll.counts.remittance).toBe(0);
    expect(poll.mine).toBe("fraud-toolkit");
  });

  test("vote changes under 2 s apart are throttled", async () => {
    const { db } = createTestDb();
    await seen(db, "a");
    await castVote(db, { hash: "a", option: "remittance", now: T0 });
    const fast = await castVote(db, { hash: "a", option: "fraud-toolkit", now: T0 + 100 });
    expect(fast).toMatchObject({ ok: false, reason: "throttled" });
  });

  test("aggregate is memoised inside 10 s", async () => {
    const { db } = createTestDb();
    await seen(db, "a");
    const first = await getPoll(db, { hash: null, now: () => T0 });
    // A write this process did not make (another isolate) stays invisible until the window ends.
    await db.prepare(`INSERT INTO PollVote (hash, option, updatedDay) VALUES ('other', 'remittance', '2026-10-04')`).run();
    const second = await getPoll(db, { hash: null, now: () => T0 + 5000 });
    const third = await getPoll(db, { hash: null, now: () => T0 + 11_000 });
    expect(first.total).toBe(0);
    expect(second.total).toBe(0);
    expect(third.total).toBe(1);
  });

  test("a vote patches the live memo so the voter sees it at once", async () => {
    const { db } = createTestDb();
    await seen(db, "a");
    await getPoll(db, { hash: null, now: () => T0 });
    await castVote(db, { hash: "a", option: "remittance", now: T0 });
    expect((await getPoll(db, { hash: "a", now: () => T0 + 1000 })).total).toBe(1);
    await castVote(db, { hash: "a", option: "fraud-toolkit", now: T0 + 5000 });
    const p = await getPoll(db, { hash: "a", now: () => T0 + 6000 });
    expect([p.total, p.counts.remittance, p.counts["fraud-toolkit"]]).toEqual([1, 0, 1]);
  });

  test("voter roles per option: aggregate only, most common first, capped at 4", async () => {
    const { db } = createTestDb();
    const voters: [string, Parameters<typeof recordVisit>[1]["role"]][] = [["a", "founder"], ["b", "founder"], ["c", "engineer"], ["d", "none"], ["e", "designer"], ["f", "investor"], ["g", "student"]];
    for (const [h, r] of voters) {
      await seen(db, h, r);
      await castVote(db, { hash: h, option: "remittance", now: T0 });
    }
    const p = await getPoll(db, { hash: null, now: () => T0 + 20_000 });
    expect(p.counts.remittance).toBe(7);
    expect(p.roles.remittance[0]).toBe("founder");
    expect(p.roles.remittance).toHaveLength(4);
    expect(p.roles["fraud-toolkit"]).toEqual([]);
    expect(JSON.stringify(p)).not.toContain('"a"');
  });

  test("a vote patches voter roles into the live memo", async () => {
    const { db } = createTestDb();
    await seen(db, "a", "engineer");
    await getPoll(db, { hash: null, now: () => T0 });
    await castVote(db, { hash: "a", option: "remittance", now: T0 });
    expect((await getPoll(db, { hash: "a", now: () => T0 + 1000 })).roles.remittance).toEqual(["engineer"]);
    await castVote(db, { hash: "a", option: "fraud-toolkit", now: T0 + 5000 });
    const p = await getPoll(db, { hash: "a", now: () => T0 + 6000 });
    expect([p.roles.remittance, p.roles["fraud-toolkit"]]).toEqual([[], ["engineer"]]);
  });

  test("topRoles drops zeros and orders by count", () => {
    expect(topRoles({ founder: 1, engineer: 3, designer: 0 })).toEqual(["engineer", "founder"]);
  });

  test("client parse keeps only known roles; optimistic vote adds your face", () => {
    const d = parsePoll({ total: 1, counts: { remittance: 1 }, mine: null, roles: { remittance: ["founder", "hacker", 3] } });
    expect(d?.roles?.remittance).toEqual(["founder"]);
    expect(parsePoll({ total: 0, counts: {} })?.roles?.remittance).toEqual([]);
    const v = applyVote(d!, "remittance", "engineer");
    expect(v.roles?.remittance).toEqual(["engineer", "founder"]);
    expect(v.mine).toBe("remittance");
  });
});
