import { describe, expect, test } from "bun:test";
import { POLL_OPTIONS } from "../../src/lib/poll-options";
import { flagOf, leaderLine, moveOwnCount, pollRows, rankLine } from "../../src/components/site/visitor/stats/stats-copy";
import { nextDelay, parseStats, shouldPoll, IDLE_STOP_MS } from "../../src/components/site/visitor/stats/use-live-stats";
import { applyVote, parsePoll } from "../../src/components/site/visitor/stats/use-poll";

const base = { ordinal: 213, role: "founder" as const, roleCount: 12, country: "VN", countryCount: 48, countryRank: 1, total: 400 };

describe("rankLine", () => {
  test("full line", () => {
    expect(rankLine(base)).toBe("You're visitor #213 · 12 founders · 48 from Vietnam 🇻🇳");
  });
  test("first of a role and first from a country", () => {
    expect(rankLine({ ...base, roleCount: 1, countryCount: 1 })).toBe("You're visitor #213 · the first Founder · the first from Vietnam 🇻🇳");
  });
  test("zero counts are left out, never invented", () => {
    expect(rankLine({ ...base, roleCount: 0, countryCount: 0 })).toBe("You're visitor #213");
  });
  test("role null (skipped) and country null", () => {
    expect(rankLine({ ...base, role: null, country: null, countryCount: 0 })).toBe("You're visitor #213");
  });
  test("unknown or invalid country codes never show a raw code", () => {
    for (const c of ["XX", "ZZ", "T1", "EU", "vn", "VNN", ""]) {
      expect(rankLine({ ...base, country: c, countryCount: 5 })).not.toContain(c || "~");
    }
  });
  test("no ordinal: falls back to the real total, singular and plural", () => {
    expect(rankLine({ ...base, ordinal: null, role: null, country: null, total: 1 })).toBe("1 visitor so far");
    expect(rankLine({ ...base, ordinal: null, role: null, country: null, total: 7 })).toBe("7 visitors so far");
  });
  test("nothing true to say gives null", () => {
    expect(rankLine({ ...base, ordinal: null, total: 0 })).toBeNull();
  });
  test("plural labels", () => {
    expect(rankLine({ ...base, role: "pm", roleCount: 3, country: null })).toContain("3 fellow PMs");
    expect(rankLine({ ...base, role: "curious", roleCount: 2, country: null })).toContain("2 curious visitors");
  });
  test("flags", () => {
    expect(flagOf("VN")).toBe("🇻🇳");
    expect(flagOf("XX")).toBe("");
    expect(flagOf(null)).toBe("");
  });
});

describe("leaderLine", () => {
  test("a clear leader", () => {
    expect(leaderLine({ founder: 9, engineer: 4 }, null)).toBe("Founders are leading so far.");
  });
  test("it is you", () => {
    expect(leaderLine({ founder: 9, engineer: 4 }, "founder")).toBe("Founders are leading so far. That's you.");
  });
  test("ties, tiny leads and empty data say nothing", () => {
    expect(leaderLine({ founder: 5, engineer: 5 }, null)).toBeNull();
    expect(leaderLine({ founder: 2 }, null)).toBeNull();
    expect(leaderLine({}, null)).toBeNull();
  });
});

describe("moveOwnCount", () => {
  test("moves one visitor, never below zero", () => {
    expect(moveOwnCount({ founder: 3, engineer: 0 }, "founder", "engineer")).toEqual({ founder: 2, engineer: 1 });
    expect(moveOwnCount({ founder: 0 }, "founder", "data")).toEqual({ founder: 0, data: 1 });
    expect(moveOwnCount({ founder: 3 }, null, "founder")).toEqual({ founder: 4 });
    const same = { founder: 3 };
    expect(moveOwnCount(same, "founder", "founder")).toBe(same);
  });
});

describe("pollRows", () => {
  test("counts only below 20 votes, with the invitation", () => {
    const r = pollRows(POLL_OPTIONS, { remittance: 3, "fraud-toolkit": 1 }, 4);
    expect(r.showPercent).toBe(false);
    expect(r.rows.every((x) => x.percent === null)).toBe(true);
    expect(r.rows.find((x) => x.id === "remittance")?.count).toBe(3);
    expect(r.note).toContain("first 20 votes");
  });
  test("zero votes", () => {
    expect(pollRows(POLL_OPTIONS, {}, 0).note).toBe("Be one of the first 20 votes");
    expect(pollRows(POLL_OPTIONS, {}, 0).rows.every((x) => x.fraction === 0)).toBe(true);
  });
  test("percentages from exactly 20 votes", () => {
    const r = pollRows(POLL_OPTIONS, { remittance: 10, "fraud-toolkit": 5, "agent-payments": 5 }, 20);
    expect(r.showPercent).toBe(true);
    expect(r.rows.find((x) => x.id === "remittance")?.percent).toBe("50%");
    expect(pollRows(POLL_OPTIONS, { remittance: 19 }, 19).showPercent).toBe(false);
  });
  test("the six agreed options exist with the agreed ids", () => {
    expect(POLL_OPTIONS.map((o) => o.id)).toEqual(["compliance-copilot", "remittance", "fraud-toolkit", "women-in-tech", "backoffice-agent", "agent-payments"]);
  });
});

describe("live stats scheduling and parsing", () => {
  const go = { enabled: true, onScreen: true, tabVisible: true, lastInteractionAt: 0, now: 1000 };
  test("polls only when enabled, on screen, tab visible and not idle", () => {
    expect(shouldPoll(go)).toBe(true);
    expect(shouldPoll({ ...go, onScreen: false })).toBe(false);
    expect(shouldPoll({ ...go, tabVisible: false })).toBe(false);
    expect(shouldPoll({ ...go, enabled: false })).toBe(false);
    expect(shouldPoll({ ...go, now: IDLE_STOP_MS + 1 })).toBe(false);
    expect(shouldPoll({ ...go, now: IDLE_STOP_MS - 1 })).toBe(true);
  });
  test("delay is 15 s plus or minus 2 s", () => {
    expect(nextDelay(0)).toBe(13_000);
    expect(nextDelay(0.5)).toBe(15_000);
    expect(nextDelay(0.999)).toBeLessThanOrEqual(17_000);
  });
  test("parseStats rejects junk and clamps bad numbers", () => {
    expect(parseStats(null)).toBeNull();
    expect(parseStats({ total: "x" })).toBeNull();
    const ok = parseStats({ total: 5, byRole: { founder: 2, engineer: -1, bogus: 9 }, you: { country: "VN", countryCount: 1, countryRank: 1, roleCount: 2 } });
    expect(ok?.byRole).toEqual({ founder: 2 });
    expect(ok?.you.country).toBe("VN");
  });
});

describe("poll state helpers", () => {
  const data = { counts: { remittance: 2 }, total: 2, mine: null };
  test("first vote adds to the total, a change keeps it", () => {
    const a = applyVote(data, "remittance");
    expect([a.counts.remittance, a.total, a.mine]).toEqual([3, 3, "remittance"]);
    const b = applyVote(a, "fraud-toolkit");
    expect([b.counts.remittance, b.counts["fraud-toolkit"], b.total, b.mine]).toEqual([2, 1, 3, "fraud-toolkit"]);
    expect(applyVote(b, "fraud-toolkit")).toBe(b);
  });
  test("parsePoll validates", () => {
    expect(parsePoll({})).toBeNull();
    const p = parsePoll({ total: 3, counts: { remittance: 3 }, mine: "remittance" });
    expect(p?.mine).toBe("remittance");
    expect(parsePoll({ total: 3, counts: {}, mine: "nope" })?.mine).toBeNull();
  });
});
