import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";
import { trackErrors } from "./helpers";

// The walking guide: a clay platformer hero standing on the real top edges of home
// content. Every test starts as a fresh visitor; a role is seeded into
// `thao:visitor:v1` so the guide appears without the picker. DRAFT copy is asserted
// by shape only.
test.describe.configure({ timeout: 120_000 });

const KEY = "thao:visitor:v1";
const SECTIONS = ["statement", "highlights", "stack", "people", "linkedin", "contact"];

async function seed(page: Page, extra: Record<string, unknown> = {}, hintSeen = true) {
  await page.addInitScript(
    ([key, extraJson, seen]) => {
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, JSON.stringify({ v: 1, role: "founder", collapsed: true, visitorId: "e2eguide-" + Math.random().toString(36).slice(2, 12), ordinal: null, ...JSON.parse(extraJson as string) }));
      }
      if (seen) localStorage.setItem("thao:guide-hint:v1", "1");
    },
    [KEY, JSON.stringify(extra), hintSeen] as const,
  );
  await page.route("**/api/visit", (r) => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ordinal: 1, counted: false }) }));
}
const guide = (page: Page) => page.getByTestId("visitor-guide");
const present = (page: Page) => page.evaluate(() => [...document.querySelectorAll("[data-guide-walkable]")].map((n) => (n as HTMLElement).dataset.guideId));
const box = async (page: Page) => (await guide(page).boundingBox())!;
const mode = (page: Page) => guide(page).getAttribute("data-guide-mode");
/** The model's feet: [x, y] in page px. */
const feet = async (page: Page) => ((await guide(page).getAttribute("data-guide-feet")) ?? "0,0").split(",").map(Number) as [number, number];
async function landed(page: Page) {
  await expect.poll(() => mode(page), { timeout: 8000 }).toBe("ground");
  await page.waitForTimeout(700); // squash + rebound settle
  await expect.poll(() => mode(page)).toBe("ground");
}

test.describe("desktop", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("absent before a choice; appears after one and always stays (no hide control, a stored guideHidden is ignored)", async ({ page }) => {
    await page.route("**/api/visit", (r) => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ordinal: 1, counted: true }) }));
    await page.goto("/");
    await page.waitForTimeout(1500);
    await expect(guide(page)).toHaveCount(0);
    await page.evaluate((k) => localStorage.setItem(k, JSON.stringify({ v: 1, role: "founder", collapsed: true, guideHidden: true, visitorId: "e2eguide-abcdefgh", ordinal: null })), KEY);
    await page.reload();
    await expect(guide(page)).toBeVisible();
    await page.getByTestId("guide-character").hover();
    await expect(page.getByTestId("guide-hide")).toHaveCount(0);
  });

  test("click-pick, scroll down, arrow right: the guide walks and the page does not scroll", async ({ page }) => {
    await page.route("**/api/visit", (r) => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ordinal: 1, counted: true }) }));
    await page.goto("/");
    await page.getByTestId("tile-engineer").click();
    await expect(guide(page)).toBeVisible();
    await page.mouse.wheel(0, 1800);
    await page.waitForTimeout(900);
    await landed(page);
    const y0 = await page.evaluate(() => window.scrollY);
    const x0 = (await feet(page))[0];
    await page.keyboard.down("ArrowRight");
    await page.waitForTimeout(500);
    await page.keyboard.up("ArrowRight");
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => window.scrollY)).toBe(y0);
    expect((await feet(page))[0]).toBeGreaterThan(x0);
  });

  test("no big buttons: no Walk with me, no Hide character pills", async ({ page }) => {
    await seed(page);
    await page.goto("/");
    await expect(guide(page)).toBeVisible();
    await expect(page.getByTestId("guide-walk-toggle")).toHaveCount(0);
    await expect(page.getByRole("button", { name: /walk with me|hide character/i })).toHaveCount(0);
    const x = await guide(page).locator("button:visible").evaluateAll((n) => n.map((b) => (b as HTMLElement).getBoundingClientRect().width));
    for (const w of x) expect(w).toBeLessThanOrEqual(80);
  });

  test("tags: count = sections present (<= 6), no layout shift, no canvas", async ({ page }) => {
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
    expect(await guide(page).locator("canvas").count()).toBe(0);
  });

  test("it stands exactly on a real block's top edge and stays attached while the page scrolls", async ({ page }) => {
    const errors = trackErrors(page);
    await seed(page);
    await page.goto("/");
    await page.evaluate(() => scrollTo(0, 2000));
    await expect(guide(page)).toBeVisible();
    await landed(page);
    const [, fy] = await feet(page);
    const stand = await page.evaluate(() => {
      const el = document.querySelector("[data-guide-standing]") as HTMLElement | null;
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { top: r.top + scrollY, h: r.height, tag: el.tagName, fs: Number.parseFloat(getComputedStyle(el).fontSize) };
    });
    expect(stand).not.toBeNull();
    // Feet are on the block's top edge (boxes) or at its cap height (text): never floating or sunk.
    expect(fy).toBeGreaterThanOrEqual(stand!.top - 1.5);
    expect(fy).toBeLessThanOrEqual(stand!.top + (["H1", "H2", "H3", "P"].includes(stand!.tag) ? stand!.fs * 0.5 : 1.5));
    // The painted figure agrees with the model, and a small scroll moves the page under it with zero drift.
    const b0 = await box(page);
    expect(Math.abs(b0.y + b0.height - 4 + (await page.evaluate(() => scrollY)) - fy)).toBeLessThan(1.5);
    await page.mouse.wheel(0, 60);
    await page.waitForTimeout(120);
    const b1 = await box(page);
    expect(Math.abs(b1.y - b0.y + (await page.evaluate(() => scrollY)) - 2000)).toBeLessThan(3);
    expect(errors).toEqual([]);
  });

  test("arrows walk, up/W jump (an arc), and the page keeps ArrowDown / Space / PageDown", async ({ page }) => {
    await seed(page);
    await page.goto("/");
    await page.evaluate(() => scrollTo(0, 2000));
    await expect(guide(page)).toBeVisible();
    await landed(page);
    const x0 = (await feet(page))[0];
    await page.keyboard.down("ArrowLeft");
    await page.waitForTimeout(450);
    await page.keyboard.up("ArrowLeft");
    await expect.poll(async () => (await feet(page))[0]).toBeLessThan(x0 - 40);
    await landed(page);
    const [x1, y1] = await feet(page);
    await page.keyboard.press("ArrowUp");
    await expect.poll(() => mode(page), { timeout: 3000 }).toBe("air");
    await landed(page);
    expect(Math.abs((await feet(page))[1] - y1)).toBeLessThan(200); // a hop lands on the same block or one right beside it
    await page.keyboard.press("w");
    await expect.poll(() => mode(page), { timeout: 3000 }).toBe("air");
    await landed(page);
    expect(x1).toBeGreaterThan(0);
    // page keys stay the page's
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    const y0 = await page.evaluate(() => scrollY);
    await page.keyboard.press("ArrowDown");
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(y0);
    const y2 = await page.evaluate(() => scrollY);
    await page.keyboard.press("Space");
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(y2);
  });

  test("keys are ignored in an input and on a focused link", async ({ page }) => {
    await seed(page);
    await page.goto("/");
    await expect(guide(page)).toBeVisible();
    await landed(page);
    await page.evaluate(() => {
      const i = document.createElement("input");
      i.id = "probe-input";
      i.style.cssText = "position:fixed;left:4px;top:300px;width:40px";
      const a = document.createElement("a");
      a.id = "probe-link";
      a.href = "#probed";
      a.textContent = "probe";
      a.style.cssText = "position:fixed;left:60px;top:300px";
      document.body.appendChild(i);
      document.body.appendChild(a);
    });
    const x0 = (await feet(page))[0];
    await page.locator("#probe-input").focus({ timeout: 2000 });
    await page.keyboard.type("   ");
    await page.keyboard.down("ArrowRight");
    await page.waitForTimeout(400);
    await page.keyboard.up("ArrowRight");
    await page.keyboard.press("ArrowUp");
    await page.waitForTimeout(300);
    expect(await mode(page)).toBe("ground");
    expect((await feet(page))[0]).toBe(x0);
    await page.locator("#probe-link").focus();
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("w");
    await page.waitForTimeout(300);
    expect(await mode(page)).toBe("ground");
    expect((await feet(page))[0]).toBe(x0);
    await page.keyboard.press("Enter");
    await expect.poll(() => page.evaluate(() => location.hash)).toBe("#probed");
  });

  test("gravity: when its block scrolls up under the nav it falls to a block below and lands", async ({ page }) => {
    await seed(page);
    await page.goto("/");
    await page.evaluate(() => scrollTo(0, 2000));
    await expect(guide(page)).toBeVisible();
    await landed(page);
    const [, y0] = await feet(page);
    const k0 = await guide(page).getAttribute("data-guide-surface-key");
    await page.mouse.wheel(0, 520);
    await expect.poll(() => mode(page), { timeout: 4000 }).toBe("air");
    await landed(page);
    const [, y1] = await feet(page);
    expect(y1).toBeGreaterThan(y0);
    const sy = await page.evaluate(() => scrollY);
    const nav = await page.locator("header[data-compact]").first().boundingBox();
    expect(y1 - sy).toBeGreaterThanOrEqual((nav ? nav.y + nav.height : 0) + 112);
    expect(y1 - sy).toBeLessThanOrEqual(900);
    expect(k0 === null || k0 !== (await guide(page).getAttribute("data-guide-surface-key"))).toBe(true);
  });

  test("walking off the edge of a block drops it", async ({ page }) => {
    await seed(page);
    await page.goto("/");
    await page.evaluate(() => scrollTo(0, 1300));
    await expect(guide(page)).toBeVisible();
    await landed(page);
    const at = await guide(page).getAttribute("data-guide-surface-key");
    let dropped = false;
    for (const key of ["ArrowLeft", "ArrowRight"]) {
      await page.keyboard.down(key);
      for (let i = 0; i < 20 && !dropped; i++) {
        await page.waitForTimeout(100);
        if ((await mode(page)) === "air") dropped = true;
      }
      await page.keyboard.up(key);
      if (dropped) break;
    }
    expect(dropped).toBe(true);
    await landed(page);
    expect(at).not.toBeNull();
  });

  test("passive: arrives with line 1 in a non-interactive bubble; the page scrolls normally", async ({ page }) => {
    const errors = trackErrors(page);
    await seed(page);
    await page.goto("/");
    await expect(guide(page)).toBeVisible();
    await page.evaluate(() => scrollTo(0, 2400));
    await expect(page.getByTestId("guide-bubble")).toBeVisible({ timeout: 8000 });
    expect(await page.getByTestId("guide-bubble").evaluate((n) => getComputedStyle(n).pointerEvents)).toBe("none");
    const b = await box(page);
    expect(b.y).toBeGreaterThanOrEqual(0);
    expect(b.y + b.height).toBeLessThanOrEqual(900);
    expect(errors).toEqual([]);
  });

  test("a one-time hint shows near the character and fades after first use", async ({ page }) => {
    await seed(page, {}, false);
    await page.goto("/");
    await expect(guide(page)).toBeVisible();
    const hint = page.getByTestId("guide-hint");
    await expect(hint).toContainText("to walk");
    await expect.poll(() => hint.evaluate((n) => getComputedStyle(n).opacity), { timeout: 5000 }).toBe("1");
    await page.keyboard.press("ArrowUp");
    await expect.poll(() => hint.evaluate((n) => getComputedStyle(n).opacity), { timeout: 4000 }).toBe("0");
    await page.reload();
    await page.waitForTimeout(2500);
    expect(await page.getByTestId("guide-hint").evaluate((n) => getComputedStyle(n).opacity)).toBe("0");
  });

  test("never covers the nav pill, at 5 scroll positions", async ({ page }) => {
    await seed(page);
    await page.goto("/");
    await expect(guide(page)).toBeVisible();
    for (const y of [0, 700, 1500, 2600, 3600]) {
      await page.evaluate((v) => scrollTo(0, v), y);
      await page.waitForTimeout(1500);
      const b = await box(page);
      const nav = await page.locator("header[data-compact] nav").first().boundingBox();
      if (nav) expect(b.y >= nav.y + nav.height - 1 || b.y + b.height <= nav.y || b.x + b.width <= nav.x || b.x >= nav.x + nav.width).toBe(true);
    }
  });

  test("rAF idle: no guide frame once it settles, none while the tab is hidden", async ({ page }) => {
    await seed(page);
    await page.goto("/");
    await expect(guide(page)).toBeVisible();
    await landed(page);
    await page.waitForTimeout(600);
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
});

test.describe("reduced motion", () => {
  test.use({ viewport: { width: 1440, height: 900 } });
  test("no physics: opacity fade only, arrows step between visible blocks", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await seed(page);
    await page.goto("/");
    await page.evaluate(() => scrollTo(0, 2000));
    await expect(guide(page)).toBeVisible();
    const tp = await guide(page).evaluate((n) => getComputedStyle(n).transitionProperty);
    expect(tp).not.toContain("transform");
    expect(await guide(page).evaluate((n) => n.getAnimations().filter((a) => (a as CSSTransition).transitionProperty === "transform").length)).toBe(0);
    const f0 = await guide(page).getAttribute("data-guide-frames");
    await page.waitForTimeout(500);
    const y0 = (await feet(page))[1];
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(400);
    if ((await feet(page))[1] === y0) await page.keyboard.press("ArrowLeft"); // already on the last visible block
    await expect.poll(async () => (await feet(page))[1]).not.toBe(y0);
    await expect.poll(() => guide(page).evaluate((n) => getComputedStyle(n).opacity)).toBe("1");
    expect(await guide(page).getAttribute("data-guide-frames")).toBe(f0); // never a physics frame
  });
});

test.describe("touch", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  test("small character, tap hops, two taps show the tiny pad, line waits behind a dot, no overflow", async ({ page }) => {
    await seed(page);
    await page.goto("/");
    await page.evaluate(() => scrollTo(0, (document.querySelector('[data-guide-id="highlights"]') as HTMLElement).getBoundingClientRect().top + scrollY + 250));
    await expect(guide(page)).toBeVisible();
    await landed(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const ch = page.getByTestId("guide-character");
    expect(Number.parseFloat(await ch.evaluate((n) => getComputedStyle(n.parentElement!).scale))).toBeLessThan(1);
    await expect(page.getByTestId("guide-touch-controls")).toHaveCount(0);
    await expect(page.getByTestId("guide-bubble")).toHaveCount(0); // collapsed behind a dot
    await expect(page.getByTestId("guide-dot")).toBeVisible({ timeout: 8000 });
    await page.getByTestId("guide-dot").tap();
    await expect(page.getByTestId("guide-bubble")).toBeVisible();
    await ch.tap();
    await expect.poll(() => mode(page), { timeout: 3000 }).toBe("air");
    await landed(page);
    const cb = (await ch.boundingBox())!;
    await page.touchscreen.tap(cb.x + cb.width / 2, cb.y + cb.height * 0.6);
    await page.touchscreen.tap(cb.x + cb.width / 2, cb.y + cb.height * 0.6); // two quick taps
    await expect(page.getByTestId("guide-touch-controls")).toBeVisible();
    await expect(page.getByRole("button", { name: "Walk left", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Jump", exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
});
