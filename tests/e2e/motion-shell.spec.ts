import { expect, test } from "./fixtures";
import { linkedinPosts } from "../../content/site.ts";
import { CARD_W } from "../../src/components/site/linkedin-data.ts";

// Real page loads on a busy machine: allow more than the 30s default.
test.describe.configure({ timeout: 120_000 });

test.describe("desktop shell motion", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("glass nav stays visible on scroll, compacts, and the indicator follows hover", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator('nav[aria-label="Main"]');
    await expect(nav).toBeVisible();
    // The indicator starts on the active item (home).
    await expect(page.getByTestId("nav-indicator")).toHaveCount(1);
    await nav.getByRole("link", { name: "About" }).hover();
    await expect(nav.getByRole("link", { name: "About" }).getByTestId("nav-indicator")).toHaveCount(1);
    // Scroll far down: still on screen (ROUND2 #6), compact.
    await page.evaluate(() => window.scrollTo(0, 3000));
    await page.waitForTimeout(700);
    await expect(page.locator("header[data-compact]")).toHaveAttribute("data-compact", "true");
    const box = await nav.boundingBox();
    expect(box && box.y + box.height).toBeGreaterThan(0);
    await expect(nav).toBeInViewport();
    // Chromium gets real refraction.
    await expect(page.locator("[data-glass]").first()).toHaveAttribute("data-glass", "refract");
  });

  test("hero text is sharp at first paint and the role word rolls", async ({ page }) => {
    await page.goto("/", { waitUntil: "commit" });
    const h1 = page.locator("#hero-title");
    await h1.waitFor();
    expect(Number(await h1.evaluate((el) => getComputedStyle(el).opacity))).toBe(1);
    await expect(page.getByTestId("rotating-word")).toBeVisible();
  });

  test("logo marquee runs, pauses on hover, and highlight marks are distinct", async ({ page }) => {
    await page.goto("/");
    const track = page.locator(".marquee-track");
    expect(await track.evaluate((el) => getComputedStyle(el).animationName)).toBe("marquee");
    await page.locator(".marquee").hover();
    expect(await track.evaluate((el) => getComputedStyle(el).animationPlayState)).toBe("paused");
    const glyphs = await page.getByTestId("highlight-icon").evaluateAll((els) => els.map((e) => e.getAttribute("data-glyph")));
    expect(new Set(glyphs).size).toBe(glyphs.length);
  });
});

test.describe("desktop home additions", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("portrait is reference scale and every card shows its own picture", async ({ page }) => {
    await page.goto("/");
    const portrait = await page.getByTestId("portrait").first().boundingBox();
    expect(portrait!.width).toBeGreaterThanOrEqual(740);
    const keys = await page.getByTestId("stack-card").evaluateAll((els) =>
      els.map((el) => el.querySelector("img")?.getAttribute("src") ?? el.querySelector("[data-illustration]")?.getAttribute("data-illustration") ?? "none")
    );
    expect(keys).not.toContain("none");
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys.filter((k) => k.startsWith("/projects/")).length).toBeGreaterThanOrEqual(4);
  });

  test("LinkedIn notes are our own cards: counts shown, equal height, one top-aligned row, no LinkedIn requests", async ({ page }) => {
    const requested: string[] = [];
    await page.route(/^https?:\/\/([a-z0-9-]+\.)*(linkedin\.com|licdn\.com)\//, (route) => {
      requested.push(route.request().url());
      return route.abort();
    });
    await page.goto("/");
    const section = page.getByTestId("section-linkedin");
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);
    const cards = section.getByTestId("linkedin-card");
    await expect(cards).toHaveCount(linkedinPosts.length);
    await expect(section.getByTestId("linkedin-embed")).toHaveCount(0);
    await expect(section.getByTestId("linkedin-counts").first()).toContainText(`${(linkedinPosts[0] as { reactions: number }).reactions} reactions`);
    await expect(section.getByTestId("linkedin-counts").first()).toContainText("comments");
    const tops = () => cards.evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().top)));
    await expect.poll(async () => new Set(await tops()).size, { timeout: 10_000 }).toBe(1);
    const sizes = await cards.evaluateAll((els) => els.map((el) => ({ w: Math.round(el.getBoundingClientRect().width), h: Math.round(el.getBoundingClientRect().height), right: Math.round(el.getBoundingClientRect().right) })));
    sizes.forEach((c) => {
      expect(c.w).toBe(CARD_W.desktop);
      expect(c.right).toBeLessThanOrEqual(1440);
      expect(c.h).toBe(sizes[0].h);
    });
    await expect(section.getByRole("link", { name: /View on LinkedIn/ })).toHaveCount(linkedinPosts.length);
    await expect(section.getByRole("heading", { level: 2, name: "Notes on LinkedIn" })).toBeVisible();
    await expect(section.getByRole("link", { name: /Follow on LinkedIn/ })).toHaveAttribute("href", "https://www.linkedin.com/in/thaodao0912/");
    expect(requested).toEqual([]);
    await page.screenshot({ path: test.info().outputPath("linkedin-1440.png") });
  });
});

test.describe("phone LinkedIn carousel", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test("one row with the next post peeking, cards at phone height", async ({ page }) => {
    await page.goto("/");
    const section = page.getByTestId("section-linkedin");
    await section.scrollIntoViewIfNeeded();
    const grid = page.getByTestId("linkedin-grid");
    await expect.poll(() => grid.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true);
    const cards = await page.getByTestId("linkedin-card").evaluateAll((els) =>
      els.map((el) => {
        const r = el.getBoundingClientRect();
        return { left: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height) };
      })
    );
    expect(cards[0].w).toBe(CARD_W.phone);
    expect(cards[1].left).toBeLessThan(390); // peeks
    cards.forEach((c) => expect(c.h).toBe(cards[0].h));
    await page.screenshot({ path: test.info().outputPath("linkedin-390.png") });
  });
});

test.describe("phone cards", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test("each card shows its own visual and a one-line CTA", async ({ page }) => {
    await page.goto("/");
    const cards = page.getByTestId("stack-card");
    const n = await cards.count();
    expect(n).toBeGreaterThan(3);
    const ctaHeights = await page.getByTestId("stack-cta").evaluateAll((els) => els.map((e) => e.getBoundingClientRect().height));
    for (const h of ctaHeights) expect(h).toBeLessThan(64);
    // Visuals differ card to card (mockup screenshots or distinct illustration motifs).
    const keys = await cards.evaluateAll((els) =>
      els.map((el) => el.querySelector("img")?.getAttribute("src") ?? el.querySelector("[data-illustration]")?.getAttribute("data-illustration") ?? "none")
    );
    expect(new Set(keys).size).toBe(keys.length);
  });
});

test.describe("reduced transparency / motion", () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });

  test("marquee is static and rotating word holds still", async ({ page }) => {
    await page.goto("/");
    expect(await page.locator(".marquee-track").evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
    const word = page.getByTestId("rotating-word");
    const first = await word.innerText();
    await page.waitForTimeout(2800);
    expect(await word.innerText()).toBe(first);
  });
});
