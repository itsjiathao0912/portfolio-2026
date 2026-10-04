import { createRequire } from "module";
const require = createRequire("/Users/knamnguyen/Documents/0-Programming/duma/package.json");
const { chromium } = require("playwright");
import fs from "fs";
const OUT = new URL("../motion/", import.meta.url).pathname;
const B="http://localhost:3003"; const res={}; const errs=[];
const browser = await chromium.launch();
const ctx = await browser.newContext({viewport:{width:1440,height:900}});
const page = await ctx.newPage();
page.on("pageerror",e=>errs.push(e.message.slice(0,140))); page.on("console",m=>{if(m.type()==="error")errs.push(m.text().slice(0,140))});
await page.goto(B+"/about",{waitUntil:"load"}); await page.waitForTimeout(1500);
await page.evaluate(()=>{const e=document.querySelector("[data-testid=career-rail]"); window.scrollTo(0, window.scrollY+e.getBoundingClientRect().top-40)}); await page.waitForTimeout(900);
await page.screenshot({path:OUT+"/rail-rest.jpg",type:"jpeg",quality:75});
const st = ()=>page.evaluate(()=>{const el=document.querySelector("[aria-label^='Career chapters']"); const r=el.getBoundingClientRect(); const cs=[...el.children].map(c=>{const b=c.getBoundingClientRect(); return b.left+b.width/2}); const mid=r.left+r.width/2; let bi=0,bd=1e9; cs.forEach((c,i)=>{if(Math.abs(c-mid)<bd){bd=Math.abs(c-mid);bi=i}}); const m=document.querySelector("[data-testid=rail-marker]"); return {scrollLeft:Math.round(el.scrollLeft), max:el.scrollWidth-el.clientWidth, nearest:bi, offCenter:Math.round(cs[bi]-mid), n:cs.length, marker:m?Math.round(m.getBoundingClientRect().left):null}});
res.initial = await st();
const box = await page.locator("[aria-label^='Career chapters']").boundingBox();
const y = box.y+60;
async function drag(name, dx, steps, hold=0, release=true){
  const s0 = await st();
  await page.mouse.move(box.x+700,y); await page.mouse.down();
  const samples=[];
  const rec = page.evaluate(()=>new Promise(r=>{const el=document.querySelector("[aria-label^='Career chapters']"); const out=[];const t0=performance.now();(function f(){const t=performance.now()-t0; out.push([Math.round(t),Math.round(el.scrollLeft)]); if(t<1700) requestAnimationFrame(f); else r(out)})()}));
  const t0 = Date.now();
  for (let i=1;i<=steps;i++){ await page.mouse.move(box.x+700+dx*i/steps,y); if(hold) await page.waitForTimeout(hold); }
  const held = await st();
  await page.mouse.up();
  const rr = await rec;
  await page.waitForTimeout(300);
  const s1 = await st();
  // settle ms
  const fin = s1.scrollLeft; let settle=null; for(let i=rr.length-1;i>=0;i--){ if(Math.abs(rr[i][1]-fin)>1){settle=rr[Math.min(i+1,rr.length-1)][0];break;} }
  res[name]={dx, before:s0.scrollLeft, whileHeld:held.scrollLeft, heldDelta:held.scrollLeft-s0.scrollLeft, expectedHeldDelta:-dx, after:s1.scrollLeft, nearest:s1.nearest, offCenterAfter:s1.offCenter, markerAfter:s1.marker, durationMs:Date.now()-t0, settleMsApprox:settle};
  await page.screenshot({path:`${OUT}/rail-${name}.jpg`,type:"jpeg",quality:70,clip:{x:0,y:box.y-80,width:1440,height:box.height+140}});
}
await drag("nudge40", -40, 8, 12);
await drag("drag230", -230, 12, 12);
await drag("drag230back", 230, 12, 12);
await drag("flick", -260, 5, 0);   // fast
await drag("flick2", -420, 6, 0);
// arrows
await page.evaluate(()=>{document.querySelector("[aria-label^='Career chapters']").scrollTo({left:0,behavior:'instant'})}); await page.waitForTimeout(800);
const s0=await st(); try{ await page.click("[data-testid=rail-next]",{timeout:4000})}catch(e){res.arrowErr=String(e).slice(0,100)}; await page.waitForTimeout(900); const s1=await st(); try{await page.click("[data-testid=rail-prev]",{timeout:4000})}catch(e){} await page.waitForTimeout(900); const s2=await st();
res.arrows={before:s0.scrollLeft, next:s1.scrollLeft, prev:s2.scrollLeft, nextNearest:s1.nearest, prevNearest:s2.nearest};
// cards content density
res.cards = await page.evaluate(()=>[...document.querySelectorAll("[data-testid=rail-card]")].map(c=>({h:Math.round(c.getBoundingClientRect().height),w:Math.round(c.getBoundingClientRect().width),text:c.textContent.replace(/\s+/g," ").slice(0,90)})));
// keyboard
await page.focus("[data-testid=rail-card]"); await page.keyboard.press("Tab"); res.tabFocus = await page.evaluate(()=>document.activeElement?.dataset?.testid);
res.errors=errs;
fs.writeFileSync(OUT+"/about.json",JSON.stringify(res,null,1)); console.log(JSON.stringify(res,null,1));
await browser.close();
