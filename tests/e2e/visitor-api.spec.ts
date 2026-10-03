import { test, expect } from "./fixtures";

// Live route behaviour against the isolated server (production-mode build, local
// DB, PORTFOLIO_E2E=1). The shared DB is seeded once for all specs, so every
// test uses its own random visitor id and a distinct seam country, and asserts
// deltas or its own rows, never exact shared counts.

const rid = () => `e2e-${Math.random().toString(36).slice(2, 12)}${Date.now().toString(36)}`;

test.describe("visitor api", () => {
  test.use({ extraHTTPHeaders: {} });

  function api(baseURL: string | undefined) {
    const origin = new URL(baseURL!).origin;
    return { origin, headers: { origin, "content-type": "application/json" } };
  }

  test("POST twice with the same id counts once, then a role change counts again", async ({ request, baseURL }) => {
    const { headers } = api(baseURL);
    const seam = { ...headers, "x-e2e-geo": "IS|Reykjavik" };
    const id = rid();
    const first = await request.post("/api/visit", { headers: seam, data: { visitorId: id, role: "founder" } });
    expect(first.status()).toBe(200);
    const a = await first.json();
    expect(a.counted).toBe(true);
    expect(a.ordinal).toBeGreaterThan(0);

    const second = await request.post("/api/visit", { headers: seam, data: { visitorId: id, role: "founder" } });
    expect(await second.json()).toEqual({ ordinal: a.ordinal, counted: false });

    await new Promise((r) => setTimeout(r, 2200));
    const change = await request.post("/api/visit", { headers: seam, data: { visitorId: id, role: "engineer" } });
    expect(await change.json()).toEqual({ ordinal: a.ordinal, counted: true });

    const fast = await request.post("/api/visit", { headers: seam, data: { visitorId: id, role: "data" } });
    expect(fast.status()).toBe(429);
    expect(Number(fast.headers()["retry-after"])).toBeGreaterThanOrEqual(1);
  });

  test("the geo seam drives the greeting source and the stats country", async ({ request, baseURL }) => {
    const { headers } = api(baseURL);
    const geo = await request.get("/api/geo", { headers: { "x-e2e-geo": "NO|Oslo" } });
    expect(geo.headers()["cache-control"]).toBe("no-store");
    expect(await geo.json()).toEqual({ country: "NO", city: "Oslo" });
    const none = await request.get("/api/geo", { headers: { "x-e2e-geo": "XX|" } });
    expect(await none.json()).toEqual({ country: null, city: null });

    const id = rid();
    await request.post("/api/visit", { headers: { ...headers, "x-e2e-geo": "FI|Helsinki" }, data: { visitorId: id, role: "investor" } });
    const stats = await request.get("/api/stats?role=investor", { headers: { "x-e2e-geo": "FI|Helsinki" } });
    expect(stats.headers()["cache-control"]).toBe("private, max-age=10");
    const body = await stats.json();
    expect(body.you.country).toBe("FI");
    expect(body.you.countryCount).toBeGreaterThanOrEqual(1);
    expect(body.you.roleCount).toBeGreaterThanOrEqual(1);
    expect(body.total).toBeGreaterThanOrEqual(1);
  });

  test("a client-sent country is rejected", async ({ request, baseURL }) => {
    const { headers } = api(baseURL);
    const res = await request.post("/api/visit", { headers, data: { visitorId: rid(), role: null, country: "US" } });
    expect(res.status()).toBe(400);
  });

  test("403 for a foreign or missing Origin, 400 for bad input, 413 for a big body", async ({ request, baseURL }) => {
    const { headers } = api(baseURL);
    const body = { visitorId: rid(), role: null };
    const foreign = await request.post("/api/visit", { headers: { ...headers, origin: "https://evil.example" }, data: body });
    expect(foreign.status()).toBe(403);
    const missing = await request.post("/api/visit", { headers: { "content-type": "application/json" }, data: body });
    expect(missing.status()).toBe(403);
    const badRole = await request.post("/api/visit", { headers, data: { visitorId: rid(), role: "wizard" } });
    expect(badRole.status()).toBe(400);
    const big = await request.post("/api/visit", { headers, data: { visitorId: rid(), role: null, pad: "x".repeat(2000) } });
    expect(big.status()).toBe(413);
  });

  test("poll: needs a visit first, one vote, changeable, no id in a URL", async ({ request, baseURL }) => {
    const { headers } = api(baseURL);
    const id = rid();
    const early = await request.post("/api/poll", { headers, data: { visitorId: id, option: "remittance" } });
    expect(early.status()).toBe(403);
    await request.post("/api/visit", { headers, data: { visitorId: id, role: null } });
    await new Promise((r) => setTimeout(r, 2200));
    const vote = await request.post("/api/poll", { headers, data: { visitorId: id, option: "remittance" } });
    expect(vote.status()).toBe(200);
    expect((await vote.json()).mine).toBe("remittance");
    const read = await request.post("/api/poll", { headers, data: { visitorId: id, option: null } });
    expect((await read.json()).mine).toBe("remittance");
    const anon = await request.get(`/api/poll?visitorId=${id}`);
    expect(Object.keys(await anon.json()).sort()).toEqual(["counts", "total"]);
  });
});
