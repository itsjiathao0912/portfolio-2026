import { test, expect } from "./fixtures";

// P5: live stats in the picker row and the "build next" poll. Needs the plug-in
// (LiveVisitorTop in the picker row, VisitorPoll above the footer contact).
// The shared DB is seeded once for all specs: use a unique seam country per
// test and assert relative values or mocked bodies, never exact shared counts.

const SEAM = (code: string) => ({ "x-e2e-geo": `${code}|Testville` });
const pollBody = (total: number, counts: Record<string, number>, mine: string | null = null) => ({
  counts: { "compliance-copilot": 0, remittance: 0, "fraud-toolkit": 0, "women-in-tech": 0, "backoffice-agent": 0, "agent-payments": 0, ...counts },
  total,
  mine,
});

test.describe("visitor stats", () => {
  test("your visitor number appears after a choice and counts once across reloads", async ({ page }) => {
    await page.setExtraHTTPHeaders(SEAM("LU"));
    await page.goto("/");
    await page.getByTestId("tile-founder").click();
    // The number rolls into place: compare against the stored ordinal, not a mid-roll frame.
    const stored = () => page.evaluate(() => (JSON.parse(localStorage.getItem("thao:visitor:v1") ?? "{}") as { ordinal?: number | null }).ordinal ?? null);
    await expect.poll(stored).toBeGreaterThan(0);
    const first = (await stored())!.toLocaleString("en-US");
    await expect(page.getByTestId("stat-ordinal")).toHaveText(first);
    await page.reload();
    await expect(page.getByTestId("stat-ordinal")).toHaveText(first);
    // Said once: the big stats carry the numbers, there is no second sentence repeating them.
    await expect(page.getByTestId("visitor-rank-line")).toHaveCount(0);
  });

  test("API failure leaves the picker intact and shows no error", async ({ page }) => {
    await page.route("**/api/stats**", (r) => r.abort());
    await page.goto("/");
    await expect(page.getByTestId("tile-founder")).toBeVisible();
    await expect(page.getByTestId("visitor-stats-strip")).toHaveCount(0);
    await expect(page.getByTestId("section-visitor").getByText(/error|failed|unavailable/i)).toHaveCount(0);
  });

  test("polling pauses in a hidden tab (request counting)", async ({ page }) => {
    let hits = 0;
    await page.route("**/api/stats**", (r) => {
      hits += 1;
      return r.continue();
    });
    await page.goto("/");
    await page.getByTestId("section-visitor").scrollIntoViewIfNeeded(); // polling only runs while the row is on screen
    await expect.poll(() => hits).toBeGreaterThan(0);
    await page.evaluate(() => {
      Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "hidden" });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    const before = hits;
    await page.waitForTimeout(1500);
    expect(hits).toBe(before);
  });
});

test.describe("build-next poll", () => {
  // Votes count only for a visitor who picked a role (F5): seed one, as a returning visitor would have.
  test.beforeEach(async ({ page }, info) => {
    if (info.title.startsWith("no role")) return;
    await page.addInitScript(() => {
      if (!localStorage.getItem("thao:visitor:v1")) localStorage.setItem("thao:visitor:v1", JSON.stringify({ v: 1, role: "founder", collapsed: true, visitorId: "e2epoll-" + Math.random().toString(36).slice(2, 12), ordinal: null }));
    });
    await page.route("**/api/visit", (r) => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ordinal: 1, counted: false }) }));
  });

  test("no role yet: a vote is not sent, and the note asks to pick first", async ({ page }) => {
    const votes: string[] = [];
    await page.route("**/api/poll", async (r) => {
      const body = r.request().postDataJSON() as { option: string | null };
      if (body.option) votes.push(body.option);
      await r.fulfill({ json: pollBody(4, { remittance: 4 }) });
    });
    await page.goto("/");
    await page.getByTestId("visitor-poll").scrollIntoViewIfNeeded();
    await page.getByTestId("poll-option-remittance").click();
    await expect(page.getByTestId("poll-note")).toContainText("Pick who you are");
    await expect(page.getByTestId("poll-option-remittance")).toHaveAttribute("aria-checked", "false");
    expect(votes).toEqual([]);
  });

  test("below 20 votes is a calm invitation: chips and a small total, no rows of numbers", async ({ page }) => {
    await page.route("**/api/poll", (r) => r.fulfill({ json: pollBody(4, { remittance: 3, "fraud-toolkit": 1 }) }));
    await page.goto("/");
    await page.getByTestId("visitor-poll").scrollIntoViewIfNeeded();
    await expect(page.getByTestId("poll-option-remittance")).toBeVisible();
    await expect(page.getByTestId("poll-note")).toContainText("Cast the first votes");
    await expect(page.getByTestId("poll-note")).toContainText("4 so far");
    await expect(page.locator('[data-testid^="poll-value-"]')).toHaveCount(0);
  });

  test("after voting, below 20 votes, the real counts settle in (zeros stay quiet)", async ({ page }) => {
    let mine: string | null = null;
    await page.route("**/api/poll", async (r) => {
      const body = r.request().postDataJSON() as { option: string | null };
      if (body.option) mine = body.option;
      await r.fulfill({ json: pollBody(4, { remittance: 3, "fraud-toolkit": 1 }, mine) });
    });
    await page.goto("/");
    await page.getByTestId("visitor-poll").scrollIntoViewIfNeeded();
    await page.getByTestId("poll-option-remittance").click();
    await expect(page.getByTestId("poll-option-remittance")).toHaveAttribute("aria-checked", "true");
    await expect(page.getByTestId("poll-value-remittance")).toHaveText("3");
    await expect(page.getByTestId("poll-value-fraud-toolkit")).toHaveText("1");
    await expect(page.getByTestId("poll-value-agent-payments")).toHaveCount(0);
    await expect(page.getByTestId("poll-note")).toContainText("Vote saved");
  });

  test("from 20 votes shows percentages, and a vote moves mine", async ({ page }) => {
    let mine: string | null = null;
    await page.route("**/api/poll", async (r) => {
      const body = r.request().postDataJSON() as { option: string | null };
      if (body.option) mine = body.option;
      await r.fulfill({ json: pollBody(20, { remittance: mine === "remittance" ? 11 : 10, "agent-payments": 10 }, mine) });
    });
    await page.goto("/");
    await page.getByTestId("visitor-poll").scrollIntoViewIfNeeded();
    await expect(page.getByTestId("poll-value-agent-payments")).toHaveText("50%");
    await page.getByTestId("poll-option-remittance").click();
    await expect(page.getByTestId("poll-option-remittance")).toHaveAttribute("aria-checked", "true");
  });

  test("a throttled vote reverts and says so; the poll stays usable", async ({ page }) => {
    await page.route("**/api/poll", (r) => {
      const body = r.request().postDataJSON() as { option: string | null };
      if (body.option) return r.fulfill({ status: 429, json: { error: "throttled" }, headers: { "retry-after": "2" } });
      return r.fulfill({ json: pollBody(5, { remittance: 5 }) });
    });
    await page.goto("/");
    await page.getByTestId("visitor-poll").scrollIntoViewIfNeeded();
    await page.getByTestId("poll-option-agent-payments").click();
    await expect(page.getByTestId("poll-note")).toContainText("Try again");
    await expect(page.getByTestId("poll-option-agent-payments")).toHaveAttribute("aria-checked", "false");
  });
});

test.describe("visitor countries", () => {
  const body = {
    total: 120,
    byRole: { founder: 4 },
    topCountries: [{ country: "VN", count: 64 }, { country: "SG", count: 18 }, { country: "US", count: 15 }, { country: "DE", count: 9 }, { country: "GB", count: 7 }, { country: "JP", count: 6 }, { country: "AU", count: 4 }, { country: "FR", count: 1 }],
    you: { country: "VN", countryCount: 64, countryRank: 1, roleCount: 4 },
  };
  for (const vp of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    test(`${vp.width}px: a flag per country, biggest first, with a name + count tooltip on hover, focus and tap`, async ({ page }) => {
      await page.setViewportSize(vp);
      await page.route("**/api/stats**", (r) => r.fulfill({ json: body }));
      await page.goto("/");
      await page.getByTestId("section-visitor").scrollIntoViewIfNeeded(); // stats poll only while the row is on screen
      await page.getByTestId("tile-founder").click();
      const list = page.getByTestId("visitor-countries");
      await list.scrollIntoViewIfNeeded();
      await expect(list.getByRole("button")).toHaveCount(8);
      await expect(list.getByRole("button").first()).toHaveAccessibleName("Vietnam: 64 people");
      await expect(page.getByTestId("country-FR")).toHaveAccessibleName("France: 1 person");
      const tip = page.getByTestId("country-tip-SG");
      await expect(tip).toHaveCSS("opacity", "0");
      if (vp.width > 400) await page.getByTestId("country-SG").hover();
      else await page.getByTestId("country-SG").tap().catch(() => page.getByTestId("country-SG").click());
      await expect(tip).toHaveCSS("opacity", "1");
      await expect(tip).toHaveText("Singapore: 18 people");
      await page.mouse.move(0, 0);
      await page.getByTestId("country-SG").focus();
      await page.keyboard.press("Tab"); // keyboard focus shows the next flag's tooltip, and only that one
      await expect(tip).toHaveCSS("opacity", "0");
      await expect(page.getByTestId("country-tip-US")).toHaveCSS("opacity", "1");
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
      await page.getByTestId("visitor-stats-strip").screenshot({ path: `process/features/portfolio-site/active/autoresearch-ux-261004_04-10-26/research/R8-shots/countries-${vp.width}.png` });
    });
  }
});
