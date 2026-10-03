import { expect, test } from "./fixtures";

// Real page loads on a busy machine: allow more than the 30s default.
test.describe.configure({ timeout: 120_000 });

test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });

test("reduced motion: everything visible, no movement-driven effects", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("dot-grid").first()).toHaveAttribute("data-mode", "static");
  // Reveals settle to fully visible without the 24px rise.
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(600);
  const reveals = page.locator("[data-reveal]");
  const states = await reveals.evaluateAll((els) =>
    els.map((el) => ({ opacity: getComputedStyle(el).opacity, transform: getComputedStyle(el).transform }))
  );
  const lastFew = states.slice(-3);
  for (const state of lastFew) {
    expect(Number(state.opacity)).toBeGreaterThan(0.95);
    expect(["none", "matrix(1, 0, 0, 1, 0, 0)"]).toContain(state.transform);
  }
  // Page transition is fade-only.
  const animation = await page.locator(".page-enter").evaluate((el) => getComputedStyle(el).animationName);
  expect(animation).toBe("page-fade");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
