import { chromium, OUT, open, ev, save } from "./lib.mjs";
const b = await chromium.launch();
const { c, p, errs } = await open(b, 1440, 900);
await p.waitForSelector("[data-testid=visitor-strip]", { timeout: 90000 });
await p.locator("[data-testid=tile-engineer]").click(); await p.waitForTimeout(3500);
await p.mouse.move(5, 5); await p.evaluate(()=>document.activeElement?.blur());
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
const walk = await stop(); save("walk2", walk);
// JUMP
await install(); await p.screenshot({path:`${OUT}/guide/jump-0.jpg`,type:"jpeg",quality:70}); await p.keyboard.press("ArrowUp"); await p.waitForTimeout(250); await p.screenshot({path:`${OUT}/guide/jump-1.jpg`,type:"jpeg",quality:70}); await p.waitForTimeout(1500);
const jump = await stop(); save("jump2", jump);
console.log("errs", errs);
await b.close();
