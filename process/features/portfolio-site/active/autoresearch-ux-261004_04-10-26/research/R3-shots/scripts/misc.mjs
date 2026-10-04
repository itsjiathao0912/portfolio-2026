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

await step("heroReveal", async()=>{
  await go("/");
  const h = await page.locator("#hero-title").boundingBox();
  await page.mouse.move(h.x+200,h.y+h.height/2); await page.waitForTimeout(600);
  const probe = ()=>page.evaluate(()=>{const els=[...document.querySelectorAll("#hero-title")].flatMap(h=>{const p=h.parentElement; return [...p.querySelectorAll("*")]}); const m=els.map(e=>getComputedStyle(e).maskImage||getComputedStyle(e).webkitMaskImage).filter(x=>x&&x!=="none"); return m[0]||null});
  const before = await probe();
  const track = page.evaluate(()=>new Promise(r=>{const o=[];const t0=performance.now();(function f(){const t=performance.now()-t0; const els=[...document.querySelectorAll("#hero-title")].flatMap(h=>[...h.parentElement.querySelectorAll("*")]); const m=els.map(e=>getComputedStyle(e).webkitMaskImage||getComputedStyle(e).maskImage).find(x=>x&&x!=="none"); const mm=m&&m.match(/at ([\d.-]+)px ([\d.-]+)px/); o.push([Math.round(t), mm?+mm[1]:null]); if(t<900) requestAnimationFrame(f); else r(o)})()}));
  await page.mouse.move(h.x+900,h.y+h.height/2,{steps:1});
  const s = await track;
  await page.mouse.move(h.x+600,h.y+h.height/2); await page.waitForTimeout(500);
  await page.screenshot({path:OUT+"/hero-reveal.jpg",type:"jpeg",quality:70,clip:{x:0,y:0,width:1440,height:520}});
  const xs=s.map(x=>x[1]).filter(x=>x!==null);
  return {maskBefore:before&&before.slice(0,60), trail: s.filter((_,i)=>i%8===0).map(x=>x.join(":")), eased: xs.length>3 && new Set(xs.map(Math.round)).size>6};
});

await step("workFilter", async()=>{
  await go("/work");
  const chips = page.locator("[role=tab], [data-testid=work-filter] button, nav[aria-label*=ilter] button");
  const n = await chips.count();
  const names = await chips.allTextContents();
  const track = page.evaluate(()=>new Promise(r=>{const o=[];const t0=performance.now();(function f(){const t=performance.now()-t0; o.push([Math.round(t),[...document.querySelectorAll("[data-testid=project-card]")].slice(0,3).map(c=>Math.round(c.getBoundingClientRect().left)+","+Math.round(c.getBoundingClientRect().top)),document.querySelectorAll("[data-testid=project-card]").length]); if(t<900) requestAnimationFrame(f); else r(o)})()}));
  await page.locator("button, [role=tab]", {hasText:/^Strategy/}).first().click();
  const s = await track;
  const cards = await page.evaluate(()=>document.querySelectorAll("[data-testid=project-card]").length);
  await page.screenshot({path:OUT+"/work-filter-strategy.jpg",type:"jpeg",quality:60});
  // thumb element
  const thumb = await page.evaluate(()=>!!document.querySelector("[data-testid=work-filter-thumb], [layoutid], span.absolute.rounded-full"));
  return {n,names:names.map(t=>t.replace(/\s+/g," ")).slice(0,8), cardsAfter:cards, samples:s.filter((_,i)=>i%10===0).map(x=>x.join("|")), thumb};
});

await step("workH1", async()=>{
  await go("/work");
  return page.evaluate(()=>{const h=document.querySelector("h1"); const b=h.getBoundingClientRect(); const cs=getComputedStyle(h); return {text:h.textContent, top:Math.round(b.top), h:Math.round(b.height), fontSize:cs.fontSize, srOnly: b.width<=2||cs.position==="absolute"&&b.width<=2, clip:cs.clip}});
});

await step("caseToc", async()=>{
  await go("/work/gocrypto");
  const items = page.locator("[data-testid=toc-item]");
  const n = await items.count();
  const labels = await items.allTextContents();
  const y0 = await page.evaluate(()=>scrollY);
  await items.nth(3).click(); await page.waitForTimeout(1500);
  const y1 = await page.evaluate(()=>scrollY);
  const active = await page.evaluate(()=>document.querySelector("[data-testid=toc-item][aria-current]")?.textContent);
  // pill slide sample on scroll
  const track = page.evaluate(()=>new Promise(r=>{const o=[];const t0=performance.now();(function f(){const t=performance.now()-t0; const a=document.querySelector("[data-testid=toc-item][aria-current]"); const pill=a?.querySelector("span.absolute"); o.push([Math.round(t),a?.textContent?.slice(0,12),pill?Math.round(pill.getBoundingClientRect().top):null]); if(t<1000) requestAnimationFrame(f); else r(o)})()}));
  await page.mouse.wheel(0,900);
  const s = await track;
  return {n, labels:labels.map(t=>t.replace(/\s+/g," ").slice(0,24)), clickScrolled:Math.round(y1-y0), activeAfterClick:active, distinctPill:[...new Set(s.map(x=>x[2]))].length, pillSamples:s.filter((_,i)=>i%9===0).map(x=>x.join(":")), testid: await page.evaluate(()=>!!document.querySelector("[data-testid=case-toc]"))};
});

await step("keyboard", async()=>{
  await go("/");
  const order=[];
  for (let i=0;i<14;i++){ await page.keyboard.press("Tab"); order.push(await page.evaluate(()=>{const a=document.activeElement; const cs=getComputedStyle(a); return (a.tagName+":"+(a.getAttribute("aria-label")||a.textContent||"").trim().replace(/\s+/g," ").slice(0,22)+" |ring:"+(cs.outlineStyle!=="none"&&cs.outlineWidth!=="0px"?cs.outlineWidth+" "+cs.outlineColor:cs.boxShadow.includes("rgb")&&cs.boxShadow!=="none"?"shadow":"none"))})); }
  return order;
});

await step("liftFocus", async()=>{
  await go("/");
  await page.evaluate(()=>{const c=document.querySelectorAll("[data-testid=stack-card]")[1]; window.scrollTo(0, window.scrollY+c.getBoundingClientRect().top-140)}); await page.waitForTimeout(700);
  await page.focus("[data-testid=stack-card] a"); await page.keyboard.press("Tab"); await page.waitForTimeout(900);
  return page.evaluate(()=>({focus:document.activeElement?.textContent?.trim().slice(0,30), modes:[...document.querySelectorAll("[data-lift-card]")].filter(e=>e.dataset.lift!=="rest").length}));
});
await ctx.close();

// reduced motion
ctx = await browser.newContext({viewport:{width:1440,height:900},reducedMotion:"reduce"});
page = await ctx.newPage();
await step("reduced", async()=>{
  await go("/");
  const out={};
  await page.evaluate(()=>{const c=document.querySelectorAll("[data-testid=stack-card]")[1]; window.scrollTo(0, window.scrollY+c.getBoundingClientRect().top-140)}); await page.waitForTimeout(900);
  const lidx = await page.evaluate(()=>{const c=document.querySelectorAll("[data-testid=stack-card]")[1]; const l=c.closest("[data-lift-card]")||c.querySelector("[data-lift-card]"); l.setAttribute("data-probe","1"); const b=l.getBoundingClientRect(); return {x:b.x+b.width/2,y:b.y+300,top:b.top}});
  await page.mouse.move(lidx.x,lidx.y,{steps:3}); await page.waitForTimeout(800);
  out.lift = await page.evaluate(()=>{const e=document.querySelector("[data-probe]"); const cs=getComputedStyle(e); return {top:e.getBoundingClientRect().top, transform:cs.transform, shadow:cs.boxShadow.slice(0,40)}});
  out.liftTopRest = lidx.top;
  out.stamp = await page.evaluate(()=>{const s=[...document.querySelectorAll("[data-testid=card-stamp]")].map(x=>x.dataset.landed); return s.slice(0,3)});
  const t = page.locator("[data-testid=proof-ticker]"); await t.scrollIntoViewIfNeeded(); await page.waitForTimeout(600);
  out.tickerDx = await page.evaluate(()=>new Promise(r=>{const el=document.querySelector("[data-testid=ticker-item]"); const x0=el.getBoundingClientRect().left; setTimeout(()=>r(el.getBoundingClientRect().left-x0),1000)}));
  out.tickerScrollable = await page.evaluate(()=>{const t=document.querySelector("[data-testid=proof-ticker]"); const s=[t,...t.querySelectorAll("*")].find(e=>e.scrollWidth>e.clientWidth+4&&getComputedStyle(e).overflowX!=="visible"); return !!s});
  out.canvas = await page.evaluate(()=>document.querySelectorAll("canvas").length);
  out.rotatingWord = null;
  return out;
});
await ctx.close();
fs.writeFileSync(OUT+"/misc.json",JSON.stringify(res,null,1));
console.log(JSON.stringify(res,null,1));
await browser.close();
