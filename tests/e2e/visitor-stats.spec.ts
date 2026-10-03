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
  test("stats line appears after a choice and counts once across reloads", async ({ page }) => {
    await page.setExtraHTTPHeaders(SEAM("LU"));
    await page.goto("/");
    await page.getByTestId("tile-founder").click();
    const line = page.getByTestId("visitor-rank-line");
    await expect(line).toContainText("You're visitor #");
    const first = (await line.textContent()) ?? "";
    await page.reload();
    await expect(page.getByTestId("visitor-rank-line")).toContainText("You're visitor #");
    expect(await page.getByTestId("visitor-rank-line").textContent()).toContain(first.match(/#\d+/)![0]);
  });

  test("API failure leaves the picker intact and shows no error", async ({ page }) => {
    await page.route("**/api/stats**", (r) => r.abort());
    await page.goto("/");
    await expect(page.getByTestId("tile-founder")).toBeVisible();
    await expect(page.getByTestId("visitor-rank-line")).toHaveCount(0);
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
  test("below 20 votes shows counts and the invitation, no percentages", async ({ page }) => {
    await page.route("**/api/poll", (r) => r.fulfill({ json: pollBody(4, { remittance: 3, "fraud-toolkit": 1 }) }));
    await page.goto("/");
    await page.getByTestId("visitor-poll").scrollIntoViewIfNeeded();
    await expect(page.getByTestId("poll-value-remittance")).toHaveText("3");
    await expect(page.getByTestId("poll-note")).toContainText("first 20 votes");
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
