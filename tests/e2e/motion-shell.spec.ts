import { expect, test } from "@playwright/test";

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
    await expect(page.locator("header")).toHaveAttribute("data-compact", "true");
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

  test("LinkedIn embeds stay unloaded until near the viewport", async ({ page }) => {
    await page.route("https://www.linkedin.com/**", (route) => route.fulfill({ status: 200, contentType: "text/html", body: "<p>post</p>" }));
    await page.goto("/");
    const section = page.getByTestId("section-linkedin");
    await expect(section).toHaveCount(1);
    await expect(page.getByTestId("linkedin-embed")).toHaveCount(0);
    await expect(page.getByTestId("linkedin-placeholder")).toHaveCount(3);
    await section.scrollIntoViewIfNeeded();
    await expect(page.getByTestId("linkedin-embed")).toHaveCount(3);
    const srcs = await page.getByTestId("linkedin-embed").evaluateAll((els) => els.map((e) => e.getAttribute("src")));
    for (const src of srcs) expect(src).toMatch(/^https:\/\/www\.linkedin\.com\/embed\/feed\/update\/urn:li:/);
    await expect(section.getByRole("link", { name: /View on LinkedIn/ })).toHaveCount(3);
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
