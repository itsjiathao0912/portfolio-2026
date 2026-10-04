import { createRequire } from "module";
const require = createRequire("/Users/knamnguyen/Documents/0-Programming/duma/package.json");
const { chromium } = require("playwright");
import fs from "fs";
const OUT = new URL("../motion/", import.meta.url).pathname;
const B="http://localhost:3003"; const res={};
const browser = await chromium.launch();
const ctx = await browser.newContext({viewport:{width:1440,height:900}, deviceScaleFactor:2});
const page = await ctx.newPage();
await page.goto(B+"/",{waitUntil:"load"}); await page.waitForTimeout(1500);
res.glass = await page.evaluate(()=>{const g=document.querySelector("header .glass, header [class*=glass]"); if(!g) return null; const cs=getComputedStyle(g); return {bg:cs.backgroundColor, bf:cs.backdropFilter, wbf:cs.webkitBackdropFilter, h:g.getBoundingClientRect().height, w:g.getBoundingClientRect().width, radius:cs.borderTopLeftRadius, shadow:cs.boxShadow.slice(0,100)}});
const spots = [["home","/", "#work-title"],["home","/","[data-testid=section-statement] p"],["home","/","[data-testid=section-people] h2"],["gocrypto","/work/gocrypto","h2"],["ledgr","/work/ledgr","h2"],["about","/about","h2"]];
let n=0;
for (const [nm,url,sel] of spots){
  await page.goto(B+url,{waitUntil:"load"}); await page.waitForTimeout(1200);
  const idx = sel.startsWith("h2")&&nm!=="home" ? 2 : 0;
  await page.evaluate(([sel,idx])=>{const e=document.querySelectorAll(sel)[idx]; if(e) window.scrollBy(0,e.getBoundingClientRect().top-36)},[sel,idx]); await page.waitForTimeout(900);
  await page.screenshot({path:`${OUT}/nav-under-text-${nm}-${n++}.png`,clip:{x:300,y:0,width:840,height:110}});
}
// dark underlay: lumicap hero / device
await page.goto(B+"/",{waitUntil:"load"}); await page.waitForTimeout(1200);
await page.evaluate(()=>{const e=document.querySelectorAll("[data-testid=stack-card]")[1]; window.scrollBy(0,e.getBoundingClientRect().top+420)}); await page.waitForTimeout(900);
await page.screenshot({path:`${OUT}/nav-under-dark.png`,clip:{x:300,y:0,width:840,height:110}});
await page.screenshot({path:`${OUT}/nav-compact-full.jpg`,type:"jpeg",quality:70});
res.compact = await page.evaluate(()=>document.querySelector("header").dataset.compact);
// hover pill slide sample
await page.evaluate(()=>window.scrollTo(0,0)); await page.waitForTimeout(700);
const link = page.locator("header nav a", {hasText:"Work"}).first(); const lb=await link.boundingBox();
const samp = page.evaluate(()=>new Promise(r=>{const out=[];const t0=performance.now();const find=()=>[...document.querySelectorAll("header nav *")].filter(e=>/pill|indicator/i.test(e.className?.toString?.()||"")||e.getAttribute("data-testid")==="nav-pill");(function f(){const t=performance.now()-t0; const els=document.querySelectorAll("header nav [style*=transform], header nav span[class*=absolute]"); out.push([Math.round(t),[...els].slice(0,3).map(e=>Math.round(e.getBoundingClientRect().left))]); if(t<700) requestAnimationFrame(f); else r(out)})()}));
await page.mouse.move(lb.x+lb.width/2, lb.y+lb.height/2, {steps:2});
const sp = await samp; res.navPillHoverSlide = sp.filter((_,i)=>i%5===0);
await page.screenshot({path:`${OUT}/nav-hover-work.png`,clip:{x:300,y:0,width:840,height:110}});
await ctx.close();
// mobile menu
const m = await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:2});
const mp = await m.newPage();
await mp.goto(B+"/",{waitUntil:"load"}); await mp.waitForTimeout(1500);
await mp.screenshot({path:`${OUT}/m-nav-closed.png`,clip:{x:0,y:0,width:390,height:140}});
await mp.tap("[data-testid=menu-toggle]"); await mp.waitForTimeout(150);
await mp.screenshot({path:`${OUT}/m-menu-150ms.jpg`,type:"jpeg",quality:70});
await mp.waitForTimeout(700);
await mp.screenshot({path:`${OUT}/m-menu-open.jpg`,type:"jpeg",quality:70});
res.menuInert = await mp.evaluate(()=>document.querySelector("#main")?.hasAttribute("inert"));
await mp.keyboard.press("Escape"); await mp.waitForTimeout(500);
res.menuClosedInert = await mp.evaluate(()=>document.querySelector("#main")?.hasAttribute("inert"));
fs.writeFileSync(OUT+"/shell.json",JSON.stringify(res,null,1)); console.log(JSON.stringify(res,null,1));
await browser.close();
