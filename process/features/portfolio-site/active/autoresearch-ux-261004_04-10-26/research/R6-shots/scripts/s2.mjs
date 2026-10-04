// pick a role, measure zoom-to-hero + guide drop-in
import { chromium, OUT, open, ev, save } from "./lib.mjs";
const W = +process.argv[2] || 1440, H = +process.argv[3] || 900, tag = process.argv[4] || "d";
const b = await chromium.launch();
const { c, p, errs } = await open(b, W, H, W < 800);
await p.waitForSelector("[data-testid=visitor-strip]", { timeout: 90000 });
await p.evaluate(() => { const e=document.querySelector("[data-testid=visitor-control]"); window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 100); });
await p.waitForTimeout(800);
await p.evaluate(() => {
  window.__rec = []; const t0 = performance.now();
  const f = () => { const s = document.querySelector("[data-testid^=tile-][aria-checked=true]"); const g = document.querySelector("[data-testid=visitor-guide]");
    const r = s?.getBoundingClientRect(); const st = document.querySelector("[data-testid=visitor-stats-strip]")?.getBoundingClientRect();
    window.__rec.push({ t: Math.round(performance.now() - t0), tile: r && [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], stats: st && Math.round(st.top), guide: g?.dataset.guideFeet, mode: g?.dataset.guideMode, sy: Math.round(scrollY) });
    if (performance.now() - t0 < 4500) requestAnimationFrame(f); };
  requestAnimationFrame(f);
});
const t0 = Date.now();
await p.locator("[data-testid=tile-engineer]").click();
const shots = [60, 200, 400, 800, 1500, 3000];
let last = 0;
for (const s of shots) { await p.waitForTimeout(Math.max(0, s - (Date.now() - t0))); await p.screenshot({ path: `${OUT}/ui/pick-${tag}-${s}.jpg`, type: "jpeg", quality: 70 }); }
await p.waitForTimeout(1500);
const rec = await ev(p, () => window.__rec);
const tiles = rec.filter(r => r.tile);
// settle time of hero tile (last time rect changed)
let lastChange = 0, prev = null; for (const r of tiles) { const k = r.tile.join(); if (k !== prev) { lastChange = r.t; prev = k; } }
const firstGuide = rec.find(r => r.guide);
console.log("frames", rec.length, "tile last change ms", lastChange, "final tile", tiles.at(-1).tile, "first guide t", firstGuide?.t, firstGuide?.guide, "sy end", rec.at(-1).sy);
save(`pick-${tag}`, { rec, lastChange });
console.log("errs", errs);
await b.close();
