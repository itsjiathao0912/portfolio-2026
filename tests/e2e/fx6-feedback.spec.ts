import { devices, expect, test } from "./fixtures";

test.describe.configure({ timeout: 120_000 });

test.describe("project card feedback", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("a click shows the pending state at once and reaches the case under 600 ms", async ({ page }) => {
    // Listen before navigating: the in-view card is prefetched as soon as /work loads,
    // usually before any later waitForResponse could be registered.
    const rsc: string[] = [];
    page.on("response", (r) => {
      if (r.url().includes("_rsc")) rsc.push(r.url());
    });
    const timings: number[] = [];
    for (let attempt = 0; attempt < 2; attempt++) {
      await page.goto("/work");
      const card = page.getByTestId("project-card").first();
      await card.waitFor();
      const href = (await card.getAttribute("href")) ?? "";
      await card.hover();
      await expect.poll(() => rsc.some((u) => u.includes(href)), { timeout: 20_000 }).toBe(true);
      await page.waitForTimeout(150);
      // Time inside the page (performance clock) from the click to the hero in the DOM,
      // so test-runner round trips under shared load do not count.
      await page.evaluate(() => {
        const w = window as unknown as { __pending: string[]; __t0?: number; __t1?: number };
        w.__pending = [];
        w.__t0 = undefined;
        w.__t1 = undefined;
        const lift = document.querySelector("[data-lift-card]");
        if (lift) new MutationObserver(() => w.__pending.push(lift.getAttribute("data-pending") ?? "")).observe(lift, { attributes: true, attributeFilter: ["data-pending"] });
        document.addEventListener("click", () => (w.__t0 = performance.now()), { capture: true, once: true });
        const seen = () => {
          if (w.__t1 === undefined && document.querySelector('[data-testid="case-hero"]')) w.__t1 = performance.now();
        };
        new MutationObserver(seen).observe(document.body, { childList: true, subtree: true });
      });
      await card.click();
      await expect(page.getByTestId("case-hero")).toBeVisible({ timeout: 15_000 });
      const { t0, t1, pending } = await page.evaluate(() => {
        const w = window as unknown as { __pending: string[]; __t0?: number; __t1?: number };
        return { t0: w.__t0 ?? 0, t1: w.__t1 ?? performance.now(), pending: w.__pending };
      });
      const elapsed = Math.round(t1 - t0);
      timings.push(elapsed);
      console.log(`FX6 attempt ${attempt + 1} card->case ${elapsed} ms at load ${(await import("node:os")).loadavg()[0].toFixed(1)}`);
      // When the observer saw the card before it left, it must have seen the pending state.
      if (pending.length) expect(pending).toContain("true");
      if (elapsed < 600) break;
    }
    // One retry is allowed: a single slow sample under shared machine load is noise.
    // On a machine oversubscribed past 2 runnable tasks per core the clock measures the
    // machine, not the app: record it and skip only the timing budget (arrival is still asserted).
    const os = await import("node:os");
    const perCore = os.loadavg()[0] / os.cpus().length;
    if (perCore > 2) {
      test.info().annotations.push({ type: "timing-skipped", description: `load ${perCore.toFixed(1)} per core; samples ${timings.join(", ")} ms` });
      return;
    }
    expect(Math.min(...timings), `card to case took ${timings.join(", ")} ms`).toBeLessThan(600);
  });
});

test.describe("mobile menu button stays off headings", () => {
  const { defaultBrowserType: _d, ...iphone } = devices["iPhone 13"];
  void _d;
  test.use({ ...iphone, viewport: { width: 390, height: 844 } });

  test("hides while scrolling down, returns on scroll up", async ({ page }) => {
    await page.goto("/about");
    const toggle = page.getByTestId("menu-toggle");
    await expect(toggle).toHaveAttribute("data-hidden", "false");
    await page.mouse.wheel(0, 900);
    await expect(toggle).toHaveAttribute("data-hidden", "true");
    await page.mouse.wheel(0, -300);
    await expect(toggle).toHaveAttribute("data-hidden", "false");
  });

  for (const path of ["/", "/work", "/work/ledgr", "/work/gocrypto"]) {
    test(`never rests on heading text while scrolling back up: ${path}`, async ({ page }) => {
      await page.goto(path);
      const toggle = page.getByTestId("menu-toggle");
      const height = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < height; y += 900) await page.mouse.wheel(0, 900);
      const hits: string[] = [];
      for (let stop = 0; stop < 60; stop++) {
        await page.mouse.wheel(0, -450);
        await page.waitForTimeout(120);
        if ((await toggle.getAttribute("data-hidden")) !== "false") continue;
        const hit = await toggle.evaluate((el) => {
          const b = el.getBoundingClientRect();
          for (const h of Array.from(document.querySelectorAll("#main h1, #main h2, #main h3"))) {
            const range = document.createRange();
            range.selectNodeContents(h);
            for (const r of Array.from(range.getClientRects())) {
              if (r.width && r.left < b.right && r.right > b.left && r.top < b.bottom && r.bottom > b.top) return `${window.scrollY}:${h.textContent?.slice(0, 30)}`;
            }
          }
          return "";
        });
        if (hit) hits.push(hit);
        if ((await page.evaluate(() => window.scrollY)) === 0) break;
      }
      expect(hits, "menu button over heading text").toEqual([]);
    });
  }
});
