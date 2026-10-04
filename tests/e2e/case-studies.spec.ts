import { mkdirSync } from "node:fs";
import path from "node:path";
import { projectEntries } from "../../content/index.ts";
import { parseProjects } from "../../content/schema.ts";
import { expect, test } from "./fixtures";
import { SLUGS, trackErrors } from "./helpers";

// Real production-build page loads on a busy machine: allow more than 30s.
test.describe.configure({ timeout: 180_000 });

const CONFIDENTIAL = /Chong Wei|WAPS|Taiwan Steel|ARIZE/i;
const SHOTS = path.resolve(
  "process/features/portfolio-site/active/foundation-research_03-10-26/research-private/round5/cases"
);

const parsed = parseProjects(projectEntries);
if (!parsed.ok) throw new Error(parsed.errors.join("; "));
const customCount = (slug: string) =>
  parsed.projects.find((p) => p.slug === slug)!.blocks.filter((b) => b.type === "custom").length;

async function settle(page: import("@playwright/test").Page, slug: string) {
  await page.goto(`/work/${slug}`);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  // Scroll through so lazy blocks mount, then wait for every skeleton to resolve.
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 40));
    }
  });
  await expect(page.getByTestId("custom-block")).toHaveCount(customCount(slug), { timeout: 30_000 });
  await expect(page.getByTestId("custom-block-skeleton")).toHaveCount(0, { timeout: 30_000 });
}

for (const slug of SLUGS) {
  test.describe(slug, () => {
    test.use({ viewport: { width: 1440, height: 900 } });

    test("renders every custom block, no console errors, no confidential names", async ({ page }) => {
      const errors = trackErrors(page);
      await settle(page, slug);
      const blocks = page.getByTestId("custom-block");
      const n = await blocks.count();
      expect(n).toBeGreaterThan(0);
      for (let i = 0; i < n; i++) {
        const box = await blocks.nth(i).boundingBox();
        expect(box?.height ?? 0, `block ${i} has height`).toBeGreaterThan(40);
        expect((await blocks.nth(i).innerText()).trim().length, `block ${i} has text`).toBeGreaterThan(10);
      }
      expect(await page.locator("body").innerText()).not.toMatch(CONFIDENTIAL);
      expect(await page.content()).not.toMatch(CONFIDENTIAL);
      mkdirSync(SHOTS, { recursive: true });
      await page.screenshot({ path: path.join(SHOTS, `${slug}-1440.png`), fullPage: true });
      expect(errors, errors.join("\n")).toEqual([]);
    });

    test("interactive pieces respond to click and keyboard", async ({ page }) => {
      await settle(page, slug);
      const blocks = page.getByTestId("custom-block");
      const n = await blocks.count();
      let responsive = 0;
      for (let i = 0; i < n; i++) {
        const block = blocks.nth(i);
        await block.scrollIntoViewIfNeeded();
        const controls = block.locator(
          "button:not([disabled]), [role=radio], [role=tab], input[type=range], input[type=checkbox], input[type=radio], select, input[type=number], input[type=text]"
        );
        const count = await controls.count();
        if (count === 0) continue; // static piece (figure, chart): nothing to drive
        const snap = () => block.evaluate((el) => el.innerHTML);
        const before = await snap();
        let changed = false;
        // Click up to 6 distinct controls; any state change counts as a response.
        for (let c = 0; c < Math.min(count, 6) && !changed; c++) {
          const el = controls.nth(c);
          if (!(await el.isVisible()) || !(await el.isEnabled())) continue;
          const tag = await el.evaluate((e) => e.tagName.toLowerCase() + ((e as HTMLInputElement).type ?? ""));
          if (tag === "inputrange") {
            // drag: move the slider to its maximum, then to its minimum.
            await el.focus();
            await el.press("End");
            await el.press("Home");
          } else if (tag === "inputnumber" || tag === "inputtext") {
            await el.fill("1");
          } else if (tag === "select") {
            const opts = await el.locator("option").count();
            if (opts > 1) await el.selectOption({ index: opts - 1 });
          } else {
            await el.click({ trial: false, timeout: 5000 }).catch(() => {});
          }
          changed = (await snap()) !== before;
        }
        if (!changed) {
          // keyboard: focus the first control and activate it / arrow through it.
          const first = controls.first();
          await first.focus();
          await page.keyboard.press("Enter");
          await page.keyboard.press("ArrowRight");
          await page.keyboard.press("Space");
          changed = (await snap()) !== before;
        }
        if (changed) responsive++;
        expect(changed, `custom block ${i} (${await block.getAttribute("data-component")}) has controls but did not respond`).toBe(true);
      }
      // Every case has at least one interactive piece after round 5.
      expect(responsive, "at least one interactive piece").toBeGreaterThan(0);
    });

    test("keyboard reaches a control inside the interactive pieces", async ({ page }) => {
      await settle(page, slug);
      const focusable = page.getByTestId("custom-block").locator("button:not([disabled]), [role=radio], [role=tab], input, select").first();
      await focusable.focus();
      await expect(focusable).toBeFocused();
    });

    test("stat values stay on one line and TOC labels stay inside their box", async ({ page }) => {
      await settle(page, slug);
      const stats = await page.evaluate(() =>
        [...document.querySelectorAll('[data-testid="metrics"] dd')].map((d) => ({
          text: d.textContent,
          lines: Math.round(d.getBoundingClientRect().height / parseFloat(getComputedStyle(d).fontSize) / 1.0),
          clipped: d.scrollWidth > d.clientWidth + 1,
        }))
      );
      for (const st of stats) {
        expect(st.lines, `stat "${st.text}" wrapped`).toBeLessThanOrEqual(1);
        expect(st.clipped, `stat "${st.text}" overflows its cell`).toBe(false);
      }
      // The margin TOC hides by design while a full-width block is in view, so
      // park each section heading under the reading line until it shows.
      const toc = page.getByTestId("case-toc");
      const headings = await page.locator("[data-toc-section]").count();
      expect(headings, "case has TOC sections").toBeGreaterThan(0);
      let shown = false;
      for (let i = 0; i < headings && !shown; i++) {
        await page.evaluate((n) => {
          const el = document.querySelectorAll("[data-toc-section]")[n] as HTMLElement;
          window.scrollTo(0, window.scrollY + el.getBoundingClientRect().top - 220);
        }, i);
        await page.waitForTimeout(250);
        shown = (await toc.getAttribute("data-shown")) === "true";
      }
      await expect(toc).toHaveAttribute("data-shown", "true");
      const outside = await page.evaluate(() => {
        const box = document.querySelector('[data-testid="case-toc"]')!.getBoundingClientRect();
        return [...document.querySelectorAll('[data-testid="case-toc"] a')]
          .filter((a) => [...a.querySelectorAll("span")].some((sp) => sp.getBoundingClientRect().right > box.right + 1))
          .map((a) => a.textContent);
      });
      expect(outside, "TOC labels past the TOC box").toEqual([]);
    });

    test("mobile 390: no horizontal scroll, no console errors", async ({ browser }) => {
      const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
      const page = await ctx.newPage();
      await ctx.route(/^https:\/\/([a-z0-9-]+\.)*(linkedin\.com|licdn\.com)\//, (r) =>
        r.fulfill({ status: 200, contentType: "text/html", body: "<!doctype html><title>post</title>" })
      );
      const errors = trackErrors(page);
      await settle(page, slug);
      const over = await page.evaluate(() => ({
        doc: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        body: document.body.scrollWidth - document.documentElement.clientWidth,
      }));
      expect(over.doc, "documentElement overflow").toBeLessThanOrEqual(0);
      expect(over.body, "body overflow").toBeLessThanOrEqual(0);
      mkdirSync(SHOTS, { recursive: true });
      await page.screenshot({ path: path.join(SHOTS, `${slug}-390.png`), fullPage: true });
      expect(errors, errors.join("\n")).toEqual([]);
      await ctx.close();
    });

    test.describe("reduced motion", () => {
      test.use({ reducedMotion: "reduce" });
      test("shows static fallbacks: content visible, no infinite animations in blocks", async ({ page }) => {
        await settle(page, slug);
        const blocks = page.getByTestId("custom-block");
        const n = await blocks.count();
        for (let i = 0; i < n; i++) {
          const infinite = await blocks.nth(i).evaluate((root) => {
            const bad: string[] = [];
            for (const el of [root, ...Array.from(root.querySelectorAll("*"))]) {
              const cs = getComputedStyle(el);
              const names = cs.animationName.split(",").map((s) => s.trim());
              const iters = cs.animationIterationCount.split(",").map((s) => s.trim());
              names.forEach((nm, k) => {
                if (nm !== "none" && iters[k] === "infinite" && !el.className.toString().includes("animate-pulse")) bad.push(`${el.tagName}.${el.className}:${nm}`);
              });
            }
            return bad;
          });
          expect(infinite, `block ${i} runs infinite animation under reduced motion`).toEqual([]);
          expect((await blocks.nth(i).boundingBox())?.height ?? 0).toBeGreaterThan(40);
        }
      });
    });
  });
}

test.describe("iteration 4: stops, morph, walkthrough", () => {
  test("visible timeline stops are the element under the pointer and operable", async ({ page }) => {
    await settle(page, "guardline");
    const stops = page.getByTestId("timeline-stop");
    await stops.first().scrollIntoViewIfNeeded();
    const n = await stops.count();
    expect(n).toBeGreaterThan(2);
    const box = (await stops.nth(n - 2).boundingBox())!;
    const hit = await page.evaluate(([x, y]) => document.elementFromPoint(x, y)?.closest("[data-testid]")?.getAttribute("data-testid"), [box.x + box.width / 2, box.y + box.height / 2]);
    expect(hit).toBe("timeline-stop");
    expect(box.width, "stop hit area width").toBeGreaterThanOrEqual(44);
    expect(box.height, "stop hit area height").toBeGreaterThanOrEqual(44);
    await stops.nth(n - 2).click();
    await expect(page.getByTestId("timeline-card").first()).toContainText(`${n - 1} / ${n}`);
  });

  test("a /work card names its visual for the shared-element morph and navigates to the case", async ({ page }) => {
    await page.goto("/work");
    const card = page.locator('[data-slug="ledgr"]');
    await expect(card.locator("[data-morph-target]")).toHaveCount(1);
    await card.click();
    await expect(page).toHaveURL(/\/work\/ledgr$/);
    await expect(page.getByTestId("case-hero")).toBeVisible();
  });

  test("GoCrypto walkthrough renders the five real screens (desktop pinned, no canvas)", async ({ page }) => {
    await settle(page, "gocrypto");
    const wt = page.getByTestId("phone-walkthrough");
    // Present only once content places the block; skip until then.
    test.skip((await wt.count()) === 0, "PhoneWalkthrough not yet placed in gocrypto content");
    await expect(wt.locator("canvas")).toHaveCount(0);
    await expect(wt.getByTestId("phone-walkthrough-pinned").locator("li")).toHaveCount(5);
  });

  test("GoCrypto desktop walkthrough has visible step buttons that drive the phone, by click and keyboard", async ({ page }) => {
    await settle(page, "gocrypto");
    const pinned = page.getByTestId("phone-walkthrough-pinned");
    await pinned.scrollIntoViewIfNeeded();
    const steps = pinned.getByTestId("walkthrough-step");
    await expect(steps).toHaveCount(5);
    for (const step of await steps.all()) {
      await expect(step).toBeVisible();
      expect((await step.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    }
    const phone = pinned.locator("img").first();
    await steps.nth(3).click();
    await expect(steps.nth(3)).toHaveAttribute("aria-current", "step");
    await expect(phone).toHaveAttribute("src", /screen-4/);
    await steps.nth(3).focus();
    await page.keyboard.press("ArrowDown");
    await expect(steps.nth(4)).toHaveAttribute("aria-current", "step");
    await expect(steps.nth(4)).toBeFocused();
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("ArrowUp");
    await expect(steps.nth(0)).toHaveAttribute("aria-current", "step");
    await expect(phone).toHaveAttribute("src", /screen-1/);
  });

  test("the depth pill scrolls away with the hero instead of stacking under the nav", async ({ page }) => {
    await settle(page, "cortex-sentinel");
    await page.evaluate(() => window.scrollTo(0, 0));
    const pill = page.getByTestId("depth-bar");
    await expect(pill).toBeVisible();
    const pos = await pill.evaluate((el) => getComputedStyle(el).position);
    expect(pos).not.toBe("sticky");
    expect(pos).not.toBe("fixed");
    for (const d of ["skim", "read", "deep"]) expect((await page.getByTestId(`depth-${d}`).boundingBox())!.height).toBeGreaterThanOrEqual(44);
    // Mid-page the margin TOC carries a compact depth control.
    await page.getByTestId("case-study").locator("h2").nth(1).scrollIntoViewIfNeeded();
    const mini = page.getByTestId("toc-depth");
    await expect(mini).toBeVisible();
    await page.getByTestId("toc-depth-skim").click();
    await expect(page.getByTestId("depth-skim")).toHaveAttribute("aria-checked", "true");
  });

  test("stacked-bar segments are not controls: only the 44px legend toggles are", async ({ page }) => {
    await settle(page, "cortex-sentinel");
    const bars = page.locator('[data-testid="dataviz"][data-viz="stacked"]');
    test.skip((await bars.count()) === 0, "no stacked bar on this case");
    const bar = bars.first();
    await bar.scrollIntoViewIfNeeded();
    expect(await bar.locator('[data-testid="segment"]').first().evaluate((el) => el.tagName)).toBe("DIV");
    expect(await bar.locator("[data-testid=segment] button, button[data-testid=segment]").count()).toBe(0);
    for (const t of await bar.getByTestId("legend-toggle").all()) expect((await t.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  });
});
