import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";
import { expectNoHorizontalOverflow, trackErrors } from "./helpers";

// P3: the clay "who are you" picker. The geo seam (`x-e2e-geo`) is added only to
// /api/geo requests, with a unique value per test. Role changes are asserted on
// the UI (chip, note, card order), never on exact shared-DB counts. Every test
// starts from empty localStorage (a fresh browser context), so each one is a
// new visitor.
test.describe.configure({ timeout: 120_000 });

const PRIVACY = "We count roles and countries anonymously. No IP addresses or personal data are stored.";

/** First card per role, from the draft order table in roles.ts. null = default order. */
const FIRST: Record<string, string | null> = {
  recruiter: "cortex-sentinel",
  founder: "ledgr",
  engineer: "reorc-data-platform",
  designer: "ledgr",
  marketer: "gocrypto",
  growth: "reorc-data-platform",
  data: "reorc-data-platform",
  investor: "lumicap",
  student: "cortex-sentinel",
  pm: "pac",
  curious: null,
};
const LABEL: Record<string, string> = {
  recruiter: "Recruiter",
  founder: "Founder",
  engineer: "Engineer",
  designer: "Product designer",
  marketer: "Marketer",
  growth: "Growth",
  data: "Data",
  investor: "Investor",
  student: "Student",
  pm: "Fellow PM",
  curious: "Just curious",
};

async function seamGeo(page: Page, value: string) {
  await page.route("**/api/geo", (route) => route.continue({ headers: { ...route.request().headers(), "x-e2e-geo": value } }));
}
const firstSlug = (page: Page) => page.getByTestId("stack-card").first().getAttribute("data-slug");
const panel = (page: Page) => page.getByTestId("visitor-panel");
const chip = (page: Page) => page.getByTestId("visitor-chip");

test.describe("desktop", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("first visit: dynamic title, location line, privacy note, no console errors", async ({ page }) => {
    const errors = trackErrors(page);
    await seamGeo(page, "VN|Hanoi");
    await page.goto("/");
    await expect(panel(page)).toBeVisible();
    await expect(page.getByTestId("visitor-title")).toHaveText("Hello stranger from Vietnam \u{1F1FB}\u{1F1F3}, who are you?");
    await expect(page.getByTestId("visitor-location")).toHaveText("You're visiting from Hanoi, Vietnam \u{1F1FB}\u{1F1F3}");
    await expect(page.getByTestId("visitor-privacy")).toHaveText(PRIVACY);
    await expect(page.getByRole("radiogroup", { name: "Your role" }).getByRole("radio")).toHaveCount(11);
    expect(errors).toEqual([]);
  });

  test("no city falls back to the country name", async ({ page }) => {
    await seamGeo(page, "NO|");
    await page.goto("/");
    await expect(page.getByTestId("visitor-title")).toHaveText("Hello stranger from Norway \u{1F1F3}\u{1F1F4}, who are you?");
    await expect(page.getByTestId("visitor-location")).toHaveText("You're visiting from Norway \u{1F1F3}\u{1F1F4}");
  });

  test("nothing usable says Hello stranger, and hides the location", async ({ page }) => {
    await seamGeo(page, "XX|");
    await page.goto("/");
    await expect(page.getByTestId("visitor-title")).toHaveText("Hello stranger, who are you?");
    await expect(page.getByTestId("visitor-location")).toHaveCount(0);
  });

  test("geo failure is silent: greeting falls back, panel still works", async ({ page }) => {
    await page.route("**/api/geo", (route) => route.abort());
    await page.goto("/");
    await expect(page.getByTestId("visitor-title")).toHaveText("Hello stranger, who are you?");
    await page.getByTestId("tile-founder").click();
    await expect(chip(page)).toContainText("You: Founder");
  });

  test("a server refusal on /api/visit leaves the UI unchanged", async ({ page }) => {
    await page.route("**/api/visit", (route) => route.fulfill({ status: 503, body: "" }));
    await page.goto("/");
    await page.getByTestId("tile-engineer").click();
    await expect(chip(page)).toContainText("You: Engineer");
    await expect(page.getByTestId("role-note")).toContainText("Engineer view");
  });

  test("every role: chip, note and order match the table", async ({ page }) => {
    await page.goto("/");
    await expect(panel(page)).toBeVisible();
    const defaultFirst = await firstSlug(page);
    for (const [role, first] of Object.entries(FIRST)) {
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      await expect(panel(page)).toBeVisible();
      await page.getByTestId(`tile-${role}`).click();
      await expect(chip(page)).toContainText(`You: ${LABEL[role]}`);
      await expect(page.getByTestId("role-note")).toBeVisible();
      await expect.poll(() => firstSlug(page)).toBe(first ?? defaultFirst);
      await expect(panel(page)).toHaveCount(0);
      // Let the debounced visit POST finish: its reply writes the ordinal back into the store.
      await page.waitForTimeout(900);
    }
  });

  test("reload restores the chip, role and order with no panel flash, and writes nothing again", async ({ page }) => {
    const posts: string[] = [];
    page.on("request", (r) => {
      if (r.method() === "POST" && r.url().endsWith("/api/visit")) posts.push(r.postData() ?? "");
    });
    await page.goto("/");
    await page.getByTestId("tile-founder").click();
    await expect(chip(page)).toContainText("You: Founder");
    await expect.poll(() => posts.length).toBe(1);
    expect(JSON.parse(posts[0]!).role).toBe("founder");

    await page.addInitScript(() => {
      const w = window as unknown as { __panelSeen: boolean };
      w.__panelSeen = false;
      new MutationObserver(() => {
        if (document.querySelector('[data-testid="visitor-panel"]')) w.__panelSeen = true;
      }).observe(document, { childList: true, subtree: true });
    });
    await page.reload();
    await expect(chip(page)).toContainText("You: Founder");
    await expect.poll(() => firstSlug(page)).toBe("ledgr");
    expect(await page.evaluate(() => (window as unknown as { __panelSeen: boolean }).__panelSeen)).toBe(false);
    await page.waitForTimeout(1200);
    expect(posts.length).toBe(1);
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("thao:visitor:v1") ?? "null"));
    expect(stored).toMatchObject({ v: 1, role: "founder", collapsed: true });
    expect(String(stored.visitorId).length).toBeGreaterThanOrEqual(8);
  });

  test("the old Show me first persona migrates once into the new store", async ({ page }) => {
    await page.addInitScript(() => {
      if (!localStorage.getItem("thao:visitor:v1")) localStorage.setItem("thao:participate:persona", JSON.stringify("founder"));
    });
    await page.goto("/");
    await expect(chip(page)).toContainText("You: Founder");
    await expect(panel(page)).toHaveCount(0);
    await expect.poll(() => firstSlug(page)).toBe("ledgr");
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("thao:visitor:v1") ?? "null"));
    expect(stored).toMatchObject({ v: 1, role: "founder", collapsed: true });
    await expect(page.getByText("Show me first")).toHaveCount(0);
  });

  test("keyboard: arrows move focus, Enter picks and keeps focus; the chip opens the modal (focus trap, Escape, focus returns)", async ({ page }) => {
    await page.goto("/");
    await expect(panel(page)).toBeVisible();
    const recruiter = page.getByTestId("tile-recruiter");
    await recruiter.focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByTestId("tile-founder")).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await expect(recruiter).toBeFocused();
    await page.keyboard.press("End");
    await expect(page.getByTestId("tile-curious")).toBeFocused();
    await page.keyboard.press("Home");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("tile-founder")).toHaveAttribute("aria-checked", "true");
    await expect(page.getByTestId("tile-founder")).toBeFocused();
    await expect(chip(page)).toContainText("You: Founder");
    await expect(panel(page)).toHaveCount(0);

    await chip(page).focus();
    await page.keyboard.press("Enter");
    const modal = page.getByTestId("visitor-modal");
    await expect(modal).toBeVisible();
    await expect(page.getByTestId("role-founder")).toBeFocused();
    await expect(page.getByTestId("role-founder")).toHaveAttribute("aria-checked", "true");
    for (let i = 0; i < 16; i++) {
      await page.keyboard.press("Tab");
      // The native modal dialog may hand focus to the browser chrome (body), never to the page behind it.
      expect(await page.evaluate(() => !document.activeElement?.closest('[data-testid="home"], nav, footer'))).toBe(true);
    }
    await page.keyboard.press("Escape");
    await expect(modal).toHaveCount(0);
    await expect(chip(page)).toBeFocused();
  });

  test("tiles switch instantly with one sliding selection; the chip modal changes the role too", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("tile-engineer").click();
    await expect(chip(page)).toContainText("You: Engineer");
    await expect.poll(() => firstSlug(page)).toBe("reorc-data-platform");
    await page.getByTestId("tile-founder").click();
    await expect(chip(page)).toContainText("You: Founder");
    await expect.poll(() => firstSlug(page)).toBe("ledgr");
    await expect(page.getByRole("radiogroup", { name: "Your role" }).locator('[aria-checked="true"]')).toHaveCount(1);
    await expect(panel(page)).toHaveCount(0);
    await expect(page.getByTestId("visitor-strip")).toBeVisible();
    await expect(page.getByTestId("tile-count-founder")).toBeAttached();

    await chip(page).click();
    await expect(page.getByTestId("visitor-modal")).toBeVisible();
    await expect(page.getByRole("radiogroup", { name: "Who are you?" }).getByRole("radio")).toHaveCount(11);
    await page.getByTestId("role-designer").click();
    await expect(page.getByTestId("visitor-modal")).toHaveCount(0);
    await expect(chip(page)).toContainText("You: Product designer");
    await expect(page.getByTestId("tile-designer")).toHaveAttribute("aria-checked", "true");
    await expect(chip(page)).toBeFocused();
    await chip(page).click();
    await page.getByRole("button", { name: "Close" }).click();
    await expect(page.getByTestId("visitor-modal")).toHaveCount(0);
  });

  test("picked: the hero and the two-row grid are one flush block; stats are centred under it", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("tile-founder").click();
    await expect(panel(page)).toHaveCount(0);
    await page.waitForTimeout(1600);
    const g = await page.evaluate(() => {
      const strip = document.querySelector('[data-testid="visitor-strip"]') as HTMLElement;
      const hero = document.querySelector('[data-testid="tile-founder"]') as HTMLElement;
      const rects = [...strip.querySelectorAll('[role="radio"]')].map((n) => n.getBoundingClientRect());
      const others = rects.filter((r) => r.left > hero.getBoundingClientRect().right - 1);
      const rows = new Set(others.map((r) => Math.round(r.top)));
      const h = hero.getBoundingClientRect();
      const bottoms = Math.max(...others.map((r) => r.bottom));
      const tops = Math.min(...others.map((r) => r.top));
      return { count: others.length, rows: rows.size, heroH: h.height, gridH: bottoms - tops, strip: strip.getBoundingClientRect().right - h.left, shadowClass: /(^|\s)shadow-/.test(hero.className) };
    });
    expect(g.count).toBe(10);
    expect(g.rows).toBe(2);
    expect(Math.abs(g.heroH - g.gridH)).toBeLessThanOrEqual(2);
    expect(g.shadowClass).toBe(false);
  });

  test("the picker sits right after the logo band, before the statement", async ({ page }) => {
    await page.goto("/");
    const top = (id: string) => page.getByTestId(id).evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
    const [logos, visitor, statement] = [await top("section-logos"), await top("section-visitor"), await top("section-statement")];
    expect(logos).toBeLessThan(visitor);
    expect(visitor).toBeLessThan(statement);
  });

  test("tap targets are at least 44px", async ({ page }) => {
    await page.goto("/");
    await expect(panel(page)).toBeVisible();
    for (const r of await page.getByRole("radiogroup", { name: "Your role" }).getByRole("radio").all()) {
      const box = await r.boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(44);
      expect(box!.width).toBeGreaterThanOrEqual(44);
    }
    await page.getByTestId("tile-pm").click();
    expect((await chip(page).boundingBox())!.height).toBeGreaterThanOrEqual(44);
  });
});

test.describe("phone", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("390px: panel and chip fit without horizontal overflow", async ({ page }) => {
    await page.goto("/");
    await expect(panel(page)).toBeVisible();
    await expectNoHorizontalOverflow(page);
    const box = await panel(page).boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(390);
    await page.getByTestId("tile-designer").click();
    await expect(chip(page)).toContainText("You: Product designer");
    await expectNoHorizontalOverflow(page);
  });
});

test.describe("reduced motion", () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });

  test("no shared-layout glide: the chip avatar never transforms", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("tile-growth").click();
    await expect(chip(page)).toContainText("You: Growth");
    const moving = await page.evaluate(
      () =>
        new Promise<boolean>((resolve) => {
          const el = document.querySelector('[data-testid="visitor-chip"] span') as HTMLElement | null;
          let n = 0;
          let moved = false;
          const tick = () => {
            // HTML wrappers only: the avatar's own SVG parts carry static pose transforms.
            for (const node of Array.from(el?.querySelectorAll<HTMLElement>("*") ?? []).concat(el ? [el] : [])) {
              if (!(node instanceof HTMLElement)) continue;
              const t = getComputedStyle(node).transform;
              if (t !== "none" && t !== "matrix(1, 0, 0, 1, 0, 0)") moved = true;
            }
            if (++n < 20) requestAnimationFrame(tick);
            else resolve(moved);
          };
          requestAnimationFrame(tick);
        }),
    );
    expect(moving).toBe(false);
  });
});

test.describe("change-role modal layout", () => {
  for (const vp of [{ width: 1440, height: 900 }, { width: 768, height: 1024 }, { width: 390, height: 844 }]) {
    test(`${vp.width}px: every card is the same size and the short last row is centred`, async ({ page }) => {
      await page.setViewportSize(vp);
      await page.goto("/");
      await page.getByTestId("tile-founder").click();
      await page.getByTestId("visitor-chip").click();
      const group = page.getByRole("radiogroup", { name: "Who are you?" });
      await expect(group.getByRole("radio")).toHaveCount(11);
      const boxes = await group.locator(":scope > *").evaluateAll((els) => els.map((e) => e.getBoundingClientRect()).map((r) => ({ x: r.x, y: r.y, w: r.width, right: r.right })));
      const widths = boxes.map((b) => Math.round(b.w));
      expect(Math.max(...widths) - Math.min(...widths)).toBeLessThanOrEqual(1);
      const g = await group.boundingBox();
      const lastY = boxes[boxes.length - 1].y;
      const last = boxes.filter((b) => Math.abs(b.y - lastY) < 2);
      const left = last[0].x - g!.x;
      const right = g!.x + g!.width - last[last.length - 1].right;
      expect(Math.abs(left - right)).toBeLessThanOrEqual(2);
      await page.screenshot({ path: `process/features/portfolio-site/active/autoresearch-ux-261004_04-10-26/research/R8-shots/modal-${vp.width}.png` });
    });
  }
});
