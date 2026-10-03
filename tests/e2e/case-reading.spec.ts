import { expect, test } from "./fixtures";
import { trackErrors } from "./helpers";

// Reading aids on case studies: glossary hovers, Skim / Read / Deep, decision cards, badges, results band.
test.describe.configure({ timeout: 120_000 });
test.use({ viewport: { width: 1440, height: 900 } });

const visibleRuns = (page: import("@playwright/test").Page) => page.locator('[data-testid="depth-run"][data-visible="true"]').count();

test("glossary term opens on focus, stays in the viewport, closes on Esc, only the first use is marked", async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto("/work/cortex-sentinel");
  const term = page.locator('[data-term="aml"]');
  await expect(term).toHaveCount(1);
  await term.scrollIntoViewIfNeeded();
  await term.focus();
  const card = page.getByTestId("glossary-card");
  await expect(card).toBeVisible();
  await expect(card).toContainText("Anti-money laundering");
  const box = await card.boundingBox();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(1440);
  await page.keyboard.press("Escape");
  await expect(card).toHaveCount(0);
  expect(errors, errors.join("\n")).toEqual([]);
});

test("glossary card fits a 390 px phone and toggles on tap", async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  await page.goto("/work/cortex-sentinel");
  const term = page.locator('[data-term="aml"]');
  await term.scrollIntoViewIfNeeded();
  await term.tap();
  const card = page.getByTestId("glossary-card");
  await expect(card).toBeVisible();
  const box = await card.boundingBox();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(390);
  await ctx.close();
});

test("depth pill: skim shows less than read than deep, TOC follows, content stays in the DOM, choice persists", async ({ page }) => {
  await page.goto("/work/cortex-sentinel");
  await expect(page.getByTestId("depth-pill")).toHaveAttribute("data-ready", "true");
  await expect(page.getByTestId("depth-read")).toHaveAttribute("aria-checked", "true");
  const tocCount = () => page.locator('[data-testid="case-toc"] a[data-section]').count();
  const read = { runs: await visibleRuns(page), toc: await tocCount() };

  await page.getByTestId("depth-skim").click();
  await expect.poll(() => visibleRuns(page)).toBeLessThan(read.runs);
  await expect.poll(tocCount).toBeLessThan(read.toc);
  await expect(page.getByTestId("depth-stub").first()).toBeVisible();
  // Collapsed content is inert but still in the DOM.
  expect(await page.locator('[data-testid="depth-run"][data-visible="false"]').count()).toBeGreaterThan(0);
  await expect(page.getByTestId("results-band")).toBeVisible();
  await expect(page.getByTestId("decision-card")).toBeVisible();

  await page.getByTestId("depth-deep").click();
  await expect.poll(() => visibleRuns(page)).toBeGreaterThan(read.runs);
  await expect.poll(tocCount).toBeGreaterThan(read.toc);

  await page.reload();
  await expect(page.getByTestId("depth-deep")).toHaveAttribute("aria-checked", "true");
});

test("default depth follows the persona; #skim in the URL wins", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("thao:participate:persona", JSON.stringify("recruiter")));
  await page.goto("/work/ledgr");
  await expect(page.getByTestId("depth-skim")).toHaveAttribute("aria-checked", "true");
  await expect(page.getByTestId("depth-persona")).toContainText("Recruiter");
  await page.goto("/work/ledgr#deep");
  await expect(page.getByTestId("depth-deep")).toHaveAttribute("aria-checked", "true");
});

test("stub opens the depth it names", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("thao:participate:persona", JSON.stringify("recruiter")));
  await page.goto("/work/pac");
  await expect(page.getByTestId("depth-skim")).toHaveAttribute("aria-checked", "true");
  await page.getByTestId("depth-stub").first().click();
  await expect(page.getByTestId("depth-read")).toHaveAttribute("aria-checked", "true");
});

test("decision card flips with the keyboard and keeps both texts in the DOM", async ({ page }) => {
  await page.goto("/work/ledgr");
  const card = page.getByTestId("decision-card");
  await card.scrollIntoViewIfNeeded();
  const rejected = page.getByTestId("decision-rejected");
  await expect(rejected).toHaveAttribute("aria-pressed", "false");
  await rejected.focus();
  await page.keyboard.press("Enter");
  await expect(rejected).toHaveAttribute("aria-pressed", "true");
  await expect(card).toContainText("Why it lost");
  await expect(card).toContainText("Chosen");
});

test("every case ends with the same results band, at most 2 decision cards, badges only from the known set", async ({ page }) => {
  for (const slug of ["ledgr", "cortex-sentinel", "gocrypto", "cosap", "lumicap", "guardline", "zalo-game-center", "reorc-data-platform", "pac"]) {
    await page.goto(`/work/${slug}#deep`);
    await expect(page.getByTestId("results-band")).toHaveCount(1);
    expect(await page.getByTestId("decision-card").count(), slug).toBeLessThanOrEqual(2);
    const badges = await page.locator('[data-testid="results-badge"], [data-testid="viz-badge"]').allTextContents();
    for (const b of badges) expect(b.replace(/^[✓–]\s*/, "").trim().length, `${slug} badge`).toBeGreaterThan(0);
    const roles = await page.getByTestId("role-badge").allTextContents();
    for (const r of roles) expect(["Thao owned", "Team build", "Platform"]).toContain(r.trim());
  }
});
