import { createRequire } from "module";
const require = createRequire("/Users/knamnguyen/Documents/0-Programming/duma/package.json");
const { chromium } = require("playwright");
import fs from "fs";
const OUT = "/Users/knamnguyen/Documents/0-Programming/portfolio-2026/process/features/portfolio-site/active/autoresearch-ux-261004_04-10-26/research/R2-shots/motion";
const B="http://localhost:3003"; const res={};
const browser = await chromium.launch();
const ctx = await browser.newContext({viewport:{width:1440,height:900}});
const page = await ctx.newPage();
await page.goto(B+"/",{waitUntil:"load"}); await page.waitForTimeout(1500);

// ---- STAMP landing: take third card; position its top at 110% viewport (below fold), then scroll in smoothly
const stampInfo = await page.evaluate(()=>{ const cards=[...document.querySelectorAll("[data-testid=stack-card]")]; return cards.map(c=>{const s=c.querySelector("[data-testid=card-stamp]"); const cb=c.getBoundingClientRect(), sb=s?.getBoundingClientRect(); return {slug:c.dataset.slug, hasStamp:!!s, stampTopRelCard: sb?+(sb.top-cb.top).toFixed(1):null, stampH: sb?+sb.height.toFixed(1):null, word:s?.getAttribute("aria-label")}}) });
res.stamps=stampInfo;
// scroll so card index 2 top = 105% vh
await page.evaluate(()=>{const c=document.querySelectorAll("[data-testid=stack-card]")[2]; window.scrollTo(0, window.scrollY + c.getBoundingClientRect().top - innerHeight*1.02)});
await page.waitForTimeout(500);
const landed0 = await page.evaluate(()=>document.querySelectorAll("[data-testid=card-stamp]")[2].dataset.landed);
res.stamp2_landed_before=landed0;
// sampler on stamp inner div + card
const sp = page.evaluate(()=>new Promise(r=>{const s=document.querySelectorAll("[data-testid=card-stamp]")[2]; const inner=s.firstElementChild; const card=document.querySelectorAll("[data-testid=stack-card]")[2]; const out=[]; const t0=performance.now(); let lastY=0;
 (function f(){const t=performance.now()-t0; const cs=getComputedStyle(inner); const halo=inner.querySelector("span"); out.push([Math.round(t), cs.transform, +cs.opacity, s.dataset.landed, halo?getComputedStyle(halo).boxShadow.slice(0,40):"", +(card.getBoundingClientRect().top).toFixed(1)]); if(t<2600) requestAnimationFrame(f); else r(out)})();}));
// scroll in gradually after 200ms
await page.waitForTimeout(150);
for (let i=0;i<10;i++){ await page.mouse.wheel(0,40); await page.waitForTimeout(40); }
const sdata = await sp;
fs.writeFileSync(OUT+"/stamp-frames.json",JSON.stringify(sdata));
const first = sdata.findIndex(x=>x[3]==="true");
const mats = sdata.filter((x,i)=>i>=first-1).slice(0,45).filter((_,i)=>i%3===0).map(x=>[x[0],x[1],x[2],x[4]]);
res.stampTimeline = {landedAtMs: first>=0?sdata[first][0]:null, sample: mats};
// card nudge? card top delta relative to scroll: check card top vs expected (scroll steps). approximate by checking min/max movement deviation
// screenshots of stamp landed
await page.waitForTimeout(800);
await page.evaluate(()=>{const c=document.querySelectorAll("[data-testid=stack-card]")[2]; window.scrollTo(0, window.scrollY + c.getBoundingClientRect().top - 220)}); await page.waitForTimeout(800);
await page.screenshot({path:OUT+"/stamp-landed.jpg",type:"jpeg",quality:75,clip:{x:300,y:100,width:1140,height:260}});
// stamp on dark ledgr
await page.evaluate(()=>{const c=document.querySelector("[data-testid=stack-card][data-slug=ledgr]"); window.scrollTo(0, window.scrollY + c.getBoundingClientRect().top - 200)}); await page.waitForTimeout(1200);
await page.screenshot({path:OUT+"/stamp-ledgr.jpg",type:"jpeg",quality:80,clip:{x:700,y:100,width:740,height:200}});
const ledgrStamp = await page.evaluate(()=>{const s=document.querySelector("[data-testid=stack-card][data-slug=ledgr] [data-testid=card-stamp]"); const b=s.getBoundingClientRect(); return {top:b.top,left:b.left,w:b.width}}); res.ledgrStamp=ledgrStamp;

// ---- SIDE NAV pill slide
await page.evaluate(()=>window.scrollTo(0,0));
await page.evaluate(()=>{const c=document.querySelector("[data-testid=stack-card][data-slug=lumicap]"); window.scrollTo(0, window.scrollY + c.getBoundingClientRect().top - 300)}); await page.waitForTimeout(800);
const pillRect = ()=>page.evaluate(()=>{const a=document.querySelector("[data-testid=toc-item][data-active=true]"); const p=a?.querySelector("span.absolute"); const b=p?.getBoundingClientRect(); const em=a?.querySelector("span[aria-hidden]"); return {label:a?.textContent, pillTop:b?+b.top.toFixed(1):null, pillLeft: b?+b.left.toFixed(1):null, pillW:b?+b.width.toFixed(1):null,h:b?+b.height.toFixed(1):null, emTf:em?getComputedStyle(em).transform:null}});
res.pillBefore = await pillRect();
const pp = page.evaluate(()=>new Promise(r=>{const out=[]; const t0=performance.now(); (function f(){const t=performance.now()-t0; const a=document.querySelector("[data-testid=toc-item][data-active=true]"); const p=a?.querySelector("span.absolute"); const em=a?.querySelector("span[aria-hidden]"); const b=p?.getBoundingClientRect(); out.push([Math.round(t),a?.textContent?.slice(0,8),b?+b.top.toFixed(1):null, em?getComputedStyle(em).transform:null]); if(t<1500) requestAnimationFrame(f); else r(out)})();}));
await page.evaluate(()=>{const c=document.querySelector("[data-testid=stack-card][data-slug=cosap]"); window.scrollTo({top: window.scrollY + c.getBoundingClientRect().top - 300, behavior:"instant"})});
const pd = await pp;
const tops = pd.map(x=>x[2]).filter(x=>x!=null);
res.pillSlide = {samples: pd.filter((_,i)=>i%4===0).slice(0,16), uniqueTops: [...new Set(tops)].length, emojiPop: pd.filter(x=>x[3]&&x[3]!=="none"&&x[3]!=="matrix(1, 0, 0, 1, 0, 0)").slice(0,4)};
res.pillAfter = await pillRect();
// toc item seam: backgrounds at x of toc
res.seam = await page.evaluate(()=>{const toc=document.querySelector("[data-testid=home-toc]"); const x=toc.getBoundingClientRect().left+20; const bgs=[]; for(const y of [60,120,300,500,800]){ const els=document.elementsFromPoint(x,y); const e=els.find(e=>{const c=getComputedStyle(e).backgroundColor; return c!=="rgba(0, 0, 0, 0)"}); bgs.push([y,e?.tagName,getComputedStyle(e||document.body).backgroundColor]); } return bgs;});
fs.writeFileSync(OUT+"/m2.json",JSON.stringify(res,null,1));
console.log(JSON.stringify({stamps:res.stamps,stampTL:res.stampTimeline,ledgr:res.ledgrStamp,pillBefore:res.pillBefore,pillAfter:res.pillAfter,slide:res.pillSlide,seam:res.seam},null,1));
await browser.close();
