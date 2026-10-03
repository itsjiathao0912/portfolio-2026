import { expect, test } from "./fixtures";

// Headless Chromium hides scrollbars by default. Show them, so 100vw really is
// wider than the page, as on Windows, Linux and macOS "always show scrollbars".
test.use({ viewport: { width: 1440, height: 900 }, launchOptions: { ignoreDefaultArgs: ["--hide-scrollbars"] } });
test.describe.configure({ timeout: 120_000 });

test("full-bleed rows never scroll the page sideways, even with a visible scrollbar", async ({ page }) => {
  for (const path of ["/work/ledgr", "/work/cortex-sentinel"]) {
    await page.goto(path);
    // No `overflow-y: scroll` / `scrollbar-gutter` here on purpose: with those
    // set, Chromium shrinks 100vw to exclude the scrollbar and the bug hides.
    // The real case is a long page whose scrollbar appears on its own.
    const row = page.getByTestId("image-row").first();
    await row.scrollIntoViewIfNeeded();
    // The row itself still spans the full viewport (so the test is not vacuous)…
    const widths = await page.evaluate(() => ({
      row: document.querySelector("[data-testid=image-row]")!.getBoundingClientRect().width,
      page: document.documentElement.clientWidth,
    }));
    expect(widths.row).toBeGreaterThan(widths.page);
    // …but the page refuses to move sideways.
    await page.evaluate(() => window.scrollTo(200, window.scrollY));
    await page.mouse.wheel(300, 0);
    await page.waitForTimeout(150);
    expect(await page.evaluate(() => window.scrollX)).toBe(0);
  }
});
