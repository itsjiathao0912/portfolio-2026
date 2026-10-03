import { devices, expect, test } from "./fixtures";
import { trackErrors } from "./helpers";

test.describe.configure({ timeout: 90_000 });

test.describe("fx5 desktop", () => {
  test.use({ viewport: { width: 1440, height: 900 }, timezoneId: "Europe/London" });

  test("ask-me chips, disclosures sheet, name chip, Saigon desk", async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto("/");
    // 1. Ask me
    const chips = page.getByTestId("ask-me-chip");
    await expect(chips).toHaveCount(3);
    await expect(chips.first()).toHaveAttribute("href", /^mailto:.+\?subject=Question/);
    await page.evaluate(() => localStorage.setItem("thao:participate:persona", JSON.stringify("engineer")));
    await page.reload();
    await expect(page.getByTestId("ask-me")).toHaveAttribute("data-role", "engineer");
    // 2. Disclosures
    await page.getByTestId("disclosures-link").scrollIntoViewIfNeeded();
    await page.getByTestId("disclosures-link").click();
    const sheet = page.getByTestId("disclosures-sheet");
    await expect(sheet).toBeVisible();
    await expect(page.getByTestId("disclosure-item")).toHaveCount(5);
    await page.keyboard.press("Escape");
    await expect(sheet).toHaveCount(0);
    await expect(page.getByTestId("disclosures-link")).toBeFocused();
    // 4. Saigon desk
    const trigger = page.getByTestId("saigon-desk-trigger");
    await trigger.click();
    await expect(page.getByTestId("saigon-desk-pop")).toBeVisible();
    await expect(page.getByTestId("desk-timeline")).toBeVisible();
    await expect(page.getByTestId("desk-overlap")).toContainText(/overlap/i);
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("saigon-desk-pop")).toHaveCount(0);
    // keyboard
    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("saigon-desk-pop")).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("say my name chip on /about only", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("say-my-name")).toHaveCount(0);
    await page.goto("/about");
    const chip = page.getByTestId("say-my-name");
    await chip.click();
    await expect(page.getByTestId("say-my-name-pop")).toContainText("zah tow");
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("say-my-name-pop")).toHaveCount(0);
  });
});

test.describe("fx5 mobile", () => {
  const { defaultBrowserType: _d, ...iphone } = devices["iPhone 13"];
  void _d;
  test.use({ ...iphone, viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });

  test("Saigon desk lives inside the menu; disclosures sheet works", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("saigon-desk-trigger").first()).toBeHidden();
    await page.getByTestId("menu-toggle").tap();
    await page.getByTestId("mobile-menu").getByTestId("saigon-desk-trigger").tap();
    await expect(page.getByTestId("saigon-desk-panel")).toBeVisible();
    await page.getByTestId("menu-toggle").tap();
    await page.getByTestId("disclosures-link").scrollIntoViewIfNeeded();
    await page.getByTestId("disclosures-link").tap();
    await expect(page.getByTestId("disclosures-sheet")).toBeVisible();
  });
});
