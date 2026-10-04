import { createRequire } from "module";
const require = createRequire("/Users/knamnguyen/Documents/0-Programming/duma/package.json");
const { chromium } = require("playwright");
import fs from "fs";
const OUT = "/Users/knamnguyen/Documents/0-Programming/portfolio-2026/process/features/portfolio-site/active/autoresearch-ux-261004_04-10-26/research/R3-shots/motion";
const B="http://localhost:3003"; const res={};
const browser = await chromium.launch();
let ctx = await browser.newContext({viewport:{width:1440,height:900}});
let page = await ctx.newPage();
await page.goto(B+"/",{waitUntil:"load"}); await page.waitForTimeout(1500);

// PERSONA
await page.evaluate(()=>{const e=document.querySelector("[data-testid=persona-control]"); window.scrollTo(0, window.scrollY+e.getBoundingClientRect().top-120)}); await page.waitForTimeout(700);
const order = ()=>page.evaluate(()=>[...document.querySelectorAll("[data-testid=stack-card]")].map(c=>c.dataset.slug+"@"+Math.round(c.getBoundingClientRect().top)));
res.personaBefore = await order();
await page.screenshot({path:OUT+"/persona-before.jpg",type:"jpeg",quality:70});
const track = page.evaluate(()=>new Promise(r=>{const out=[];const t0=performance.now();(function f(){const t=performance.now()-t0; out.push([Math.round(t),[...document.querySelectorAll("[data-testid=stack-card]")].slice(0,3).map(c=>Math.round(c.getBoundingClientRect().top))]); if(t<1400) requestAnimationFrame(f); else r(out)})()}));
await page.click("[data-testid=persona-founder]");
const tr = await track; res.personaAnim = tr.filter((_,i)=>i%6===0).slice(0,10);
await page.waitForTimeout(300);
res.personaAfter = await order();
res.personaNote = await page.evaluate(()=>document.querySelector("[data-testid=persona-note]")?.textContent);
res.tocAfter = await page.evaluate(()=>[...document.querySelectorAll("[data-testid=toc-item]")].map(a=>a.textContent).slice(0,4));
await page.screenshot({path:OUT+"/persona-after.jpg",type:"jpeg",quality:70});
// first card in the viewport visibly moved?
res.personaViewportMoved = await page.evaluate(()=>{const first=document.querySelector("[data-testid=stack-card]"); return first.dataset.slug});
await page.click("[data-testid=persona-all]"); await page.waitForTimeout(800);

// TICKER
await page.evaluate(()=>{const e=document.querySelector("[data-testid=proof-ticker]"); window.scrollTo(0, window.scrollY+e.getBoundingClientRect().top-300)}); await page.waitForTimeout(800);
const tk = async(ms)=>page.evaluate((ms)=>new Promise(r=>{const el=document.querySelector("[data-testid=ticker-item]"); const x0=el.getBoundingClientRect().left; setTimeout(()=>{r(el.getBoundingClientRect().left-x0)},ms)}),ms);
res.tickerDxPer1s = await tk(1000);
const box = await page.locator("[data-testid=proof-ticker]").boundingBox();
await page.mouse.move(box.x+400, box.y+box.height/2); await page.waitForTimeout(600);
res.tickerDxPer1s_hover = await tk(1000);
res.tickerBox = box; res.tickerChips = await page.evaluate(()=>[...document.querySelectorAll("[data-testid=ticker-item]")].slice(0,12).map(b=>b.textContent.replace(/\s+/g," ").slice(0,70)));
await page.mouse.move(5,5);
await page.screenshot({path:OUT+"/ticker.jpg",type:"jpeg",quality:75,clip:{x:0,y:box.y-40,width:1440,height:box.height+80}});

// GLOBE
await page.evaluate(()=>{const e=document.querySelector("canvas")||document.querySelector("[data-testid=globe-card]"); if(e) window.scrollTo(0, window.scrollY+e.getBoundingClientRect().top-200)}); await page.waitForTimeout(1500);
res.canvasCount = await page.evaluate(()=>document.querySelectorAll("canvas").length);
await page.screenshot({path:OUT+"/globe-a.jpg",type:"jpeg",quality:75}); await page.waitForTimeout(2000); await page.screenshot({path:OUT+"/globe-b.jpg",type:"jpeg",quality:75});
// hover list row
const row = page.locator("[data-lift-card]").filter({hasText:"Seoul"}).first();
if (await row.count()) { await row.hover(); await page.waitForTimeout(900); await page.screenshot({path:OUT+"/globe-hover-seoul.jpg",type:"jpeg",quality:75}); }
// fps estimate
res.globeFps = await page.evaluate(()=>new Promise(r=>{let n=0;const t0=performance.now();(function f(){n++; if(performance.now()-t0<2000) requestAnimationFrame(f); else r(n/2)})()}));
// canvas after scroll away
await page.evaluate(()=>window.scrollTo(0,0)); await page.waitForTimeout(1500);
res.canvasAfterAway = await page.evaluate(()=>document.querySelectorAll("canvas").length);
// nav overlap legibility: opacity of text under nav; compute nav bg
res.nav = await page.evaluate(()=>{const n=document.querySelector("header nav, nav[aria-label]"); const p=document.querySelector("header"); const cs=getComputedStyle(n||p); return {bg:cs.backgroundColor, bf:cs.backdropFilter, tag:(n||p)?.tagName}});
await ctx.close();

// MOBILE: chip rail autoscroll, touch lift
ctx = await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
page = await ctx.newPage();
await page.goto(B+"/",{waitUntil:"load"}); await page.waitForTimeout(1500);
const rails=[]; 
for (const slug of ["lumicap","pac","reorc-data-platform","guardline","ledgr"]) {
  await page.evaluate((s)=>{const c=document.getElementById("project-"+s); window.scrollTo(0, window.scrollY+c.getBoundingClientRect().top-200)}, slug); await page.waitForTimeout(900);
  rails.push(await page.evaluate((s)=>{const r=document.querySelector("[data-testid=toc-chips]"); const a=r.querySelector("[aria-current=location]"); const rb=r.getBoundingClientRect(), ab=a?.getBoundingClientRect(); return {slug:s,active:a?.textContent,scrollLeft:Math.round(r.scrollLeft),activeVisible: ab? (ab.left>=rb.left-1 && ab.right<=rb.right+1):null}}, slug));
}
res.mobileRail = rails;
await page.screenshot({path:OUT+"/mobile-rail-ledgr.jpg",type:"jpeg",quality:75,clip:{x:0,y:0,width:390,height:260}});
fs.writeFileSync(OUT+"/m3.json",JSON.stringify(res,null,1));
console.log(JSON.stringify(res,null,1));
await browser.close();
