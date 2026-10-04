import { createRequire } from "module";
const require = createRequire("/Users/knamnguyen/Documents/0-Programming/duma/package.json");
export const { chromium } = require("playwright");
import fs from "fs";
export const OUT = "/Users/knamnguyen/Documents/0-Programming/portfolio-2026/process/features/portfolio-site/active/autoresearch-ux-261004_04-10-26/research/R5-shots";
export const save = (n, o) => fs.writeFileSync(`${OUT}/motion/${n}.json`, JSON.stringify(o, null, 1));
export async function ctx(browser, w = 1440, h = 900, touch = false) {
  const c = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: touch, isMobile: touch, deviceScaleFactor: 1 });
  return c;
}
