import { chromium, save, OUT } from "./lib.mjs";
const b = await chromium.launch(); const c = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await c.newPage();
const res = {};
async function lift(url, sel, label, idx = 0) {
  await p.goto("http://localhost:3003" + url, { waitUntil: "load" }); await p.waitForTimeout(1500);
  const el = p.locator(sel).nth(idx); await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(900);
  const box = await el.boundingBox(); const cx = box.x + box.width / 2, cy = Math.min(box.y + box.height / 2, 800);
  await p.mouse.move(5, 5); await p.waitForTimeout(500);
  const top0 = (await el.boundingBox()).y;
  await p.evaluate((sel_idx) => { const e = document.querySelectorAll(sel_idx[0])[sel_idx[1]]; window.__s = []; const t0 = performance.now(); (function f() { const r = e.getBoundingClientRect(); window.__s.push([performance.now() - t0, r.top]); if (performance.now() - t0 < 1400) requestAnimationFrame(f); })(); }, [sel, idx]);
  await p.mouse.move(cx, cy, { steps: 2 });
  await p.waitForTimeout(1500);
  const s = await p.evaluate(() => window.__s);
  const tops = s.map(x => top0 - x[1]); const peak = Math.max(...tops); const final = tops[tops.length - 1];
  const t90 = s.find(x => top0 - x[1] >= 0.9 * final)?.[0];
  const tPeak = s[tops.indexOf(peak)][0];
  res[label] = { top0, peak: +peak.toFixed(2), final: +final.toFixed(2), overshoot: +(peak - final).toFixed(2), overshootPct: +(((peak - final) / final) * 100).toFixed(1), t90ms: Math.round(t90), tPeakMs: Math.round(tPeak), frames: s.length };
  console.log(label, res[label]);
}
await lift("/", "[data-lift-card]", "home-first-lift");
await lift("/", "[data-testid=linkedin-card]", "home-linkedin", 0);
await lift("/work", "[data-lift-card]", "work-card", 0);
save("lift", res); await b.close();
