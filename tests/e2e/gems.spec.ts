import { devices, expect, test } from "@playwright/test";
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

  test("doodle saves to localStorage only and clears", async ({ page }) => {
    await page.goto("/about");
    const pad = page.getByTestId("doodle-pad");
    await pad.scrollIntoViewIfNeeded();
    const b = (await pad.boundingBox())!;
    await page.mouse.move(b.x + 20, b.y + 20);
    await page.mouse.down();
    await page.mouse.move(b.x + 120, b.y + 80, { steps: 6 });
    await page.mouse.up();
    expect(await page.evaluate(() => localStorage.getItem("thao:doodle:v1"))).toContain("[[");
    await page.reload();
    await expect(page.getByTestId("doodle-clear")).toBeEnabled();
    await page.getByTestId("doodle-clear").click();
    expect(await page.evaluate(() => localStorage.getItem("thao:doodle:v1"))).toBeNull();
  });

  test("about sticker peels by drag and reveals the note", async ({ page }) => {
    await page.goto("/about");
    const sticker = page.getByTestId("peel-button");
    const b = (await sticker.boundingBox())!;
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
    await page.mouse.down();
    await page.mouse.move(b.x + b.width / 2 + 200, b.y - 60, { steps: 10 });
    await page.mouse.up();
    await expect(page.getByTestId("peel-sticker")).toHaveAttribute("data-peeled", "true");
    await expect(page.getByTestId("peel-note").getByRole("link")).toBeVisible();
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

  test("mascot peeks once near the bottom and says hi", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("mascot-sentinel").scrollIntoViewIfNeeded();
    const mascot = page.getByTestId("mascot");
    await expect(mascot).toBeVisible();
    await mascot.getByRole("button").click();
    await expect(page.getByTestId("mascot-bubble")).toBeVisible();
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

    await page.goto("/about");
    await page.getByTestId("peel-button").tap();
    await expect(page.getByTestId("peel-sticker")).toHaveAttribute("data-peeled", "true");

    await page.goto("/missing-page");
    await page.getByTestId("lost-note-auto").tap();
    await expect(page.getByTestId("lost-note-game")).toHaveAttribute("data-found", "true");
  });
});
