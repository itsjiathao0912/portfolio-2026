import { expect, test } from "./fixtures";

// Prod bug (2026-10-05): a nav click within ~1 s of DOMContentLoaded could
// freeze for good. A click at any moment after load must arrive within 5 s.
test.describe.configure({ timeout: 300_000 });

for (const delay of [0, 200, 500, 1000]) {
  test(`nav click ${delay} ms after DOMContentLoaded always arrives`, async ({ page }) => {
    for (let i = 0; i < 10; i++) {
      await page.goto("/", { waitUntil: "domcontentloaded" });
      if (delay) await page.waitForTimeout(delay);
      await page.locator('header a[href="/work"]').first().click({ noWaitAfter: true });
      await expect(page).toHaveURL(/\/work$/, { timeout: 5_000 });
    }
  });
}
