import { createRequire } from "module";
const require = createRequire("/Users/knamnguyen/Documents/0-Programming/duma/package.json");
const { chromium } = require("playwright");
import fs from "fs";
const OUT = new URL("../motion/", import.meta.url).pathname;
const browser = await chromium.launch();
const page = await (await browser.newContext({viewport:{width:1440,height:900}})).newPage();
const res={};
async function t(name,url,sel,n){
  await page.goto("http://localhost:3003"+url,{waitUntil:"load"}); await page.waitForTimeout(3000);
  const loc = page.locator(sel).nth(n);
  await loc.scrollIntoViewIfNeeded(); await page.evaluate(()=>window.scrollBy(0,-120)); await page.waitForTimeout(900);
  const info = await loc.evaluate(e=>{const l=e.matches("[data-lift-card]")?e:(e.closest("[data-lift-card]")||e.querySelector("[data-lift-card]")); if(!l) return null; l.setAttribute("data-probe","1"); const b=l.getBoundingClientRect(); return {top:b.top,h:b.height,x:b.x,w:b.width}});
  if(!info){res[name]={error:"no lift"};return}
  await page.mouse.move(5,5); await page.waitForTimeout(500);
  const rest = await page.evaluate(()=>document.querySelector("[data-probe]").getBoundingClientRect().top);
  const p = page.evaluate(()=>new Promise(r=>{const el=document.querySelector("[data-probe]");const out=[];const t0=performance.now();(function f(){const t=performance.now()-t0;out.push([Math.round(t),el.getBoundingClientRect().top]);if(t<1400)requestAnimationFrame(f);else r(out)})()}));
  await page.mouse.move(info.x+info.w/2, Math.min(info.top+info.h/2, 600), {steps:3});
  const s = await p; const tops=s.map(x=>x[1]); const last=tops[tops.length-1];
  res[name]={restH:Math.round(info.h), rise:+(rest-last).toFixed(2), peak:+(rest-Math.min(...tops)).toFixed(2), frames:s.length, fps:+(s.length/1.4).toFixed(0)};
}
await t("globe-row","/","[data-testid=globe-row]",0);
await t("work-card-1","/work","[data-testid=project-card]",1);
await t("work-card-5","/work","[data-testid=project-card]",5);
console.log(JSON.stringify(res,null,1)); fs.writeFileSync(OUT+"/lift2.json",JSON.stringify(res,null,1));
await browser.close();
