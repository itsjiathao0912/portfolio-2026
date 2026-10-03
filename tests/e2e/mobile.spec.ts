import { devices, expect, test } from "@playwright/test";
import { expectNoHorizontalOverflow, scrollThrough, SLUGS, trackErrors } from "./helpers";

const { defaultBrowserType: _ignored, ...iphone } = devices["iPhone 13"];
void _ignored;
test.use({ ...iphone, viewport: { width: 390, height: 844 } });
// Real page loads on a busy machine: allow more than the 30s default.
test.describe.configure({ timeout: 120_000 });

test("mobile menu opens, traps focus, and closes on Escape and on link", async ({ page }) => {
  await page.goto("/");
  const toggle = page.getByTestId("menu-toggle");
  await expect(toggle).toBeVisible();
  await expect(page.getByTestId("mobile-menu")).toHaveCount(0);

  await toggle.tap();
  const menu = page.getByTestId("mobile-menu");
  await expect(menu).toBeVisible();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(menu).toHaveCount(0);

  await toggle.tap();
  await menu.getByRole("link", { name: "About" }).tap();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.getByTestId("mobile-menu")).toHaveCount(0);
});

test("touch never leaves a liquid fill stuck", async ({ page }) => {
  await page.goto("/");
  const button = page.getByTestId("footer-email");
  await expect(button).toHaveAttribute("data-pressed", "false");
  // Record every value data-pressed takes, so the short pulse cannot be missed.
  await button.evaluate((el) => {
    const seen: string[] = [];
    (window as unknown as { __pressed: string[] }).__pressed = seen;
    new MutationObserver(() => seen.push(el.getAttribute("data-pressed") ?? "")).observe(el, {
      attributes: true,
      attributeFilter: ["data-pressed"],
    });
  });
  await button.dispatchEvent("pointerdown", { pointerType: "touch", clientX: 10, clientY: 10, bubbles: true });
  await expect.poll(() => page.evaluate(() => (window as unknown as { __pressed: string[] }).__pressed)).toEqual(["true", "false"]);
  await expect(button).toHaveAttribute("data-filled", "false");
});

test("dot grid uses the idle mode without a cursor", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("dot-grid").first()).toHaveAttribute("data-mode", "idle");
});

// One test per page so each gets its own time budget and they run in
// parallel; a single test walking every page timed out under machine load.
for (const path of ["/", "/about", "/work", ...SLUGS.map((s) => `/work/${s}`), "/missing-page"]) {
  test(`${path} fits 390px with no sideways scroll and no console errors`, async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto(path);
    await scrollThrough(page);
    await expectNoHorizontalOverflow(page);
    expect(errors.filter((e) => !e.includes("404"))).toEqual([]);
  });
}

test("case study: TOC hidden on phone, section pill opens a sheet", async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto("/work/ledgr");
  // The TOC is desktop-only.
  await expect(page.getByTestId("toc")).toBeHidden();
  // Jump instantly so the scroll direction is unambiguous.
  await page.evaluate(() => (document.documentElement.style.scrollBehavior = "auto"));
  // Below xl a "sections" pill replaces it once the cover scrolls away.
  await page.evaluate(() => {
    const cover = document.getElementById("case-cover")!;
    window.scrollTo(0, cover.getBoundingClientRect().bottom + window.scrollY + 100);
  });
  const menu = page.getByTestId("section-menu");
  const pill = page.getByTestId("section-menu-button");
  // Hidden while reading down; a small scroll up brings it back.
  await page.waitForTimeout(300);
  await expect(menu).toHaveAttribute("data-shown", "false");
  await page.evaluate(() => window.scrollBy(0, -80));
  await expect(menu).toHaveAttribute("data-shown", "true");
  await expect(pill).toBeVisible();
  await pill.click();
  const sheet = page.getByRole("dialog", { name: "Sections" });
  await expect(sheet).toBeVisible();
  await sheet.getByRole("link").first().click();
  await expect(sheet).toHaveCount(0);
  expect(errors.filter((e) => !e.includes("404"))).toEqual([]);
});

test("/work filter chips show they scroll sideways, and the hint clears at the end", async ({ page }) => {
  await page.goto("/work");
  const row = page.getByTestId("filter-chips");
  const more = page.getByTestId("filter-chips-more");
  const box = (await row.boundingBox())!;
  expect(await row.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true);
  // A chip is cut by the right edge: partly visible, not hidden entirely.
  const cut = await page.getByTestId("filter-chip").evaluateAll(
    (els, right) => els.some((el) => {
      const r = el.getBoundingClientRect();
      return r.left < right && r.right > right;
    }),
    box.x + box.width
  );
  expect(cut).toBe(true);
  await expect(row).toHaveAttribute("data-more-right", "true");
  await expect(more).toHaveCSS("opacity", "1");
  await row.evaluate((el) => el.scrollTo({ left: el.scrollWidth }));
  await expect(row).toHaveAttribute("data-more-right", "false");
  await expect(more).toHaveCSS("opacity", "0");
});
