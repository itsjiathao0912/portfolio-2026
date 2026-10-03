import { test } from "./fixtures";
import path from "node:path";
import { scrollThrough, SLUGS } from "./helpers";

// Real page loads on a busy machine: allow more than the 30s default.
test.describe.configure({ timeout: 120_000 });

// Full-page screenshots of every page at desktop and phone width, for human
// review. Output: tests/e2e/__screens__/ (gitignored).

const PAGES = ["/", "/about", "/work", ...SLUGS.map((s) => `/work/${s}`), "/missing-page"];
const OUT = path.join(process.cwd(), "tests", "e2e", "__screens__");
const name = (p: string) => (p === "/" ? "home" : p.slice(1).replace(/\//g, "_"));

for (const [label, viewport] of [
  ["desktop", { width: 1440, height: 900 }],
  ["mobile", { width: 390, height: 844 }],
] as const) {
  test.describe(label, () => {
    test.use({ viewport });
    for (const p of PAGES) {
      test(`screenshot ${label} ${p}`, async ({ page }) => {
        await page.goto(p);
        await page.evaluate(() => document.fonts.ready);
        await scrollThrough(page);
        await page.waitForTimeout(300);
        await page.screenshot({ path: path.join(OUT, `${label}-${name(p)}.png`), fullPage: true });
      });
    }
  });
}
