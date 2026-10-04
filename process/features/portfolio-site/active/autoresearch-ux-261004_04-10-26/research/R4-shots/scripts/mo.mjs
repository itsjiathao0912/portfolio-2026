import { chromium, save, OUT } from "./lib.mjs";
const b = await chromium.launch(); const res = {};
const c = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await c.newPage();
// persona glide
await p.goto("http://localhost:3003/", { waitUntil: "load" }); await p.waitForTimeout(2000);
await p.locator("#work-title").scrollIntoViewIfNeeded(); await p.waitForTimeout(800);
const before = await p.evaluate(() => window.scrollY);
await p.evaluate(() => { window.__f=[]; const t0=performance.now(); (function f(){ const cs=[...document.querySelectorAll("[data-testid=section-work] [data-lift-card]")].slice(0,2).map(e=>{const r=e.getBoundingClientRect();const o=getComputedStyle(e.parentElement).opacity;return [Math.round(r.top),Math.round(r.left),+getComputedStyle(e).opacity,+o]}); window.__f.push([Math.round(performance.now()-t0),window.scrollY,cs, document.querySelector("#work-title").getBoundingClientRect().top|0]); if(performance.now()-t0<1500) requestAnimationFrame(f)})() });
await p.locator("[data-testid=persona-founder]").click();
await p.waitForTimeout(1700);
const f = await p.evaluate(() => window.__f);
const minOp = Math.min(...f.map(x=>Math.min(...x[2].flatMap(c=>[c[2],c[3]]))));
const xs = f.map(x=>x[2][0]?.[1]);
res.persona = { scrollBefore: before, scrollAfter: f.at(-1)[1], titleTopFinal: f.at(-1)[3], minOpacity: minOp, firstCardLeftRange:[Math.min(...xs),Math.max(...xs)], firstCardTopRange:[Math.min(...f.map(x=>x[2][0]?.[0])),Math.max(...f.map(x=>x[2][0]?.[0]))], sample: f.filter((_,i)=>i%8===0).map(x=>[x[0],x[1],x[2][0]]) };
await p.screenshot({ path: `${OUT}/motion/persona-after.png` });
console.log(JSON.stringify(res.persona));
// nav glass
res.nav = await p.evaluate(() => { const n=document.querySelector("header nav, nav[aria-label=Primary], .glass"); const g=document.querySelector(".glass"); const cs=getComputedStyle(g); return { bg: cs.backgroundColor, bf: cs.backdropFilter.slice(0,80), cls:g.className.slice(0,80)} });
console.log(res.nav);
// work page
await p.goto("http://localhost:3003/work", { waitUntil: "load" }); await p.waitForTimeout(1500);
const h1 = await p.evaluate(() => { const h=document.querySelector("h1"); const r=h.getBoundingClientRect(); return {t:h.innerText, w:r.width, h:r.height, fs:getComputedStyle(h).fontSize}; });
const cards = await p.evaluate(() => [...document.querySelectorAll("[data-testid=work-grid] > li")].map(li=>{ const r=li.getBoundingClientRect(); const lc=li.querySelector("[data-lift-card]"); const lr=lc.getBoundingClientRect(); const kids=[...lc.querySelectorAll("*")]; const imgs=[...lc.querySelectorAll("img,svg,video,canvas")].filter(e=>e.getBoundingClientRect().height>60); const bottomContent=Math.max(...imgs.map(e=>e.getBoundingClientRect().bottom)); const text=lc.querySelector("h2,h3"); const tb=text.getBoundingClientRect().bottom; const first=Math.min(...imgs.map(e=>e.getBoundingClientRect().top)); return { name:text.innerText, h:Math.round(lr.height), gapTextToVisual:Math.round(first-tb), visualBottomToCardBottom:Math.round(lr.bottom-bottomContent)} }));
res.work = { h1, cards };
console.log(JSON.stringify(res.work));
// filter thumb
await p.locator("[data-testid=filter-chips]").scrollIntoViewIfNeeded();
await p.evaluate(() => { window.__t=[]; const t0=performance.now(); (function f(){ const th=document.querySelector("[data-testid=filter-thumb]"); const li=[...document.querySelectorAll("[data-testid=work-grid] > li")]; window.__t.push([Math.round(performance.now()-t0), th?Math.round(th.getBoundingClientRect().left):null, li.length, li[0]?Math.round(li[0].getBoundingClientRect().left):null, li[0]?+getComputedStyle(li[0]).opacity:null, li[1]?Math.round(li[1].getBoundingClientRect().left):null]); if(performance.now()-t0<1200) requestAnimationFrame(f)})() });
await p.locator("[data-testid=filter-chip]").nth(3).click(); await p.waitForTimeout(1300);
const t = await p.evaluate(()=>window.__t);
res.filter = { thumbLeftRange:[Math.min(...t.map(x=>x[1])),Math.max(...t.map(x=>x[1]))], distinctThumbPositions:new Set(t.map(x=>x[1])).size, liCounts:[...new Set(t.map(x=>x[2]))], card1LeftDistinct:[...new Set(t.map(x=>x[5]))].length, card0Opacity:[Math.min(...t.map(x=>x[4]??1)),Math.max(...t.map(x=>x[4]??1))], sample:t.filter((_,i)=>i%10===0) };
console.log(JSON.stringify(res.filter));
await p.screenshot({ path: `${OUT}/motion/work-filter.png` });
save("motion", res); await b.close();
