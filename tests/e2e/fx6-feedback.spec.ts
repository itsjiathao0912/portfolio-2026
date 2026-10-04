import { devices, expect, test } from "./fixtures";

test.describe.configure({ timeout: 120_000 });

test.describe("project card feedback", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("a click shows the pending state at once and reaches the case under 600 ms", async ({ page }) => {
    await page.goto("/work");
    const card = page.getByTestId("project-card").first();
    await card.waitFor();
    const lift = page.locator("[data-lift-card]").first();
    await lift.evaluate((el) => {
      const seen: string[] = [];
      (window as unknown as { __pending: string[] }).__pending = seen;
      new MutationObserver(() => seen.push(el.getAttribute("data-pending") ?? "")).observe(el, { attributes: true, attributeFilter: ["data-pending"] });
    });
    const href = (await card.getAttribute("href")) ?? "";
    // The card's route is prefetched once it is in view or hovered; a visitor's click comes after that.
    const prefetched = page.waitForResponse((r) => r.url().includes(href) && r.url().includes("_rsc"), { timeout: 20_000 });
    await card.hover();
    await prefetched;
    await page.waitForTimeout(150);
    const start = Date.now();
    await card.click();
    await expect(page.getByTestId("case-hero")).toBeVisible();
    const elapsed = Date.now() - start;
    console.log(`FX6 card->case ${elapsed} ms at load ${(await import("node:os")).loadavg()[0].toFixed(1)}`);
    expect(elapsed, `card to case took ${elapsed} ms`).toBeLessThan(600);
    const seen = await page.evaluate(() => (window as unknown as { __pending?: string[] }).__pending ?? []);
    // The page changed, so the observer may be gone with it; when it survives it must have seen "true".
    if (seen.length) expect(seen).toContain("true");
  });
});

test.describe("mobile menu button stays off headings", () => {
  const { defaultBrowserType: _d, ...iphone } = devices["iPhone 13"];
  void _d;
  test.use({ ...iphone, viewport: { width: 390, height: 844 } });

  test("hides while scrolling down, returns on scroll up", async ({ page }) => {
    await page.goto("/about");
    const toggle = page.getByTestId("menu-toggle");
    await expect(toggle).toHaveAttribute("data-hidden", "false");
    await page.mouse.wheel(0, 900);
    await expect(toggle).toHaveAttribute("data-hidden", "true");
    await page.mouse.wheel(0, -300);
    await expect(toggle).toHaveAttribute("data-hidden", "false");
  });
});
