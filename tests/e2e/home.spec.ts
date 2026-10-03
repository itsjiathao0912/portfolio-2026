import { expect, test } from "./fixtures";

// The calm home: hero, logos, statement, ticker, highlights + globe, project stack,
// people, photos, LinkedIn notes (the footer is the one contact block). Busy machine: generous timeout.
test.describe.configure({ timeout: 120_000 });

const ORDER = ["hero", "section-logos", "section-statement", "proof-ticker", "section-highlights", "section-work", "section-people"];

test.describe("desktop", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("sections run in the designed order", async ({ page }) => {
    await page.goto("/");
    const tops = await Promise.all(ORDER.map((id) => page.getByTestId(id).evaluate((el) => el.getBoundingClientRect().top + window.scrollY)));
    expect([...tops].sort((a, b) => a - b)).toEqual(tops);
  });

  test("every project card has a stamp and no card is black", async ({ page }) => {
    await page.goto("/");
    const cards = page.getByTestId("stack-card");
    const n = await cards.count();
    expect(n).toBeGreaterThan(0);
    await expect(page.getByTestId("card-stamp")).toHaveCount(n);
    const dark = await cards.evaluateAll((els) =>
      els.filter((el) => {
        const [r, g, b, a = 1] = getComputedStyle(el.querySelector("article")!).backgroundColor.match(/[\d.]+/g)!.map(Number);
        return a > 0.5 && r + g + b < 150;
      }).length
    );
    expect(dark).toBe(0);
  });

  test("side nav has an emoji per project and a sliding pill; a jump lands close under the nav", async ({ page }) => {
    await page.goto("/");
    const items = page.getByTestId("toc-item");
    await expect(items.first()).toBeVisible();
    expect(await items.count()).toBe(await page.getByTestId("stack-card").count());
    await items.nth(2).click();
    await expect(items.nth(2)).toHaveAttribute("data-active", "true", { timeout: 10_000 });
    await page.waitForTimeout(900);
    const top = await page.getByTestId("stack-card").nth(2).evaluate((el) => el.getBoundingClientRect().top);
    expect(top).toBeGreaterThan(88);
    expect(top).toBeLessThan(170);
  });

  test("persona control reorders the cards and the TOC", async ({ page }) => {
    await page.goto("/");
    const group = page.getByRole("radiogroup", { name: "Show me first:" });
    const before = await page.getByTestId("stack-card").evaluateAll((els) => els.map((e) => e.getAttribute("data-slug")));
    await group.getByRole("radio", { name: /Founder/ }).click();
    await expect(page.getByTestId("persona-note")).toContainText("Founder view");
    await expect.poll(() => page.getByTestId("stack-card").first().getAttribute("data-slug")).toBe("ledgr");
    const after = await page.getByTestId("stack-card").evaluateAll((els) => els.map((e) => e.getAttribute("data-slug")));
    expect(after).not.toEqual(before);
    await expect(page.getByTestId("toc-item").first()).toContainText("Ledgr");
  });

  test("ticker moves, pauses on hover and on keyboard focus, items jump to a card", async ({ page }) => {
    await page.goto("/");
    const ticker = page.getByTestId("proof-ticker");
    await ticker.scrollIntoViewIfNeeded();
    const list = ticker.locator("ul");
    await expect(list).toHaveCSS("animation-play-state", "running");
    await page.mouse.move(700, 450);
    await ticker.hover();
    await expect(list).toHaveCSS("animation-play-state", "paused");
    await page.mouse.move(5, 5);
    await expect(list).toHaveCSS("animation-play-state", "running");
    await page.keyboard.press("Tab");
    await ticker.getByTestId("ticker-item").first().focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    await expect(list).toHaveCSS("animation-play-state", "paused");
  });

  test("persona change keeps cards mounted: no blank stack, glide capped, heading clear of the nav", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("persona-note").waitFor({ state: "detached" }).catch(() => {});
    const control = page.getByRole("radiogroup", { name: "Show me first:" });
    await control.scrollIntoViewIfNeeded();
    await page.evaluate(() => {
      const w = window as unknown as { __seen: { visible: number; maxShift: number; minOpacity: number } };
      w.__seen = { visible: 99, maxShift: 0, minOpacity: 1 };
      const cards = [...document.querySelectorAll<HTMLElement>('[data-testid="stack-card"]')].map((c) => c.parentElement!);
      let n = 0;
      const tick = () => {
        let visible = 0;
        for (const el of cards) {
          const r = el.getBoundingClientRect();
          if (r.bottom > 0 && r.top < innerHeight) visible++;
          const m = getComputedStyle(el).transform;
          if (m !== "none") w.__seen.maxShift = Math.max(w.__seen.maxShift, Math.abs(new DOMMatrixReadOnly(m).m42));
          w.__seen.minOpacity = Math.min(w.__seen.minOpacity, Number(getComputedStyle(el).opacity));
        }
        w.__seen.visible = Math.min(w.__seen.visible, visible);
        if (++n < 40) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    await control.getByRole("radio", { name: /Founder/ }).click();
    await page.waitForTimeout(900);
    const seen = await page.evaluate(() => (window as unknown as { __seen: { visible: number; maxShift: number; minOpacity: number } }).__seen);
    expect(seen.maxShift).toBeLessThanOrEqual(40.5);
    expect(seen.visible).toBeGreaterThan(0);
    expect(seen.minOpacity).toBeGreaterThan(0.3);
    const heading = await page.locator("#work-title").boundingBox();
    expect(heading!.y).toBeGreaterThan(80);
  });

  test("globe card lists corridors, and the page keeps at most one canvas", async ({ page }) => {
    await page.goto("/");
    const card = page.getByTestId("globe-card");
    await card.scrollIntoViewIfNeeded();
    expect(await card.getByTestId("globe-row").count()).toBeGreaterThan(2);
    await card.getByTestId("globe-row").first().hover();
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(600);
    expect(await page.locator("canvas").count()).toBeLessThanOrEqual(1);
  });

  test("people cards show illustrated avatars", async ({ page }) => {
    await page.goto("/");
    const cards = page.getByTestId("people-card");
    await cards.first().scrollIntoViewIfNeeded();
    expect(await cards.count()).toBe(4);
    expect(await page.getByTestId("avatar-stack").count()).toBeGreaterThan(0);
  });

});

test.describe("mobile", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test("the chip rail follows the active project and has a sliding pill", async ({ page }) => {
    await page.goto("/");
    const rail = page.getByTestId("toc-chips");
    await rail.scrollIntoViewIfNeeded();
    const cards = page.getByTestId("stack-card");
    await cards.nth(Math.min(5, (await cards.count()) - 1)).scrollIntoViewIfNeeded();
    await page.waitForTimeout(1200);
    const inside = await rail.evaluate((ul) => {
      const chip = ul.querySelector<HTMLElement>('[aria-current="location"]')!;
      const c = chip.getBoundingClientRect();
      const r = ul.getBoundingClientRect();
      return c.left >= r.left - 1 && c.right <= r.right + 1;
    });
    expect(inside).toBe(true);
    expect(await rail.evaluate((ul) => ul.scrollLeft)).toBeGreaterThan(0);
  });

  test("ticker: a tap pauses it with a visible state, resume restores it; touch targets are 44px", async ({ page }) => {
    await page.goto("/");
    const ticker = page.getByTestId("proof-ticker");
    await ticker.scrollIntoViewIfNeeded();
    const list = ticker.locator("ul");
    await expect(list).toHaveCSS("animation-play-state", "running");
    await ticker.getByTestId("ticker-item").first().tap({ force: true });
    await expect(list).toHaveCSS("animation-play-state", "paused");
    await expect(ticker.getByTestId("ticker-resume")).toBeVisible();
    const item = (await ticker.getByTestId("ticker-item").first().boundingBox())!;
    expect(item.height).toBeGreaterThanOrEqual(43.5);
    await ticker.getByTestId("ticker-resume").tap();
    await expect(list).toHaveCSS("animation-play-state", "running");
  });

  test("no sideways scroll", async ({ page }) => {
    await page.goto("/");
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);
  });
});
