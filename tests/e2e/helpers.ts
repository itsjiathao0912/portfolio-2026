import { expect, type Page } from "@playwright/test";

export const SLUGS = [
  "lumicap",
  "cosap",
  "pac",
  "zalo-game-center",
  "reorc-data-platform",
  "ledgr",
  "cortex-sentinel",
] as const;

/** Collect console errors and uncaught page errors for the lifetime of the page. */
export function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

/** Scroll the whole page in steps so every scroll-reveal fires, then back to top. */
export async function scrollThrough(page: Page) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  const step = Math.max(300, Math.floor((page.viewportSize()?.height ?? 800) * 0.7));
  for (let y = 0; y <= height; y += step) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(60);
  }
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(700);
  await page.evaluate(() => window.scrollTo(0, 0));
}

/** No element may be wider than the viewport (no sideways scrolling). */
export async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
}
