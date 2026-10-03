import { devices, expect, test } from "./fixtures";
import { trackErrors } from "./helpers";

test.describe.configure({ timeout: 90_000 });

test.describe("desktop gems", () => {
  test("hero cursor reveal, local time, secret word and sketch mode", async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto("/");
    await expect(page.getByTestId("local-time")).toHaveText(/^It's \d{2}:\d{2} in Saigon$/);
    const host = page.getByTestId("cursor-reveal");
    await expect(host).toHaveAttribute("data-mode", "mask");
    const box = (await host.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await expect(host).toHaveAttribute("data-active", "true");
    await page.mouse.move(5, 5);
    await expect(host).toHaveAttribute("data-active", "false");
    // Exactly one heading stays the real h1 (the casual layer is aria-hidden).
    await expect(page.locator("h1")).toHaveCount(1);

    await page.locator("body").click({ position: { x: 5, y: 400 } });
    await page.keyboard.type("thao");
    await expect(page.locator("html")).toHaveAttribute("data-sketch", "on");
    await expect(page.getByTestId("sketch-toast")).toContainText("Sketch mode on");
    await page.keyboard.type("thao");
    await expect(page.locator("html")).toHaveAttribute("data-sketch", "off");
    expect(errors).toEqual([]);
  });

  test("about note under the portrait links to the first case study", async ({ page }) => {
    await page.goto("/about");
    const link = page.getByTestId("about-note").getByRole("link");
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", "/work/cortex-sentinel");
  });

  test("404 game: drag the note back; links always visible", async ({ page }) => {
    await page.goto("/missing-page");
    await expect(page.getByRole("link", { name: "Go home" })).toBeVisible();
    const note = page.getByTestId("lost-note");
    const board = (await page.getByTestId("lost-note-board").boundingBox())!;
    const n = (await note.boundingBox())!;
    await page.mouse.move(n.x + n.width / 2, n.y + n.height / 2);
    await page.mouse.down();
    await page.mouse.move(board.x + board.width / 2, board.y + board.height / 2, { steps: 12 });
    await page.mouse.up();
    await expect(page.getByTestId("lost-note-game")).toHaveAttribute("data-found", "true");
  });

});

test.describe("touch + reduced motion fallbacks", () => {
  const { defaultBrowserType: _d, ...iphone } = devices["iPhone 13"];
  void _d;
  test.use({ ...iphone, viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });

  test("tap fallbacks work without hover or drag", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("cursor-reveal")).toHaveAttribute("data-mode", "toggle");
    await page.getByTestId("cursor-reveal-toggle").tap();
    await expect(page.getByTestId("cursor-reveal-alt")).toBeVisible();
    // Five taps on the footer name toggle sketch mode (no keyboard on phones).
    const name = page.getByTestId("sketch-hint");
    await name.scrollIntoViewIfNeeded();
    for (let i = 0; i < 5; i++) await name.tap();
    await expect(page.locator("html")).toHaveAttribute("data-sketch", "on");

    await page.goto("/missing-page");
    await page.getByTestId("lost-note-auto").tap();
    await expect(page.getByTestId("lost-note-game")).toHaveAttribute("data-found", "true");
  });
});
