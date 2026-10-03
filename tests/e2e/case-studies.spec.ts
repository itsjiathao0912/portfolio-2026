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
