import { chromium, OUT, open, ev, save } from "./lib.mjs";
const b = await chromium.launch();
const { c, p, errs } = await open(b, 1440, 900);
await p.waitForSelector("[data-testid=visitor-strip]", { timeout: 90000 });
await p.locator("[data-testid=tile-engineer]").click(); await p.waitForTimeout(3500);
await p.mouse.move(5, 5);
const install = (name) => p.evaluate((name) => { window.__r = []; const t0 = performance.now(); window.__stop = false;
  const f = () => { const g = document.querySelector("[data-testid=visitor-guide]"); if (g) { const [x, y] = g.dataset.guideFeet.split(",").map(Number); const sq = g.querySelector("[style*='scale(']"); const m = sq?.style.transform.match(/scale\(([\d.]+),\s*([\d.]+)\)/);
    const st = document.querySelector("[data-guide-standing]")?.getBoundingClientRect();
    window.__r.push([Math.round(performance.now() - t0), x, y - scrollY, g.dataset.guideMode, m ? +m[1] : 1, m ? +m[2] : 1, Math.round(scrollY), st ? Math.round(st.top) : null, g.dataset.guideSurfaceKey]); }
    if (!window.__stop) requestAnimationFrame(f); }; requestAnimationFrame(f); }, name);
const stop = async () => { await p.evaluate(() => { window.__stop = true; }); return await ev(p, () => window.__r); };
// go to a card section
await ev(p, () => window.scrollTo({ top: 3900, behavior: "instant" })); await p.waitForTimeout(3000);
// WALK
await install();
await p.keyboard.down("ArrowRight"); await p.waitForTimeout(700); await p.keyboard.up("ArrowRight"); await p.waitForTimeout(400);
await p.keyboard.down("ArrowLeft"); await p.waitForTimeout(700); await p.keyboard.up("ArrowLeft"); await p.waitForTimeout(500);
const walk = await stop(); save("walk", walk);
// JUMP
await install(); await p.keyboard.press("ArrowUp"); await p.waitForTimeout(1500);
const jump = await stop(); save("jump", jump);
// FALL: scroll the standing surface away with wheel
await ev(p, () => window.scrollTo({ top: 3900, behavior: "instant" })); await p.waitForTimeout(2500);
await p.screenshot({ path: `${OUT}/guide/fall-0.jpg`, type: "jpeg", quality: 70 });
await install();
await p.mouse.move(700, 500);
for (let i = 0; i < 6; i++) { await p.mouse.wheel(0, 90); await p.waitForTimeout(16); }
let k = 0; const t0 = Date.now();
for (const t of [150, 350, 600, 900, 1300]) { await p.waitForTimeout(Math.max(0, t - (Date.now() - t0))); await p.screenshot({ path: `${OUT}/guide/fall-${++k}.jpg`, type: "jpeg", quality: 70 }); }
await p.waitForTimeout(1500);
const fall = await stop(); save("fall", fall);
// FALL 2: scroll up fast
await install();
for (let i = 0; i < 8; i++) { await p.mouse.wheel(0, -150); await p.waitForTimeout(16); }
await p.waitForTimeout(2500);
const fall2 = await stop(); save("fall2", fall2);
console.log("errs", errs);
await b.close();
