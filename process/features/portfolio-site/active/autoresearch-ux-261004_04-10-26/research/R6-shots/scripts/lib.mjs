import { createRequire } from "module";
const require = createRequire("/Users/knamnguyen/Documents/0-Programming/duma/package.json");
export const { chromium } = require("playwright");
import fs from "fs";
export const OUT = "/Users/knamnguyen/Documents/0-Programming/portfolio-2026/process/features/portfolio-site/active/autoresearch-ux-261004_04-10-26/research/R6-shots";
export const save = (n, o) => fs.writeFileSync(`${OUT}/data/${n}.json`, JSON.stringify(o, null, 1));
export const URL0 = "http://localhost:3003";
export async function open(browser, w, h, touch = false, path = "/") {
  const c = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: touch, isMobile: touch, deviceScaleFactor: 1 });
  const p = await c.newPage();
  const errs = [];
  p.on("console", (m) => { if (m.type() === "error") errs.push(m.text().slice(0, 160)); });
  p.on("pageerror", (e) => errs.push("PAGEERR " + e.message.slice(0, 160)));
  for (let k = 0; k < 3; k++) { try { await p.goto(URL0 + path, { waitUntil: "load", timeout: 90000 }); break; } catch (e) { await p.waitForTimeout(3000); } }
  await p.waitForTimeout(1800);
  return { c, p, errs };
}
export const ev = async (p, f, a) => { for (let k = 0; k < 4; k++) { try { return await p.evaluate(f, a); } catch (e) { await p.waitForTimeout(2000); } } return null; };
