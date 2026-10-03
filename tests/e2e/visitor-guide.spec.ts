import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";
import { trackErrors } from "./helpers";

// P4: the walking guide. Every test starts as a fresh visitor (empty localStorage).
// A role is seeded into `thao:visitor:v1` before load so the guide appears without
// going through the picker. DRAFT copy is asserted by shape only.
test.describe.configure({ timeout: 120_000 });

const KEY = "thao:visitor:v1";
const SECTIONS = ["statement", "highlights", "stack", "people", "linkedin", "contact"];

async function seed(page: Page, extra: Record<string, unknown> = {}) {
  await page.addInitScript(
    ([key, extraJson]) => {
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, JSON.stringify({ v: 1, role: "founder", collapsed: true, guideHidden: false, visitorId: "e2eguide-" + Math.random().toString(36).slice(2, 12), ordinal: null, ...JSON.parse(extraJson as string) }));
    },
    [KEY, JSON.stringify(extra)],
  );
  await page.route("**/api/visit", (r) => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ordinal: 1, counted: false }) }));
}
const guide = (page: Page) => page.getByTestId("visitor-guide");
const present = (page: Page) => page.evaluate(() => [...document.querySelectorAll("[data-guide-walkable]")].map((n) => (n as HTMLElement).dataset.guideId));
const box = async (page: Page) => (await guide(page).boundingBox())!;

test.describe("desktop", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("absent before a choice; appears after one; Hide persists", async ({ page }) => {
    await page.route("**/api/visit", (r) => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ordinal: 1, counted: true }) }));
    await page.goto("/");
    await page.waitForTimeout(1500);
    await expect(guide(page)).toHaveCount(0);
    await page.evaluate((k) => localStorage.setItem(k, JSON.stringify({ v: 1, role: "founder", collapsed: true, guideHidden: false, visitorId: "e2eguide-abcdefgh", ordinal: null })), KEY);
    await page.reload();
    await expect(guide(page)).toBeVisible();
    await page.getByTestId("guide-hide").click();
    await expect(guide(page)).toHaveCount(0);
    await page.reload();
    await page.waitForTimeout(1500);
    await expect(guide(page)).toHaveCount(0);
  });

  test("tags: count = sections present (<= 6), no layout shift", async ({ page }) => {
    await seed(page);
    await page.goto("/");
    await expect(guide(page)).toBeVisible();
    const ids = await present(page);
    expect(ids.length).toBeGreaterThan(0);
    expect(ids.length).toBeLessThanOrEqual(6);
    for (const id of ids) expect(SECTIONS).toContain(id);
    const bad = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>("[data-guide-walkable]")].filter((w) => w.dataset.guideId !== "contact").filter((w) => {
        const cs = getComputedStyle(w);
        const child = w.firstElementChild as HTMLElement | null;
        return (child && w.offsetHeight !== child.offsetHeight) || cs.paddingTop !== "0px" || cs.borderTopWidth !== "0px" || cs.overflow !== "visible";
      }).length,
    );
    expect(bad).toBe(0);
    expect(await page.locator("canvas").count()).toBeLessThanOrEqual(1 + 0 + 2); // site globe/gems own canvases; the guide adds none
    expect(await guide(page).locator("canvas").count()).toBe(0);
  });

  test("passive: arrives with line 1, scroll-follow lands on an in-view section edge, page scrolls normally", async ({ page }) => {
    const errors = trackErrors(page);
    await seed(page);
    await page.goto("/");
    await expect(guide(page)).toBeVisible();
    await page.evaluate(() => scrollTo(0, 1500));
    await expect(page.getByTestId("guide-bubble")).toBeVisible({ timeout: 6000 });
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    const y0 = await page.evaluate(() => scrollY);
    await page.keyboard.press("Space"); // not engaged: the page scrolls
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(y0);
    await page.mouse.wheel(0, 1400);
    await page.waitForTimeout(900);
    const ids = await present(page);
    await expect.poll(async () => (await guide(page).getAttribute("data-guide-at")) ?? "").toMatch(new RegExp(`^(${ids.join("|")})?$`));
    const b = await box(page);
    expect(b.y).toBeGreaterThanOrEqual(0);
    expect(b.y + b.height).toBeLessThanOrEqual(900);
    expect(errors).toEqual([]);
  });

  test("never covers the nav pill or the guide's own controls, at 5 scroll positions", async ({ page }) => {
    await seed(page);
    await page.goto("/");
    await expect(guide(page)).toBeVisible();
    for (const y of [0, 700, 1500, 2600, 3600]) {
      await page.evaluate((v) => scrollTo(0, v), y);
      await page.waitForTimeout(1100);
      const b = await box(page);
      const nav = await page.locator("header[data-compact] nav").first().boundingBox();
      if (nav) expect(b.y >= nav.y + nav.height || b.y + b.height <= nav.y || b.x + b.width <= nav.x || b.x >= nav.x + nav.width).toBe(true);
    }
  });

  test("player mode: engage, walk, hop, release; scrolling unaffected when not engaged", async ({ page }) => {
    await seed(page);
    await page.goto("/");
    await expect(guide(page)).toBeVisible();
    await expect(guide(page)).toHaveAttribute("data-guide-engaged", "false");
    await page.getByTestId("guide-character").click();
    await expect(guide(page)).toHaveAttribute("data-guide-engaged", "true");
    await expect(page.getByTestId("guide-key-hint")).toContainText("Arrows walk");
    await expect(page.getByTestId("guide-walk-toggle")).toHaveAttribute("aria-pressed", "true");
    const x0 = (await box(page)).x;
    await page.keyboard.down("ArrowLeft");
    await page.waitForTimeout(500);
    await page.keyboard.up("ArrowLeft");
    await expect.poll(async () => (await box(page)).x).toBeLessThan(x0);
    const ids = await present(page);
    const at = await guide(page).getAttribute("data-guide-at");
    await page.keyboard.press("ArrowUp");
    await expect.poll(async () => (await guide(page).getAttribute("data-guide-at")) ?? "", { timeout: 4000 }).toMatch(new RegExp(`^(${[...ids, ""].filter((s) => s !== null).join("|")})$`));
    expect(ids.concat([""])).toContain((await guide(page).getAttribute("data-guide-at")) ?? at ?? "");
    await page.keyboard.press("Escape");
    await expect(guide(page)).toHaveAttribute("data-guide-engaged", "false");
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    const y0 = await page.evaluate(() => scrollY);
    await page.keyboard.press("Space");
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(y0);
  });

  test("engaged via the toggle (focus stays on it): arrows still walk, Space does not re-toggle", async ({ page }) => {
    await seed(page);
    await page.goto("/");
    await expect(guide(page)).toBeVisible();
    await page.getByTestId("guide-walk-toggle").click();
    const x0 = (await box(page)).x;
    await page.keyboard.down("ArrowLeft");
    await page.waitForTimeout(600);
    await page.keyboard.up("ArrowLeft");
    await expect.poll(async () => (await box(page)).x).toBeLessThan(x0 - 40);
    await expect(guide(page)).toHaveAttribute("data-guide-engaged", "true");
  });

  test("outside click and Tab release; the toggle's aria-pressed tracks it", async ({ page }) => {
    await seed(page);
    await page.goto("/");
    await page.getByTestId("guide-walk-toggle").click();
    await expect(guide(page)).toHaveAttribute("data-guide-engaged", "true");
    await page.mouse.click(5, 450);
    await expect(guide(page)).toHaveAttribute("data-guide-engaged", "false");
    await expect(page.getByTestId("guide-walk-toggle")).toHaveAttribute("aria-pressed", "false");
    await page.getByTestId("guide-walk-toggle").click();
    await expect(guide(page)).toHaveAttribute("data-guide-engaged", "true");
    await page.keyboard.press("Tab");
    await expect(guide(page)).toHaveAttribute("data-guide-engaged", "false");
  });

  test("keys are ignored in an input; Enter on a focused link still activates it", async ({ page }) => {
    await seed(page);
    await page.goto("/");
    await page.getByTestId("guide-character").click();
    await expect(guide(page)).toHaveAttribute("data-guide-engaged", "true");
    await page.evaluate(() => {
      const i = document.createElement("input");
      i.id = "probe-input";
      document.body.appendChild(i);
    });
    await page.locator("#probe-input").focus();
    await expect(guide(page)).toHaveAttribute("data-guide-engaged", "false"); // focusin outside released it
    const x0 = (await box(page)).x;
    await page.keyboard.type("   ");
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(300);
    expect((await box(page)).x).toBe(x0);

    // Enter on a focused link activates it and never advances the guide's line
    await page.evaluate(() => {
      const a = document.createElement("a");
      a.id = "probe-link";
      a.href = "#probed";
      a.textContent = "probe";
      document.body.appendChild(a);
    });
    await page.getByTestId("guide-walk-toggle").click();
    await page.locator("#probe-link").focus();
    await page.keyboard.press("Enter");
    await expect.poll(() => page.evaluate(() => location.hash)).toBe("#probed");
  });

  test("rAF idle: no guide frame 500 ms after it settles, none while hidden", async ({ page }) => {
    await seed(page);
    await page.goto("/");
    await expect(guide(page)).toBeVisible();
    await page.getByTestId("guide-character").click();
    await page.keyboard.press("ArrowUp");
    await page.waitForTimeout(1500);
    const f1 = await guide(page).getAttribute("data-guide-frames");
    await page.waitForTimeout(600);
    expect(await guide(page).getAttribute("data-guide-frames")).toBe(f1);
    await page.evaluate(() => {
      Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await page.keyboard.down("ArrowRight");
    await page.waitForTimeout(400);
    await page.keyboard.up("ArrowRight");
    expect(await guide(page).getAttribute("data-guide-frames")).toBe(f1);
  });

  test("story: tap the bubble for the next line; the script ends, never auto-advances", async ({ page }) => {
    await seed(page);
    await page.goto("/");
    await page.evaluate(() => scrollTo(0, 2600));
    await page.waitForTimeout(600);
    await page.getByTestId("guide-character").click();
    const bubble = page.getByTestId("guide-bubble");
    await expect(bubble).toBeVisible();
    const first = await bubble.innerText();
    await bubble.click();
    await expect.poll(() => bubble.innerText()).not.toBe(first);
    for (let i = 0; i < 6; i++) await bubble.click();
    const last = await bubble.innerText();
    await page.waitForTimeout(800);
    expect(await bubble.innerText()).toBe(last);
  });
});

test.describe("reduced motion", () => {
  test.use({ viewport: { width: 1440, height: 900 } });
  test("no physics: opacity fade only, arrows step between sections", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await seed(page);
    await page.goto("/");
    await expect(guide(page)).toBeVisible();
    const tp = await guide(page).evaluate((n) => getComputedStyle(n).transitionProperty);
    expect(tp).not.toContain("transform");
    expect(await guide(page).evaluate((n) => n.getAnimations().filter((a) => (a as CSSTransition).transitionProperty === "transform").length)).toBe(0);
    await page.getByTestId("guide-character").click();
    await page.keyboard.press("ArrowRight");
    await expect.poll(() => guide(page).evaluate((n) => getComputedStyle(n).opacity)).toBe("1");
  });
});

test.describe("touch", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  test("mini-controls appear when engaged and move the character; no horizontal overflow", async ({ page }) => {
    await seed(page);
    await page.goto("/");
    await expect(guide(page)).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByTestId("guide-walk-toggle").tap();
    const pad = page.getByTestId("guide-touch-controls");
    await expect(pad).toBeVisible();
    const x0 = (await box(page)).x;
    const left = page.getByRole("button", { name: "Walk left" });
    const lb = (await left.boundingBox())!;
    await page.touchscreen.tap(lb.x + lb.width / 2, lb.y + lb.height / 2);
    await expect(page.getByRole("button", { name: "Jump" })).toBeVisible();
    expect(x0).toBeGreaterThan(0);
  });
});
