import { createRequire } from "module";
const require = createRequire("/Users/knamnguyen/Documents/0-Programming/duma/package.json");
const { chromium } = require("playwright");
import fs from "fs";
const OUT = new URL("../motion/", import.meta.url).pathname;
const B="http://localhost:3003"; const res={}; const errs=[];
const browser = await chromium.launch();
let ctx = await browser.newContext({viewport:{width:1440,height:900}});
let page = await ctx.newPage();
page.on("pageerror",e=>errs.push("PAGEERR "+e.message.slice(0,140))); page.on("console",m=>{if(m.type()==="error")errs.push(m.text().slice(0,140))});
const go = async(u)=>{await page.goto(B+u,{waitUntil:"load"}); await page.waitForTimeout(1500)};
const step = async(name,fn)=>{try{res[name]=await fn()}catch(e){res[name]={error:String(e).slice(0,200)}}};
await go("/");

// ---- stamps (all cards)
await step("stamps", async()=>{
  const n = await page.evaluate(()=>document.querySelectorAll("[data-testid=stack-card]").length);
  const out=[];
  for (let i=0;i<n;i++){
    await page.evaluate(i=>{const c=document.querySelectorAll("[data-testid=stack-card]")[i]; window.scrollTo(0, window.scrollY + c.getBoundingClientRect().top - innerHeight*0.45)},i); await page.waitForTimeout(1100);
    out.push(await page.evaluate(i=>{const c=document.querySelectorAll("[data-testid=stack-card]")[i]; const s=c.querySelector("[data-testid=card-stamp]"); const cb=c.getBoundingClientRect(), sb=s?.getBoundingClientRect(); const inner=s?.firstElementChild; return {slug:c.dataset.slug,hasStamp:!!s,landed:s?.dataset.landed,dTop: sb? +(sb.top+sb.height/2 - cb.top).toFixed(1):null, label:s?.getAttribute("aria-label"), transform:inner?getComputedStyle(inner).transform:null, opacity:inner?+getComputedStyle(inner).opacity:null, blend:inner?getComputedStyle(inner).mixBlendMode:null, color:s?getComputedStyle(s.querySelector("g")||s).stroke:null}},i));
  }
  // scroll back up: no replay
  await page.evaluate(()=>window.scrollTo(0,0)); await page.waitForTimeout(500);
  return out;
});
// stamp landing timeline + card nudge on card 3
await step("stampTimeline", async()=>{
  await go("/");
  await page.evaluate(()=>{const c=document.querySelectorAll("[data-testid=stack-card]")[2]; window.scrollTo(0, window.scrollY + c.getBoundingClientRect().top - innerHeight*1.05)}); await page.waitForTimeout(600);
  const sp = page.evaluate(()=>new Promise(r=>{const s=document.querySelectorAll("[data-testid=card-stamp]")[2]; const inner=s.firstElementChild; const card=document.querySelectorAll("[data-testid=stack-card]")[2]; const out=[]; const t0=performance.now();
   (function f(){const t=performance.now()-t0; const cs=getComputedStyle(inner); const m=cs.transform.match(/matrix\(([^)]+)\)/); let sc=null,rot=null; if(m){const [a,b]=m[1].split(",").map(Number); sc=+Math.hypot(a,b).toFixed(3); rot=+(Math.atan2(b,a)*180/Math.PI).toFixed(1)} out.push([Math.round(t),sc,rot,+(+cs.opacity).toFixed(2),s.dataset.landed,+card.getBoundingClientRect().top.toFixed(1)]); if(t<1500) requestAnimationFrame(f); else r(out)})();}));
  await page.waitForTimeout(100);
  await page.evaluate(()=>{const c=document.querySelectorAll("[data-testid=stack-card]")[2]; window.scrollTo(0, window.scrollY + c.getBoundingClientRect().top - innerHeight*0.55)});
  const d = await sp; const li = d.findIndex(x=>x[4]==="true");
  const after=d.slice(li); const scs=after.map(x=>x[1]); 
  return {landedAtMs:d[li]?.[0], minScale:Math.min(...scs), maxScale:Math.max(...scs.filter(x=>x!==null)), finalScale:scs[scs.length-1], finalRot:after[after.length-1][2], settleMs:(()=>{let last=null; for(let i=after.length-1;i>=0;i--){ if(Math.abs((after[i][1]||1)-1)>0.01){last=after[i][0]-after[0][0];break;} } return last})(), cardTopRange:[Math.min(...after.map(x=>x[5])),Math.max(...after.map(x=>x[5]))].map(v=>+v.toFixed(1)), sample:after.filter((_,i)=>i%6===0).slice(0,10)};
});
await page.screenshot({path:OUT+"/stamp-landed.jpg",type:"jpeg",quality:80});

// ---- TOC: seam, pill slide, emoji pop
await step("toc", async()=>{
  await go("/");
  const pos = await page.evaluate(()=>{const t=document.querySelector("[data-testid=home-toc]").getBoundingClientRect(); const w=document.querySelector("#work-title").getBoundingClientRect(); return {tocX:t.x+t.width/2, tocTop:t.top+scrollY, workTitleTop:w.top+scrollY}});
  // seam: sample bg color along TOC x from above the section down, using screenshot pixels
  await page.evaluate(y=>window.scrollTo(0,y), pos.workTitleTop-500); await page.waitForTimeout(700);
  await page.screenshot({path:OUT+"/seam.png"});
  // pill slide: scroll so active changes
  await page.evaluate(y=>window.scrollTo(0,y), pos.workTitleTop+100); await page.waitForTimeout(600);
  const track = page.evaluate(()=>new Promise(r=>{const out=[];const t0=performance.now();(function f(){const t=performance.now()-t0; const a=document.querySelector("[data-testid=toc-item][data-active=true]"); const pill=a?.querySelector("span.absolute"); const emoji=a?.querySelector("span.grid"); out.push([Math.round(t), a?.textContent, pill?Math.round(pill.getBoundingClientRect().top):null, emoji?+getComputedStyle(emoji).transform.split(",")[0].replace("matrix(",""):null]); if(t<1100) requestAnimationFrame(f); else r(out)})()}));
  await page.evaluate(()=>{const c=document.querySelectorAll("[data-testid=stack-card]")[1]; window.scrollTo(0, window.scrollY + c.getBoundingClientRect().top - innerHeight*0.3)});
  const tr = await track;
  const pills = [...new Set(tr.map(x=>x[2]))];
  const emo = tr.map(x=>x[3]).filter(x=>x!=null);
  await page.screenshot({path:OUT+"/toc-active.jpg",type:"jpeg",quality:75,clip:{x:0,y:60,width:420,height:540}});
  return {pos, distinctPillTops:pills.length, pillTops:pills.slice(0,14), maxEmojiScale:Math.max(...emo), activeNames:[...new Set(tr.map(x=>x[1]))]};
});

// ---- persona
await step("persona", async()=>{
  await go("/");
  await page.evaluate(()=>{const e=document.querySelector("[data-testid=persona-control]"); window.scrollTo(0, window.scrollY+e.getBoundingClientRect().top-140)}); await page.waitForTimeout(800);
  const out={};
  for (const p of ["founder","recruiter","engineer","all"]) {
    const y0 = await page.evaluate(()=>window.scrollY);
    const before = await page.evaluate(()=>[...document.querySelectorAll("[data-testid=stack-card]")].map(c=>c.dataset.slug));
    const track = page.evaluate(()=>new Promise(r=>{const out=[];const t0=performance.now();(function f(){const t=performance.now()-t0; out.push([Math.round(t),window.scrollY,[...document.querySelectorAll("[data-testid=stack-card]")].slice(0,3).map(c=>Math.round(c.getBoundingClientRect().top)),(document.querySelector("[role=radio][aria-checked=true] ~ *, [data-testid=persona-control] [aria-hidden]")||{}).tagName]); if(t<1400) requestAnimationFrame(f); else r(out)})()}));
    await page.click(`[data-testid=persona-${p}]`);
    const tr = await track;
    const after = await page.evaluate(()=>[...document.querySelectorAll("[data-testid=stack-card]")].map(c=>c.dataset.slug));
    const maxMove = Math.max(...tr.flatMap(x=>x[2].map((v,i)=>Math.abs(v-tr[0][2][i]))));
    out[p]={moved: before.join()!==after.join(), first3:after.slice(0,3), scrollDelta: tr[tr.length-1][1]-y0, maxTopTravelPx:maxMove, note:await page.evaluate(()=>document.querySelector("[data-testid=persona-note]")?.textContent||null), tocFirst:await page.evaluate(()=>document.querySelector("[data-testid=toc-item]")?.textContent), samples:tr.filter((_,i)=>i%10===0).map(x=>[x[0],x[1],x[2].join("/")])};
    await page.screenshot({path:`${OUT}/persona-${p}.jpg`,type:"jpeg",quality:70});
    await page.waitForTimeout(400);
  }
  // keyboard
  await page.focus("[data-testid=persona-all]"); await page.keyboard.press("ArrowRight"); await page.waitForTimeout(300);
  out.arrowRight = await page.evaluate(()=>document.querySelector("[role=radio][aria-checked=true]")?.textContent);
  await page.click("[data-testid=persona-all]");
  return out;
});

// ---- ticker
await step("ticker", async()=>{
  await go("/");
  await page.evaluate(()=>{const e=document.querySelector("[data-testid=proof-ticker]"); window.scrollTo(0, window.scrollY+e.getBoundingClientRect().top-300)}); await page.waitForTimeout(900);
  const tk = (ms)=>page.evaluate((ms)=>new Promise(r=>{const el=document.querySelector("[data-testid=ticker-item]"); const x0=el.getBoundingClientRect().left; setTimeout(()=>r(el.getBoundingClientRect().left-x0),ms)}),ms);
  const idle = await tk(1000);
  const box = await page.locator("[data-testid=proof-ticker]").boundingBox();
  await page.mouse.move(box.x+400, box.y+box.height/2); await page.waitForTimeout(700);
  const hov = await tk(1000);
  await page.mouse.move(5,5); await page.waitForTimeout(700);
  const after = await tk(1000);
  const info = await page.evaluate(()=>{const it=[...document.querySelectorAll("[data-testid=ticker-item]")].slice(0,6); return {n:document.querySelectorAll("[data-testid=ticker-item]").length, texts:it.map(b=>b.textContent.replace(/\s+/g," ").slice(0,60)), tag:it[0]?.tagName, fontPx:getComputedStyle(it[0]).fontSize, chipFont:(()=>{const c=it[0].querySelector("span:last-child"); return c?getComputedStyle(c).fontSize:null})(), tabindex:it[0]?.getAttribute("tabindex"), h:document.querySelector("[data-testid=proof-ticker]").getBoundingClientRect().height}});
  await page.screenshot({path:OUT+"/ticker.jpg",type:"jpeg",quality:80,clip:{x:0,y:box.y-60,width:1440,height:box.height+120}});
  // keyboard focus pause
  await page.keyboard.press("Tab");
  // click item -> scroll
  const y0 = await page.evaluate(()=>scrollY);
  const first = page.locator("[data-testid=ticker-item]").nth(2);
  const clickable = await first.evaluate(e=>e.tagName+":"+(e.getAttribute("href")||""));
  await first.click({timeout:2500}).catch(()=>{}); await page.waitForTimeout(1200);
  const y1 = await page.evaluate(()=>scrollY);
  return {idlePxPerS:+idle.toFixed(1), hoverPxPerS:+hov.toFixed(1), afterLeavePxPerS:+after.toFixed(1), clickable, clickScrolled:Math.round(y1-y0), ...info};
});

// ---- globe
await step("globe", async()=>{
  await go("/");
  await page.evaluate(()=>{const e=document.querySelector("[data-testid=globe-stage]"); window.scrollTo(0, window.scrollY+e.getBoundingClientRect().top-220)}); await page.waitForTimeout(1800);
  const canv = await page.evaluate(()=>document.querySelectorAll("canvas").length);
  const stage = await page.locator("[data-testid=globe-stage]").boundingBox();
  const shot = async(n)=>page.screenshot({path:`${OUT}/globe-${n}.png`,clip:stage});
  await shot("a"); await page.waitForTimeout(2000); await shot("b");
  const fps = await page.evaluate(()=>new Promise(r=>{let n=0;const t0=performance.now();(function f(){n++; if(performance.now()-t0<2000) requestAnimationFrame(f); else r(n/2)})()}));
  // hover rows
  const rows = await page.locator("[data-testid=globe-row]").count();
  const rowTexts = await page.locator("[data-testid=globe-row]").allTextContents();
  await page.locator("[data-testid=globe-row]").nth(2).hover(); await page.waitForTimeout(1200); await shot("hover-row2");
  await page.locator("[data-testid=globe-row]").nth(0).hover(); await page.waitForTimeout(1200); await shot("hover-row0");
  // drag
  await page.mouse.move(stage.x+stage.width/2, stage.y+stage.height/2); await page.mouse.down(); await page.mouse.move(stage.x+stage.width/2+160, stage.y+stage.height/2, {steps:8}); await page.mouse.up(); await page.waitForTimeout(150); await shot("drag-150ms"); await page.waitForTimeout(1200); await shot("drag-1350ms");
  await page.evaluate(()=>window.scrollTo(0,0)); await page.waitForTimeout(1800);
  const away = await page.evaluate(()=>document.querySelectorAll("canvas").length);
  return {canvasAtGlobe:canv, canvasAway:away, fps, rows, rowTexts:rowTexts.map(t=>t.replace(/\s+/g," ")), stage};
});

// ---- coin
await step("coin", async()=>{
  await go("/");
  await page.evaluate(()=>{const e=document.querySelector("[data-testid=hello-coin]"); window.scrollTo(0, window.scrollY+e.getBoundingClientRect().top-350)}); await page.waitForTimeout(900);
  const coinX = ()=>page.evaluate(()=>document.querySelector("[data-testid=hello-coin]").getBoundingClientRect().left);
  const r0 = await coinX();
  const cb = await page.locator("[data-testid=hello-coin]").boundingBox();
  const wb = await page.locator("[data-testid=hello-wallet]").boundingBox();
  const out={track:{coin:cb,wallet:wb}};
  // 40px nudge then release
  await page.mouse.move(cb.x+28,cb.y+28); await page.mouse.down(); await page.mouse.move(cb.x+28+40,cb.y+28,{steps:6});
  out.nudgeXWhileHeld = +((await coinX())-r0).toFixed(1);
  await page.mouse.up(); await page.waitForTimeout(900);
  out.nudgeAfterRelease = +((await coinX())-r0).toFixed(1);
  out.stageAfterNudge = await page.evaluate(()=>document.querySelector("[data-testid=hello-wallet]").dataset.stage);
  // full drag
  await page.mouse.move(cb.x+28,cb.y+28); await page.mouse.down(); await page.mouse.move(wb.x+wb.width/2,cb.y+28,{steps:14}); 
  const sp = page.evaluate(()=>new Promise(r=>{const out=[];const t0=performance.now();(function f(){const t=performance.now()-t0; out.push([Math.round(t),+document.querySelector("[data-testid=hello-coin]").getBoundingClientRect().left.toFixed(1)]); if(t<900) requestAnimationFrame(f); else r(out)})()}));
  await page.mouse.up(); const s = await sp;
  out.drag = {stage:await page.evaluate(()=>document.querySelector("[data-testid=hello-wallet]").dataset.stage), finalCoinLeft:s[s.length-1][1], walletLeft:wb.x, coinOvershoot: +(Math.max(...s.map(x=>x[1]))-s[s.length-1][1]).toFixed(1)};
  await page.screenshot({path:OUT+"/coin-settled.jpg",type:"jpeg",quality:75});
  out.buttons = await page.evaluate(()=>({email:!!document.querySelector("[data-testid=hello-email]"),li:!!document.querySelector("[data-testid=hello-linkedin]")}));
  // track overrun
  out.overrun = await page.evaluate(()=>{const sec=document.querySelector("[data-testid=section-say-hello]"); const card=sec.firstElementChild.getBoundingClientRect(); const svg=sec.querySelector("svg").getBoundingClientRect(); const track=sec.querySelector("svg").parentElement.getBoundingClientRect(); return {cardRight:Math.round(card.right), trackRight:Math.round(track.right), svgRight:Math.round(svg.right), svgLeft:Math.round(svg.left), trackLeft:Math.round(track.left)}});
  // keyboard on reset
  await page.reload({waitUntil:"load"}); await page.waitForTimeout(1200);
  await page.focus("[data-testid=hello-coin]"); await page.keyboard.press("Enter"); await page.waitForTimeout(900);
  out.keyboardStage = await page.evaluate(()=>document.querySelector("[data-testid=hello-wallet]").dataset.stage);
  return out;
});
res.errors=errs;
await ctx.close();

// ---- mobile rail + touch
ctx = await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
page = await ctx.newPage();
page.on("pageerror",e=>errs.push("M-PAGEERR "+e.message.slice(0,140)));
await step("mobileRail", async()=>{
  await go("/");
  const rails=[]; const slugs = await page.evaluate(()=>[...document.querySelectorAll("[data-testid=stack-card]")].map(c=>c.dataset.slug));
  for (const slug of slugs) {
    await page.evaluate((s)=>{const c=document.getElementById("project-"+s); window.scrollTo(0, window.scrollY+c.getBoundingClientRect().top-200)}, slug); await page.waitForTimeout(1100);
    rails.push(await page.evaluate((s)=>{const r=document.querySelector("[data-testid=toc-chips]"); const a=r.querySelector("[aria-current=location]"); const rb=r.getBoundingClientRect(), ab=a?.getBoundingClientRect(); const pill=a?.querySelector("span.absolute"); return {slug:s,active:a?.textContent,scrollLeft:Math.round(r.scrollLeft),activeVisible: ab? (ab.left>=rb.left-1 && ab.right<=rb.right+1):null, centered: ab? Math.round((ab.left+ab.width/2)-(rb.left+rb.width/2)):null, pill:!!pill, railTop:Math.round(rb.top)}}, slug));
  }
  await page.screenshot({path:OUT+"/m-rail.jpg",type:"jpeg",quality:75,clip:{x:0,y:0,width:390,height:300}});
  return rails;
});
await step("mobileStamp", async()=>{
  return page.evaluate(()=>[...document.querySelectorAll("[data-testid=card-stamp]")].map(s=>{const c=s.closest("[data-testid=stack-card]").getBoundingClientRect(), b=s.getBoundingClientRect(); return {d:+(b.top+b.height/2-c.top).toFixed(1), w:Math.round(b.width), rightGap:Math.round(c.right-b.right), landed:s.dataset.landed}}));
});
await step("touchLift", async()=>{
  await go("/");
  await page.evaluate(()=>{const c=document.querySelectorAll("[data-testid=stack-card]")[1]; window.scrollTo(0, window.scrollY+c.getBoundingClientRect().top-120)}); await page.waitForTimeout(900);
  const b = await page.evaluate(()=>{const e=document.querySelectorAll("[data-lift-card]")[0].getBoundingClientRect(); return {x:e.x,y:e.y,w:e.width}});
  const idx = await page.evaluate(()=>{const c=document.querySelectorAll("[data-testid=stack-card]")[1]; const l=c.closest("[data-lift-card]")||c.querySelector("[data-lift-card]"); return [...document.querySelectorAll("[data-lift-card]")].indexOf(l)});
  await page.touchscreen.tap(195, 500); await page.waitForTimeout(900);
  const modes = await page.evaluate(()=>[...document.querySelectorAll("[data-lift-card]")].filter(e=>e.dataset.lift!=="rest").length);
  return {stuckNonRest:modes, idx};
});
res.errors2 = errs;
fs.writeFileSync(OUT+"/home.json",JSON.stringify(res,null,1));
console.log(JSON.stringify(res,null,1));
await browser.close();
