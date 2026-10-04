import { chromium, save, OUT } from "./lib.mjs";
const b = await chromium.launch();
const c = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await c.newPage();
await p.goto("http://localhost:3003/", { waitUntil: "load" }); await p.waitForTimeout(2000);
await p.locator("#work-title").scrollIntoViewIfNeeded(); await p.waitForTimeout(800);
await p.evaluate(() => { window.__f=[]; const t0=performance.now(); (function f(){ const e=document.querySelector("[data-testid=section-work] [data-lift-card]"); const r=e.getBoundingClientRect(); let a=e, op=1; while(a&&a!==document.body){op*=+getComputedStyle(a).opacity;a=a.parentElement} window.__f.push([Math.round(performance.now()-t0),Math.round(r.top),Math.round(r.left),+op.toFixed(2),(e.querySelector("h2,h3")||{}).innerText]); if(performance.now()-t0<1500) requestAnimationFrame(f)})() });
await p.locator("[data-testid=persona-engineer]").click();
const shots=[]; for (const d of [60,120,200,320,600]) { await p.waitForTimeout(d===60?60:d-[60,120,200,320,600][[60,120,200,320,600].indexOf(d)-1]); await p.screenshot({path:`${OUT}/motion/persona-f${d}.jpg`,type:"jpeg",quality:60}); }
await p.waitForTimeout(1000);
const f = await p.evaluate(()=>window.__f); console.log(JSON.stringify(f.filter((_,i)=>i%4===0))); 
console.log("minOpacity", Math.min(...f.map(x=>x[3])), "top range", Math.min(...f.map(x=>x[1])), Math.max(...f.map(x=>x[1])), "titles", [...new Set(f.map(x=>x[4]))]);
await b.close();
