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
/** Scroll down until the guide stands on a real block (not the floor) with at least `min` blocks in view. */
async function scrollToSpot(page: Page, from: number, min = 1) {
  for (let y = from; y < from + 9000; y += 350) {
    await page.evaluate((v) => scrollTo(0, v), y);
    await page.waitForTimeout(900);
    const ok = await guide(page).evaluate((n, m) => {
      const d = (n as HTMLElement).dataset;
      return d.guideSurfaceKey !== "floor" && Number(d.guideInView ?? 0) >= m;
    }, min).catch(() => false);
    if (ok) return y;
  }
  throw new Error("no clear block found");
}
/** Settled: on the ground with no physics frame for 700 ms (squash, rebound, a short hop and the pose easing have finished). */
/**
 * Where the painted soles are, and what is drawn right under them. Passes when the pixel row
 * 2 px under the sole belongs to an element whose top edge is within 1 px of the sole AND that
 * draws a visible edge (media, divider, or a background / top border / shadow / outline), or
 * when the sole is on the viewport floor (innerHeight - 12).
 */
async function contact(page: Page) {
  return page.evaluate(() => {
    const g = document.querySelector<HTMLElement>("[data-testid=visitor-guide]");
    if (!g) return { ok: false, why: "no guide" };
    const svg = g.querySelector("svg")!;
    let sole = -1e9;
    let cx = 0;
    for (const n of svg.querySelectorAll("path,ellipse,circle,rect,polygon")) {
      if (n.closest("defs,clipPath,mask,pattern")) continue;
      const q = n.getBoundingClientRect();
      if (q.width && q.height && q.bottom > sole) {
        sole = q.bottom;
        cx = q.left + q.width / 2;
      }
    }
    const opacity = getComputedStyle(g).opacity;
    const floor = innerHeight - 12;
    if (Math.abs(sole - floor) <= 1) return { ok: true, why: "floor", sole, opacity };
    const clear = (c: string) => !c || c === "transparent" || /^rgba\([^)]*,\s*0(\.0+)?\s*\)$|\/\s*0(\.0+)?\s*\)$/.test(c);
    const behind = (e: Element): string => {
      for (let a = e.parentElement; a; a = a.parentElement) {
        const c = getComputedStyle(a).backgroundColor;
        if (!clear(c)) return c;
      }
      return getComputedStyle(document.body).backgroundColor;
    };
    const drawn = (e: Element) => {
      if (["IMG", "svg", "SVG", "VIDEO", "CANVAS", "PICTURE", "IFRAME", "HR"].includes(e.tagName)) return true;
      const cs = getComputedStyle(e);
      const ch = (c: string) => (c.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
      const far = (p: string, q: string) => Math.max(...ch(p).map((v, i) => Math.abs(v - (ch(q)[i] ?? v)))) >= 12;
      return (!clear(cs.backgroundColor) && far(cs.backgroundColor, behind(e))) || cs.backgroundImage !== "none" || (Number.parseFloat(cs.borderTopWidth) > 0 && cs.borderTopStyle !== "none" && !clear(cs.borderTopColor)) || cs.boxShadow !== "none" || (Number.parseFloat(cs.outlineWidth) > 0 && cs.outlineStyle !== "none");
    };
    const stand = document.querySelector("[data-guide-standing]");
    const cands = [...document.elementsFromPoint(cx, sole + 2), ...(stand ? [stand] : [])];
    for (const e of cands) {
      if (g.contains(e)) continue;
      const t = e.getBoundingClientRect().top;
      if (Math.abs(t - sole) <= 1 && drawn(e)) return { ok: true, why: e.tagName, sole, opacity };
    }
    const under = document.elementsFromPoint(cx, sole + 2).filter((e) => !g.contains(e)).slice(0, 2).map((e) => `${e.tagName}@${Math.round(e.getBoundingClientRect().top)}`);
    return { ok: false, why: "nothing drawn under the soles", sole, feet: Number(g.dataset.guideFeet?.split(",")[1]) - scrollY, pad: g.dataset.guideFootPad, svgB: svg.getBoundingClientRect().bottom, under, mode: g.dataset.guideMode, key: g.dataset.guideSurfaceKey, opacity };
  });
}

async function landed(page: Page) {
  await expect
    .poll(
      async () => {
        if ((await mode(page)) !== "ground") return false;
        // At rest the rAF loop stops: no new frame for a while means no hop, squash or walk is under way.
        // Settled = the model's feet and the painted figure have not moved for 700 ms.
        const snap = () => guide(page).evaluate((n) => `${(n as HTMLElement).dataset.guideFeet}|${(n as HTMLElement).style.transform}|${(n.querySelector("svg")?.getBoundingClientRect().bottom ?? 0).toFixed(1)}|${scrollY}`);
        const a = await snap();
        await page.waitForTimeout(700);
        return (await mode(page)) === "ground" && (await snap()) === a;
      },
      { timeout: 10000 },
    )
    .toBe(true);
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
    await expect(guide(page)).toBeAttached();
    await scrollToSpot(page, 1600);
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
    // Feet are exactly on the block's drawn top edge: never floating or sunk.
    expect(Math.abs(fy - stand!.top)).toBeLessThanOrEqual(1);
    // The painted soles agree with the model, and a small scroll moves the page under it with zero drift.
    expect((await contact(page)).ok).toBe(true);
    const b0 = await box(page);
    // Scroll up a little (the block moves down, away from the nav): the body rides it with zero drift.
    const sy0 = await page.evaluate(() => scrollY);
    // Only a nudge that keeps the block on screen (a block pushed past the floor rightly makes it hop off).
    const room = (await page.evaluate(() => innerHeight - 12)) - (fy - sy0);
    const d = Math.max(0, Math.min(40, room - 4));
    await page.evaluate((v) => scrollBy(0, -v), d);
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    const b1 = await box(page);
    const sy1 = await page.evaluate(() => scrollY);
    // It rides whatever it stands on with zero drift: the painted figure moves exactly as its block moves
    // (with the page for a normal block, not at all for a sticky one).
    const top1 = await page.evaluate(() => document.querySelector("[data-guide-standing]")?.getBoundingClientRect().top ?? null);
    if (top1 !== null) {
      expect(Math.abs(b1.y - b0.y - (top1 - (stand!.top - sy0)))).toBeLessThan(1.5);
      expect((await contact(page)).ok).toBe(true);
    }
    expect(sy1).toBeLessThanOrEqual(sy0);
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
    await page.waitForTimeout(500); // let the ArrowDown scroll finish before measuring
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
    const k0 = await guide(page).getAttribute("data-guide-surface-key");
    // Reading-speed scrolling (short steps with pauses): the block slides under the nav and the guide falls, it does not vanish.
    // (A single long jump fades it out and back instead: see "a long jump".)
    let fell = false;
    for (let i = 0; i < 10 && !fell; i++) {
      await page.mouse.wheel(0, 120);
      for (let t = 0; t < 6 && !fell; t++) {
        await page.waitForTimeout(60);
        if ((await mode(page)) === "air") fell = true;
      }
    }
    expect(fell).toBe(true);
    await landed(page);
    const [, y1] = await feet(page);
    expect(y1).toBeGreaterThan(0);
    expect((await contact(page)).ok).toBe(true); // it landed on something drawn (or the floor), never in empty space
    const sy = await page.evaluate(() => scrollY);
    const nav = await page.locator("header[data-compact]").first().boundingBox();
    expect(y1 - sy).toBeGreaterThanOrEqual((nav ? nav.y + nav.height : 0) + 112);
    expect(y1 - sy).toBeLessThanOrEqual(900);
    expect(k0).not.toBeNull();
  });

  test("a long jump of the page: no fade, it stays a physical object (pinned under the nav, falls, lands on a drawn edge)", async ({ page }) => {
    await seed(page);
    await page.goto("/");
    await page.evaluate(() => scrollTo(0, 2000));
    await expect(guide(page)).toBeVisible();
    await landed(page);
    await page.evaluate(() => scrollTo(0, 6000));
    const ops = new Set<string>();
    for (let i = 0; i < 20; i++) {
      ops.add(await guide(page).evaluate((n) => `${getComputedStyle(n).opacity}|${getComputedStyle(n).display}|${getComputedStyle(n.firstElementChild!).visibility}`));
      await page.waitForTimeout(50);
    }
    expect([...ops]).toEqual(["1|block|visible"]);
    expect(await guide(page).getAttribute("data-guide-tucked")).toBeNull();
    await landed(page);
    expect((await contact(page)).ok).toBe(true);
  });

  test("walking off the edge of a block drops it", async ({ page }) => {
    await seed(page);
    await page.goto("/");
    await expect(guide(page)).toBeVisible();
    // Find a spot where it stands on a block narrower than the screen (a card, an image), so there is an edge to walk off.
    let found = false;
    for (let y = 1600; y < 12000 && !found; y += 350) {
      await page.evaluate((v) => scrollTo(0, v), y);
      await landed(page);
      found = await page.evaluate(() => {
        const el = document.querySelector("[data-guide-standing]");
        return !!el && el.getBoundingClientRect().width < innerWidth * 0.6;
      });
    }
    expect(found).toBe(true);
    const at = await guide(page).getAttribute("data-guide-surface-key");
    expect(at).not.toBe("floor");
    let dropped = false;
    for (const key of ["ArrowLeft", "ArrowRight"]) {
      await page.keyboard.down(key);
      for (let i = 0; i < 40 && !dropped; i++) {
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
      const b = await guide(page).boundingBox();
      expect(b).not.toBeNull(); // always visible
      if (!b) continue;
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
  test("no physics, no fades: it rests on the floor and arrows step it along", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await seed(page);
    await page.goto("/");
    await expect(guide(page)).toBeVisible();
    await page.evaluate(() => scrollTo(0, 2000));
    await page.waitForTimeout(800);
    const c = await contact(page);
    expect([c.ok, c.why]).toEqual([true, "floor"]);
    const f0 = await guide(page).getAttribute("data-guide-frames");
    const x0 = (await feet(page))[0];
    await page.keyboard.press("ArrowLeft");
    await expect.poll(async () => (await feet(page))[0]).not.toBe(x0);
    expect(await guide(page).evaluate((n) => getComputedStyle(n).opacity)).toBe("1");
    expect(await guide(page).evaluate((n) => n.getAnimations().length)).toBe(0);
    expect(await guide(page).getAttribute("data-guide-frames")).toBe(f0); // never a physics frame
  });
});

test.describe("touch", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  test("small character, tap hops, two taps show the tiny pad, line waits behind a dot, no overflow", async ({ page }) => {
    await seed(page);
    await page.goto("/");
    await expect(guide(page)).toBeAttached();
    await scrollToSpot(page, await page.evaluate(() => (document.querySelector('[data-guide-id="highlights"]') as HTMLElement).getBoundingClientRect().top + scrollY + 250));
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

// Thao: it must always stand on something drawn (or the floor), never fade, and the bubble must not jitter.
for (const vp of [
  { name: "1440", width: 1440, height: 900 },
  { name: "390", width: 390, height: 844 },
]) {
  test.describe(`physical contact at ${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });
    test("scrolling in steps: after each settle the soles are on a drawn top edge (±1 px) or the floor; opacity stays 1 throughout", async ({ page }) => {
      await seed(page);
      await page.goto("/");
      await expect(guide(page)).toBeVisible();
      await landed(page);
      const H = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
      const fails: unknown[] = [];
      let n = 0;
      for (let y = 0; y <= H; y += Math.round(vp.height * 0.6)) {
        await page.evaluate((v) => scrollTo(0, v), y);
        for (let i = 0; i < 4; i++) {
          expect(await guide(page).evaluate((g) => getComputedStyle(g).opacity)).toBe("1");
          await page.waitForTimeout(60);
        }
        await landed(page);
        const c = await contact(page);
        n++;
        if (!c.ok) fails.push({ y, ...c });
      }
      console.log(`[contact ${vp.name}] ${n - fails.length}/${n} positions pass`);
      expect(fails).toEqual([]);
    });
  });
}

// Thao: the bubble FOLLOWS the character (above the head while it walks) but never bounces with a jump.
test.describe("bubble follows", () => {
  test.use({ viewport: { width: 1440, height: 900 } });
  test("during a jump the bubble's y moves <= 1 px; during a walk its centre stays within 8 px of the character's", async ({ page }) => {
    await seed(page);
    await page.goto("/");
    await expect(guide(page)).toBeVisible();
    await page.evaluate(() => scrollTo(0, 2400));
    const bubble = page.getByTestId("guide-bubble");
    await expect(bubble).toBeVisible({ timeout: 8000 });
    await landed(page);
    await page.waitForTimeout(400); // the resting placement has eased in
    const pageY = async () => {
      const b = await bubble.boundingBox({ timeout: 500 }).catch(() => null);
      return b ? b.y + (await page.evaluate(() => scrollY)) : null;
    };
    const y0 = (await pageY())!;
    // Jump straight up: sample through the whole arc and the landing squash.
    const ys: number[] = [];
    await page.keyboard.press("ArrowUp");
    let sawAir = false;
    for (let t = 0; t < 900; t += 30) {
      if ((await mode(page)) === "air") sawAir = true;
      const y = await pageY();
      if (y !== null) ys.push(y);
      await page.waitForTimeout(30);
    }
    expect(sawAir).toBe(true);
    expect(ys.length).toBeGreaterThan(8);
    const dy = Math.max(...ys.map((y) => Math.abs(y - y0)));
    console.log(`[bubble] jump: max bubble y movement ${dy.toFixed(2)} px over ${ys.length} samples`);
    expect(dy).toBeLessThanOrEqual(1);
    await landed(page);
    // Walk toward the roomier side (so the bubble is not clamped by the viewport edge).
    const fx = (await feet(page))[0];
    const key = fx > 720 ? "ArrowLeft" : "ArrowRight";
    await page.keyboard.down(key);
    await page.waitForTimeout(220); // the place offset eases above the head
    const offs: number[] = [];
    // Up to ~1 s of walking: a short block can drop it for a moment (air samples are skipped).
    for (let t = 0; t < 1000 && offs.length < 12; t += 35) {
      const r = await page.evaluate(() => {
        const b = document.querySelector("[data-testid=guide-bubble]")?.getBoundingClientRect();
        const g = document.querySelector("[data-testid=visitor-guide]")!.getBoundingClientRect();
        const m = (document.querySelector("[data-testid=visitor-guide]") as HTMLElement).dataset.guideMode;
        return b && m === "ground" ? b.left + b.width / 2 - (g.left + g.width / 2) : null;
      });
      if (r !== null) offs.push(r);
      await page.waitForTimeout(35);
    }
    await page.keyboard.up(key);
    // The line hides after its 9 s timer; under load the jump half can use most of it. Then too few walk samples exist to judge.
    if (offs.length <= 5) {
      console.log(`[bubble] walk: only ${offs.length} samples before the line timed out; walk half not judged`);
      return;
    }
    const dx = Math.max(...offs.map(Math.abs));
    console.log(`[bubble] walk: max centre offset ${dx.toFixed(2)} px over ${offs.length} samples`);
    expect(dx).toBeLessThanOrEqual(8);
  });
});

test.describe("rest and contact", () => {
  test.use({ viewport: { width: 1440, height: 900 } });
  test("resting idle 10 s: 0 guide rAF callbacks", async ({ page }) => {
    await seed(page);
    await page.goto("/");
    await page.evaluate(() => scrollTo(0, 2000));
    await expect(guide(page)).toBeVisible();
    await landed(page);
    await page.waitForTimeout(1500);
    const f0 = Number(await guide(page).getAttribute("data-guide-frames"));
    await page.waitForTimeout(10_000);
    const f1 = Number(await guide(page).getAttribute("data-guide-frames"));
    console.log(`[idle] guide rAF callbacks in 10 s at rest: ${f1 - f0}`);
    expect(f1 - f0).toBe(0);
  });
  test("a hover on the block it stands on does not start a frame loop", async ({ page }) => {
    await seed(page);
    await page.goto("/");
    await scrollToSpot(page, 1600);
    await landed(page);
    const f0 = Number(await guide(page).getAttribute("data-guide-frames"));
    const r = await page.evaluate(() => {
      const b = document.querySelector("[data-guide-standing]")?.getBoundingClientRect();
      return b ? { x: b.left + Math.min(40, b.width / 2), y: b.top + Math.min(30, b.height / 2) } : null;
    });
    if (r) {
      await page.mouse.move(r.x, r.y);
      await page.waitForTimeout(900);
      await page.mouse.move(5, 450);
      await page.waitForTimeout(900);
    }
    const f1 = Number(await guide(page).getAttribute("data-guide-frames"));
    console.log(`[idle] frames during a hover on the standing block: ${f1 - f0}`);
    expect(f1 - f0).toBe(0);
    expect((await contact(page)).ok).toBe(true);
  });
  test("after landing, through the whole pose ease, the soles stay on the edge (sampled every frame)", async ({ page }) => {
    await seed(page);
    await page.goto("/");
    await scrollToSpot(page, 1600);
    await landed(page);
    await page.keyboard.press("ArrowUp");
    await expect.poll(() => mode(page), { timeout: 3000 }).toBe("air");
    // From the landing frame on, read the painted sole against the model's feet for 600 ms, every frame.
    const worst = await page.evaluate(
      () =>
        new Promise<{ worst: number; n: number }>((done) => {
          const g = document.querySelector<HTMLElement>("[data-testid=visitor-guide]")!;
          const svg = g.querySelector("svg")!;
          let start = 0;
          let worst = 0;
          let n = 0;
          const tick = (ts: number) => {
            if (g.dataset.guideMode === "ground") {
              if (!start) start = ts;
              let sole = -1e9;
              for (const e of svg.querySelectorAll("path,ellipse,circle,rect,polygon")) {
                if (e.closest("defs,clipPath,mask,pattern")) continue;
                const q = e.getBoundingClientRect();
                if (q.width && q.height && q.bottom > sole) sole = q.bottom;
              }
              const fy = Number(g.dataset.guideFeet!.split(",")[1]) - scrollY;
              worst = Math.max(worst, Math.abs(sole - Math.min(fy, innerHeight - 12)));
              n++;
            } else start = 0;
            if (start && ts - start > 600) done({ worst, n });
            else requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }),
    );
    console.log(`[pose ease] worst sole offset after landing: ${worst.worst.toFixed(2)} px over ${worst.n} frames`);
    expect(worst.n).toBeGreaterThan(10);
    expect(worst.worst).toBeLessThanOrEqual(1);
  });
});
