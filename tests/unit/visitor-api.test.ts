import { afterEach, beforeEach, describe, expect, spyOn, test } from "bun:test";
import { createTestDb } from "../helpers/test-db";
import { handleGeo, handlePoll, handleStats, handleVisit, type VisitorDeps } from "../../src/lib/visitor-handlers";
import { resetVisitorMemos } from "../../src/lib/visits";
import { hashVisitor, resolveSalt } from "../../src/lib/visitor-hash";

const SALT = "s".repeat(32);
const ID = "visitor-id-12345";
const ORIGIN = "http://localhost:3000";

let clock = 9_000_000;
function deps(over: Partial<VisitorDeps> = {}): VisitorDeps {
  const { db } = createTestDb();
  return { db, env: { VISITOR_SALT: SALT }, now: () => clock, geo: { country: "VN", city: "Hanoi" }, ...over };
}
function post(path: string, body: unknown, headers: Record<string, string> = {}) {
  const raw = typeof body === "string" ? body : JSON.stringify(body);
  return new Request(`${ORIGIN}${path}`, {
    method: "POST",
    headers: { origin: ORIGIN, host: "localhost:3000", "content-type": "application/json", ...headers },
    body: raw,
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- test helper: response bodies are asserted field by field
const body = async (res: Response) => (await res.json()) as any;

const logs: ReturnType<typeof spyOn>[] = [];
beforeEach(() => {
  resetVisitorMemos();
  clock += 100_000;
  for (const m of ["log", "info", "warn", "error", "debug"] as const) logs.push(spyOn(console, m));
});
afterEach(() => {
  // Nothing may be logged by any handler.
  for (const s of logs) {
    expect(s).not.toHaveBeenCalled();
    s.mockRestore();
  }
  logs.length = 0;
});

describe("handleVisit guards", () => {
  test("bad Origin and missing Origin are 403", async () => {
    const d = deps();
    expect((await handleVisit(post("/api/visit", { visitorId: ID, role: null }, { origin: "http://evil.example" }), d)).status).toBe(403);
    expect((await handleVisit(post("/api/visit", { visitorId: ID, role: null }, { origin: "not a url" }), d)).status).toBe(403);
    const noOrigin = new Request(`${ORIGIN}/api/visit`, { method: "POST", headers: { "content-type": "application/json" }, body: "{}" });
    expect((await handleVisit(noOrigin, d)).status).toBe(403);
  });

  test("non-JSON content-type and invalid json are 400", async () => {
    const d = deps();
    expect((await handleVisit(post("/api/visit", "x", { "content-type": "text/plain" }), d)).status).toBe(400);
    expect((await handleVisit(post("/api/visit", "{nope"), d)).status).toBe(400);
  });

  test("body over 512 B is 413, by header and by streamed read", async () => {
    const d = deps();
    const big = JSON.stringify({ visitorId: ID, role: null, pad: "x".repeat(600) });
    expect((await handleVisit(post("/api/visit", big, { "content-length": String(big.length) }), d)).status).toBe(413);
    const lying = post("/api/visit", big);
    lying.headers.set("content-length", "10");
    expect((await handleVisit(lying, d)).status).toBe(413);
  });

  test("extra keys, bad role, bad id are 400", async () => {
    const d = deps();
    for (const payload of [
      { visitorId: ID, role: null, country: "US" },
      { visitorId: ID, role: "wizard" },
      { visitorId: "short", role: null },
      { visitorId: "bad id with spaces!", role: null },
      { role: null },
    ]) {
      expect((await handleVisit(post("/api/visit", payload), d)).status).toBe(400);
    }
  });

  test("production without a salt, or a short one, is 503", async () => {
    expect((await handleVisit(post("/api/visit", { visitorId: ID, role: null }), deps({ env: {} }))).status).toBe(503);
    expect((await handleVisit(post("/api/visit", { visitorId: ID, role: null }), deps({ env: { VISITOR_SALT: "short" } }))).status).toBe(503);
    // local DB source falls back to a dev salt
    const local = deps({ env: { LOCAL_DB_PATH: "x" } });
    expect((await handleVisit(post("/api/visit", { visitorId: ID, role: null }), local)).status).toBe(200);
  });

  test("throttle is 429 with Retry-After", async () => {
    const d = deps();
    expect((await handleVisit(post("/api/visit", { visitorId: ID, role: "founder" }), d)).status).toBe(200);
    const res = await handleVisit(post("/api/visit", { visitorId: ID, role: "engineer" }), d);
    expect(res.status).toBe(429);
    expect(Number(res.headers.get("retry-after"))).toBeGreaterThanOrEqual(1);
  });

  test("counts once, then counted:false; country comes from the server", async () => {
    const d = deps();
    const a = await body(await handleVisit(post("/api/visit", { visitorId: ID, role: "founder" }), d));
    const b = await body(await handleVisit(post("/api/visit", { visitorId: ID, role: "founder" }), d));
    expect(a).toEqual({ ordinal: 1, counted: true });
    expect(b).toEqual({ ordinal: 1, counted: false });
    const row = await d.db.prepare(`SELECT country FROM VisitorSeen`).first<{ country: string }>();
    expect(row?.country).toBe("VN");
  });
});

describe("hash", () => {
  test("is a keyed hash: salt and id both matter, the id is not in the output", async () => {
    const a = await hashVisitor("abc", "salt-one-salt-one-1");
    expect(a).toMatch(/^[0-9a-f]{64}$/);
    expect(a).not.toBe(await hashVisitor("abc", "salt-two-salt-two-2"));
    expect(a).not.toBe(await hashVisitor("abd", "salt-one-salt-one-1"));
    expect(a).not.toContain("abc");
    expect(resolveSalt({}).ok).toBe(false);
  });
});

describe("handleStats and handleGeo", () => {
  test("stats returns the contract shape with private cache and validates role", async () => {
    const d = deps();
    await handleVisit(post("/api/visit", { visitorId: ID, role: "founder" }), d);
    const res = await handleStats(new Request(`${ORIGIN}/api/stats?role=founder`), d);
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("private, max-age=10");
    const out = await body(res);
    expect(out.total).toBe(1);
    expect(out.byRole.founder).toBe(1);
    expect(out.you).toEqual({ country: "VN", countryCount: 1, countryRank: 1, roleCount: 1 });
    expect((await handleStats(new Request(`${ORIGIN}/api/stats?role=wizard`), d)).status).toBe(400);
    expect((await handleStats(new Request(`${ORIGIN}/api/stats`), d)).status).toBe(200);
  });

  test("geo is no-store and returns the sanitised pair", async () => {
    const res = await handleGeo(new Request(`${ORIGIN}/api/geo`), deps());
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(await body(res)).toEqual({ country: "VN", city: "Hanoi" });
  });
});

describe("handlePoll", () => {
  test("anonymous GET returns counts and total only", async () => {
    const res = await handlePoll(new Request(`${ORIGIN}/api/poll`), deps());
    const out = await body(res);
    expect(Object.keys(out).sort()).toEqual(["counts", "total"]);
  });

  test("vote needs a visit first, then votes, changes, reads", async () => {
    const d = deps();
    expect((await handlePoll(post("/api/poll", { visitorId: ID, option: "remittance" }), d)).status).toBe(403);
    await handleVisit(post("/api/visit", { visitorId: ID, role: null }), d);
    clock += 3000;
    const v = await body(await handlePoll(post("/api/poll", { visitorId: ID, option: "remittance" }), d));
    expect(v).toMatchObject({ mine: "remittance", total: 1 });
    expect(v.counts.remittance).toBe(1);
    const read = await body(await handlePoll(post("/api/poll", { visitorId: ID, option: null }), d));
    expect(read.mine).toBe("remittance");
    clock += 3000;
    const changed = await body(await handlePoll(post("/api/poll", { visitorId: ID, option: "fraud-toolkit" }), d));
    expect(changed.mine).toBe("fraud-toolkit");
    expect(changed.total).toBe(1);
    expect(changed.counts.remittance).toBe(0);
  });

  test("strict body, origin and salt guards apply", async () => {
    const d = deps();
    expect((await handlePoll(post("/api/poll", { visitorId: ID, option: "remittance", extra: 1 }), d)).status).toBe(400);
    expect((await handlePoll(post("/api/poll", { visitorId: ID, option: "nope" }), d)).status).toBe(400);
    expect((await handlePoll(post("/api/poll", { visitorId: ID, option: null }, { origin: "http://evil.example" }), d)).status).toBe(403);
    expect((await handlePoll(post("/api/poll", { visitorId: ID, option: null }), deps({ env: {} }))).status).toBe(503);
  });

  test("no visitor id ever travels in a URL", async () => {
    const d = deps();
    const res = await handlePoll(new Request(`${ORIGIN}/api/poll?visitorId=${ID}`), d);
    expect(Object.keys(await body(res))).toEqual(["counts", "total"]);
  });
});
