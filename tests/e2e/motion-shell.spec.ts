import { expect, test } from "./fixtures";
import { linkedinPosts } from "../../content/site.ts";
import { EMBED_H, EMBED_W } from "../../src/components/site/linkedin-posts.tsx";

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

  test("LinkedIn collapsed embeds pre-load as the section approaches; even, scroll-free cards", async ({ page }) => {
    // Stub LinkedIn: each embed document is exactly as tall as the measured
    // worst case, so "no inner scroll" proves the shared card height honours it.
    const requested: string[] = [];
    await page.route("https://www.linkedin.com/**", (route) => {
      requested.push(route.request().url());
      return route.fulfill({
        status: 200,
        contentType: "text/html",
        body: `<!doctype html><html><body style="margin:0"><div style="height:${EMBED_H}px">post</div></body></html>`,
      });
    });
    await page.goto("/");
    const section = page.getByTestId("section-linkedin");
    await page.waitForTimeout(1500);
    // At the top of the page: no LinkedIn request and no iframe yet.
    expect(requested).toEqual([]);
    await expect(page.getByTestId("linkedin-embed")).toHaveCount(0);
    await expect(page.getByTestId("linkedin-preview")).toHaveCount(linkedinPosts.length);

    // Approach: section still below the fold, but within the 800px preload margin.
    const top = await section.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
    await page.evaluate((y) => window.scrollTo(0, y), top - 900 - 500);
    expect(await section.evaluate((el) => el.getBoundingClientRect().top)).toBeGreaterThan(900);
    await expect.poll(() => requested.length).toBe(linkedinPosts.length);
    for (const url of requested) expect(url).toMatch(/^https:\/\/www\.linkedin\.com\/embed\/feed\/update\/urn:li:[A-Za-z]+:\d+\?collapsed=1$/);
    await expect(page.getByTestId("linkedin-card").and(page.locator('[data-state="loaded"]'))).toHaveCount(linkedinPosts.length);
    await expect(page.getByTestId("linkedin-preview")).toHaveCount(0);
    await expect(section.getByRole("button", { name: /Load post/ })).toHaveCount(0);

    await section.scrollIntoViewIfNeeded();
    // The staggered Reveal rise (24px) must settle before positions are compared.
    const rows = () =>
      page.getByTestId("linkedin-card").evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().top)));
    await expect.poll(async () => new Set((await rows()).slice(0, 2)).size, { timeout: 10_000 }).toBe(1);
    const cards = await page.getByTestId("linkedin-card").evaluateAll((els) =>
      els.map((el) => {
        const r = el.getBoundingClientRect();
        return { w: Math.round(r.width), h: Math.round(r.height) };
      })
    );
    // Every card is the same EMBED_W × EMBED_H, so rows are even.
    for (const c of cards) expect(c).toEqual({ w: EMBED_W, h: EMBED_H });

    // Nothing scrolls inside any embed.
    const frames = page.frames().filter((f) => f.url().includes("linkedin.com/embed/"));
    expect(frames).toHaveLength(linkedinPosts.length);
    for (const frame of frames) {
      const m = await frame.evaluate(() => ({ sh: document.documentElement.scrollHeight, ch: document.documentElement.clientHeight }));
      expect(m.sh).toBeLessThanOrEqual(m.ch);
    }
    for (const iframe of await page.getByTestId("linkedin-embed").all()) await expect(iframe).toHaveAttribute("scrolling", "no");
    await expect(section.getByRole("link", { name: /View on LinkedIn/ })).toHaveCount(linkedinPosts.length);
    await expect(section.getByRole("heading", { level: 2, name: "Notes on LinkedIn" })).toBeVisible();
    await expect(section.getByRole("link", { name: /Follow on LinkedIn/ })).toHaveAttribute("href", "https://www.linkedin.com/in/thaodao0912/");
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
