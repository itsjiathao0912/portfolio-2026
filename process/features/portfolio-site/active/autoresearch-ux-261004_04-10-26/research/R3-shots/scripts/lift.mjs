import { createRequire } from "module";
const require = createRequire("/Users/knamnguyen/Documents/0-Programming/duma/package.json");
const { chromium } = require("playwright");
import fs from "fs";
const OUT = new URL("../motion/", import.meta.url).pathname;
fs.mkdirSync(OUT,{recursive:true});
const B="http://localhost:3003";
const res={};
const browser = await chromium.launch();
const ctx = await browser.newContext({viewport:{width:1440,height:900}});
const page = await ctx.newPage();
const errs=[]; page.on("pageerror",e=>errs.push(e.message.slice(0,140)));
async function sample(idx, dur) {
  return page.evaluate(([idx,dur])=>new Promise(r=>{
    const el=document.querySelectorAll("[data-lift-card]")[idx]; const out=[]; const t0=performance.now();
    (function f(){const t=performance.now()-t0; const b=el.getBoundingClientRect(); const cs=getComputedStyle(el); out.push([Math.round(t),+b.top.toFixed(2),+b.height.toFixed(2),cs.transform]); if(t<dur) requestAnimationFrame(f); else r(out)})();
  }),[idx,dur]);
}
async function hoverTest(name, url, sel, n){ try { await hoverTest_(name,url,sel,n) } catch(e){ res[name]={error:String(e).slice(0,160)} } }
async function hoverTest_(name, url, sel, n){
  await page.goto(B+url,{waitUntil:"load"}); await page.waitForTimeout(1500);
  const lidx = await page.evaluate(([sel,n])=>{const e=document.querySelectorAll(sel)[n]; const l=e.matches("[data-lift-card]")?e:(e.closest("[data-lift-card]")||e.querySelector("[data-lift-card]")); return [...document.querySelectorAll("[data-lift-card]")].indexOf(l)},[sel,n]);
  if (lidx<0) { res[name]={error:"no lift card"}; return; }
  await page.evaluate(i=>{const e=document.querySelectorAll("[data-lift-card]")[i]; const b=e.getBoundingClientRect(); window.scrollBy(0,b.top-140)},lidx); await page.waitForTimeout(900);
  await page.mouse.move(5,5); await page.waitForTimeout(600);
  const b0 = await page.evaluate(i=>{const b=document.querySelectorAll("[data-lift-card]")[i].getBoundingClientRect();return {x:b.x,y:b.y,w:b.width,h:b.height}},lidx);
  const vis = Math.min(b0.h, 900-b0.y);
  const p = sample(lidx, 1600);
  await page.mouse.move(b0.x+b0.w/2, b0.y+Math.min(b0.h/2, 380), {steps:3});
  const s = await p;
  const tops=s.map(x=>x[1]); const min=Math.min(...tops); const last=tops[tops.length-1];
  const rise = b0.y-last, peak=b0.y-min;
  let settle=null; for(let i=s.length-1;i>=0;i--){ if(Math.abs(tops[i]-last)>0.5){settle=s[Math.min(i+1,s.length-1)][0];break;} }
  // time to first reach 90% of final
  let t90=null; for (const x of s){ if (b0.y-x[1] >= 0.9*rise){t90=x[0];break;} }
  res[name]={restH:+b0.h.toFixed(0), restTop:+b0.y.toFixed(1), finalRise:+rise.toFixed(2), peakRise:+peak.toFixed(2), overshootPx:+(peak-rise).toFixed(2), overshootPct:+(((peak-rise)/rise)*100).toFixed(1), settleMs:settle, t90ms:t90, finalTransform:s[s.length-1][3]};
  await page.screenshot({path:`${OUT}/lift-${name}-hover.jpg`,type:"jpeg",quality:70});
  // press
  await page.mouse.down(); await page.waitForTimeout(500);
  const pr = await page.evaluate(i=>{const e=document.querySelectorAll("[data-lift-card]")[i]; return {mode:e.dataset.lift, tr:getComputedStyle(e).transform}},lidx);
  await page.mouse.up(); await page.waitForTimeout(100);
  res[name].press=pr;
  await page.mouse.move(5,5); await page.waitForTimeout(900);
  const back = await page.evaluate(i=>document.querySelectorAll("[data-lift-card]")[i].getBoundingClientRect().top,lidx);
  res[name].returnDelta=+(back-b0.y).toFixed(2);
}
await hoverTest("home-stack-1","/","[data-testid=stack-card]",1);
await hoverTest("home-stack-4","/","[data-testid=stack-card]",4);
await hoverTest("home-highlight","/","[data-testid=section-highlights] [data-lift-card]",1);
await hoverTest("home-globe-row","/","[data-testid=globe-row]",0);
await hoverTest("people-card","/","[data-testid=section-people] [data-lift-card]",0);
await hoverTest("work-card-0","/work","[data-testid=project-card]",0);
await hoverTest("work-card-1","/work","[data-testid=project-card]",1);
await hoverTest("case-next","/work/lumicap","[data-testid=next-project] [data-lift-card]",0);
// non-lift cards presence
await page.goto(B+"/",{waitUntil:"load"}); await page.waitForTimeout(1200);
res.homeLiftCount = await page.evaluate(()=>document.querySelectorAll("[data-lift-card]").length);
res.pageErrors=errs;
fs.writeFileSync(OUT+"/lift.json",JSON.stringify(res,null,1));
console.log(JSON.stringify(res,null,1));
await browser.close();
