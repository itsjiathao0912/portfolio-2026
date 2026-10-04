import { chromium, OUT, open, ev, save } from "./lib.mjs";
const b = await chromium.launch();
const { c, p, errs } = await open(b, 1440, 900);
await p.waitForSelector("[data-testid=visitor-strip]", { timeout: 90000 });
const el = p.locator("[data-testid=visitor-control]");
await el.scrollIntoViewIfNeeded();
await p.evaluate(() => document.querySelector("[data-testid=visitor-control]").scrollIntoView({ block: "start" }));
await p.evaluate(() => window.scrollBy(0, -90));
await p.waitForTimeout(900);
await p.screenshot({ path: `${OUT}/ui/picker-before-d.jpg`, type: "jpeg", quality: 75 });
const info = await ev(p, () => {
  const t = [...document.querySelectorAll("[data-testid^=tile-]")].filter(e=>!e.dataset.testid.startsWith("tile-count"));
  return { tiles: t.map(e => ({ id: e.dataset.testid, h: Math.round(e.getBoundingClientRect().height), w: Math.round(e.getBoundingClientRect().width), label: e.innerText.replace(/\n/g," | ") })),
   counts: [...document.querySelectorAll("[data-testid^=tile-count]")].map(e => e.dataset.testid + "=" + JSON.stringify(e.textContent)),
   live: document.querySelector("[data-testid=visitor-live]")?.innerText, strip: document.querySelector("[data-testid=visitor-stats-strip]")?.innerText };
});
console.log(JSON.stringify(info, null, 1));
await b.close();
