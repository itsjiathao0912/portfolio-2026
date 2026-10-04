import { createRequire } from "module";
const require = createRequire("/Users/knamnguyen/Documents/0-Programming/duma/package.json");
const { chromium } = require("playwright");
import fs from "fs";
const OUT = new URL("../motion/", import.meta.url).pathname;
const B="http://localhost:3003"; const res={};
const browser = await chromium.launch();
let ctx = await browser.newContext({viewport:{width:1440,height:900}});
let page = await ctx.newPage();
const go = async(u)=>{await page.goto(B+u,{waitUntil:"load"}); await page.waitForTimeout(2200)};
const step = async(name,fn)=>{try{res[name]=await fn()}catch(e){res[name]={error:String(e).slice(0,300)}}};
await step("workCardGap", async()=>{
  await go("/work");
  return page.evaluate(()=>[...document.querySelectorAll("[data-testid=project-card]")].slice(0,9).map(c=>{const b=c.getBoundingClientRect(); const txt=[...c.querySelectorAll("h2,h3,p")].filter(e=>e.getBoundingClientRect().height>0); const lastTxt=Math.max(...txt.map(e=>e.getBoundingClientRect().bottom)); const vis=c.querySelector("[data-testid=project-visual]")?.getBoundingClientRect(); const img=[...c.querySelectorAll("img,svg,video")].map(e=>e.getBoundingClientRect()).filter(r=>r.width>60).map(r=>r.top); const mediaTop=img.length?Math.min(...img):null; return {slug:c.dataset.slug||c.textContent.slice(0,14), h:Math.round(b.height), gapPx: mediaTop? Math.round(mediaTop-lastTxt):null, bg:getComputedStyle(c).backgroundImage.slice(0,40)}}));
});
await step("workFilterFine", async()=>{
  await go("/work");
  const track = page.evaluate(()=>new Promise(r=>{const o=[];const t0=performance.now();(function f(){const t=performance.now()-t0; const cs=[...document.querySelectorAll("[data-testid=work-grid] > li")]; o.push([Math.round(t),cs.length,cs.slice(0,2).map(c=>(+getComputedStyle(c).opacity).toFixed(2)+"@"+Math.round(c.getBoundingClientRect().left)+","+Math.round(c.getBoundingClientRect().top))]); if(t<800) requestAnimationFrame(f); else r(o)})()}));
  await page.locator("[data-testid=filter-chip]", {hasText:"Product"}).click();
  const s = await track;
  return {first8:s.slice(0,8).map(x=>x.join("|")), counts:[...new Set(s.map(x=>x[1]))], sampleOps:s.filter((_,i)=>i%9===0).map(x=>x.join("|"))};
});
await step("caseToc", async()=>{
  await go("/work/gocrypto");
  await page.evaluate(()=>scrollTo(0,1400)); await page.waitForTimeout(900);
  const rows = page.locator("[data-testid=case-toc] a");
  const labels = (await rows.allTextContents()).map(t=>t.trim().slice(0,22));
  const y0=await page.evaluate(()=>scrollY);
  await rows.nth(3).click(); await page.waitForTimeout(1600);
  const y1=await page.evaluate(()=>scrollY);
  const active=await page.evaluate(()=>document.querySelector("[data-testid=case-toc] [aria-current]")?.textContent.trim().slice(0,22));
  const track = page.evaluate(()=>new Promise(r=>{const o=[];const t0=performance.now();(function f(){const t=performance.now()-t0; const a=document.querySelector("[data-testid=case-toc] [aria-current]"); const pill=a?.querySelector("span[class*=shadow-2]"); o.push([Math.round(t),a?.textContent.trim().slice(0,10),pill?Math.round(pill.getBoundingClientRect().top):null]); if(t<1100) requestAnimationFrame(f); else r(o)})()}));
  await page.evaluate(()=>{const h=document.querySelectorAll("section h2, h2")[5]; window.scrollTo(0, scrollY+ (h?h.getBoundingClientRect().top:900) - 200)});
  const s = await track;
  const pills=[...new Set(s.map(x=>x[2]))];
  return {labels, clickScrolled:Math.round(y1-y0), activeAfterClick:active, distinctPillTops:pills.length, pillTops:pills.slice(0,12)};
});
await step("caseNextLift", async()=>{ return "see lift.json"});
await ctx.close();
// mobile
ctx = await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
page = await ctx.newPage();
await step("mobilePersonaTap", async()=>{
  await go("/");
  await page.evaluate(()=>{const e=document.querySelector("[data-testid=persona-control]"); window.scrollTo(0, scrollY+e.getBoundingClientRect().top-140)}); await page.waitForTimeout(800);
  const first0 = await page.evaluate(()=>document.querySelector("[data-testid=stack-card]").dataset.slug);
  await page.locator("[data-testid=persona-recruiter]").tap(); await page.waitForTimeout(1200);
  const first1 = await page.evaluate(()=>document.querySelector("[data-testid=stack-card]").dataset.slug);
  const h = await page.locator("[data-testid=persona-recruiter]").boundingBox();
  await page.screenshot({path:OUT+"/m-persona.jpg",type:"jpeg",quality:65});
  return {first0,first1,targetH:Math.round(h.height),targetW:Math.round(h.width)};
});
await step("mobileChipTap", async()=>{
  await go("/");
  await page.evaluate(()=>{const e=document.querySelector("[data-testid=toc-chips]"); window.scrollTo(0, scrollY+e.getBoundingClientRect().top-80)}); await page.waitForTimeout(800);
  const y0=await page.evaluate(()=>scrollY);
  await page.locator("[data-testid=toc-chip]").nth(5).tap(); await page.waitForTimeout(1500);
  const y1=await page.evaluate(()=>scrollY);
  const info=await page.evaluate(()=>{const a=document.querySelector("[data-testid=toc-chip][aria-current]"); const c=document.querySelectorAll("[data-testid=stack-card]")[5].getBoundingClientRect(); const rail=document.querySelector("[data-testid=toc-chips]").getBoundingClientRect(); return {active:a?.textContent, cardTop:Math.round(c.top), railBottom:Math.round(rail.bottom)}});
  return {scrolled:Math.round(y1-y0), ...info};
});
await step("mobileCaseMenu", async()=>{
  await go("/work/gocrypto");
  await page.evaluate(()=>scrollTo(0,1500)); await page.waitForTimeout(900);
  const btn = page.locator("[data-testid=section-menu-button]"); const shown = await btn.isVisible();
  const bb = shown? await btn.boundingBox():null;
  if (shown){ await btn.tap(); await page.waitForTimeout(700); await page.screenshot({path:OUT+"/m-case-menu.jpg",type:"jpeg",quality:65}); }
  return {shown, h:bb&&Math.round(bb.height), w:bb&&Math.round(bb.width)};
});
await step("mobileTargets", async()=>{
  await go("/");
  return page.evaluate(()=>{const small=[...document.querySelectorAll("a,button,[role=radio]")].filter(e=>{const b=e.getBoundingClientRect(); return b.width>0&&b.height>0&&(b.height<44||b.width<44)&&!e.closest("[data-testid=toc-chips]")&&e.checkVisibility?.()}).map(e=>({t:(e.getAttribute("aria-label")||e.textContent||"").trim().slice(0,24),w:Math.round(e.getBoundingClientRect().width),h:Math.round(e.getBoundingClientRect().height)})); return small.slice(0,25)});
});
fs.writeFileSync(OUT+"/misc2.json",JSON.stringify(res,null,1));
console.log(JSON.stringify(res,null,1));
await browser.close();
