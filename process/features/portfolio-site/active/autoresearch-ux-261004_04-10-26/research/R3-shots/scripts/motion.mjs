import { createRequire } from "module";
const require = createRequire("/Users/knamnguyen/Documents/0-Programming/duma/package.json");
const { chromium } = require("playwright");
import fs from "fs";
const OUT = "/Users/knamnguyen/Documents/0-Programming/portfolio-2026/process/features/portfolio-site/active/autoresearch-ux-261004_04-10-26/research/R3-shots/motion";
fs.mkdirSync(OUT,{recursive:true});
const B="http://localhost:3003";
const res={};
const browser = await chromium.launch();
const ctx = await browser.newContext({viewport:{width:1440,height:900}});
const page = await ctx.newPage();

// rAF sampler: records [t, rect.top, rect.height, transform, boxShadow] of the element for dur ms
async function sample(sel, idx, dur) {
  return page.evaluate(([sel,idx,dur])=>new Promise(r=>{
    const el=document.querySelectorAll(sel)[idx]; const out=[]; const t0=performance.now();
    (function f(){const t=performance.now()-t0; const b=el.getBoundingClientRect(); const cs=getComputedStyle(el); out.push([Math.round(t),+b.top.toFixed(2),+b.height.toFixed(2),cs.transform,cs.boxShadow]); if(t<dur) requestAnimationFrame(f); else r(out)})();
  }),[sel,idx,dur]);
}
function summarize(s, restTop, restH){
  const tops=s.map(x=>x[1]); const min=Math.min(...tops); const last=tops[tops.length-1];
  let settleT=null; for(let i=s.length-1;i>=0;i--){ if(Math.abs(tops[i]-last)>0.5){settleT=s[Math.min(i+1,s.length-1)][0];break;} }
  const hs=s.map(x=>x[2]); return {restTop:+restTop.toFixed(1), restH:+restH.toFixed(1), peakTopDelta:+(min-restTop).toFixed(1), finalTopDelta:+(last-restTop).toFixed(1), overshootPx:+(last-min).toFixed(1), finalHeightGrow:+(hs[hs.length-1]-restH).toFixed(1), settleMs:settleT, n:s.length};
}
async function hoverTest(name, url, sel, idx, scrollY){
  await page.goto(B+url,{waitUntil:"load"}); await page.waitForTimeout(1200);
  const el = page.locator(sel).nth(idx);
  await el.scrollIntoViewIfNeeded(); await page.waitForTimeout(900);
  // want fully visible: scroll so element top at 160
  await page.evaluate(([sel,idx])=>{const e=document.querySelectorAll(sel)[idx]; const b=e.getBoundingClientRect(); window.scrollBy(0,b.top-170)},[sel,idx]); await page.waitForTimeout(900);
  const b0 = await el.boundingBox();
  // attach lift-card wrapper if needed: measure closest [data-lift-card]
  const liftSel = "[data-lift-card]";
  const info = await page.evaluate(([sel,idx])=>{const e=document.querySelectorAll(sel)[idx]; const l=e.closest("[data-lift-card]")||e.querySelector("[data-lift-card]"); return l?{found:true,cls:l.className.slice(0,60)}:{found:false}},[sel,idx]);
  // find index of lift card for element
  const lidx = await page.evaluate(([sel,idx])=>{const e=document.querySelectorAll(sel)[idx]; const l=e.closest("[data-lift-card]")||e.querySelector("[data-lift-card]"); return [...document.querySelectorAll("[data-lift-card]")].indexOf(l)},[sel,idx]);
  await page.mouse.move(5,5); await page.waitForTimeout(500);
  const rb = await page.evaluate(i=>{const b=document.querySelectorAll("[data-lift-card]")[i].getBoundingClientRect();return [b.top,b.height,b.width]},lidx);
  const p = sample("[data-lift-card]", lidx, 1400);
  await page.mouse.move(b0.x+b0.width/2, b0.y+b0.height/2, {steps:4});
  const s = await p;
  const sum = summarize(s, rb[0], rb[1]);
  // frames at +80 and +600 : screenshot region
  res[name]={...sum, cardW:rb[2], info, tail:s.slice(-1)[0].slice(3)};
  // leave: measure return
  const p2 = sample("[data-lift-card]", lidx, 900); await page.mouse.move(5,5); const s2=await p2;
  res[name].returnFinalDelta=+(s2[s2.length-1][1]-rb[0]).toFixed(2);
  // frame shots
  await page.mouse.move(b0.x+b0.width/2+30, b0.y+b0.height/2+20); await page.waitForTimeout(80);
  await page.screenshot({path:`${OUT}/hover-${name}-80ms.jpg`,type:"jpeg",quality:70});
  await page.waitForTimeout(700);
  await page.screenshot({path:`${OUT}/hover-${name}-700ms.jpg`,type:"jpeg",quality:70});
  await page.mouse.move(5,5);
}
await hoverTest("home-stack","/","[data-testid=stack-card]",1);
await hoverTest("home-highlight","/","[data-lift-card]",1); // placeholder; picks lift card #1
await hoverTest("work-card","/work","[data-testid=project-card]",1);
await hoverTest("work-card-0","/work","[data-testid=project-card]",0);
fs.writeFileSync(OUT+"/hover.json",JSON.stringify(res,null,1));
console.log(JSON.stringify(res,null,1));
await browser.close();
