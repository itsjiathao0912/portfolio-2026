import { createRequire } from "module";
const require = createRequire("/Users/knamnguyen/Documents/0-Programming/duma/package.json");
const { chromium } = require("playwright");
import fs from "fs";
const OUT = new URL("../motion/", import.meta.url).pathname;
const B="http://localhost:3003"; const res={};
const browser = await chromium.launch();
let ctx = await browser.newContext({viewport:{width:1440,height:900}});
let page = await ctx.newPage();
const go = async(u)=>{await page.goto(B+u,{waitUntil:"load"}); await page.waitForTimeout(2500)};
const step = async(name,fn)=>{try{res[name]=await fn()}catch(e){res[name]={error:String(e).slice(0,300)}}};

await step("coin", async()=>{
  await go("/");
  const coin = page.locator("[data-testid=hello-coin]");
  await coin.scrollIntoViewIfNeeded(); await page.evaluate(()=>window.scrollBy(0,150)); await page.waitForTimeout(1200);
  const cb = await coin.boundingBox(); const wb = await page.locator("[data-testid=hello-wallet]").boundingBox();
  const out={vp:{coinY:cb.y, walletY:wb.y}};
  const left=()=>page.evaluate(()=>document.querySelector("[data-testid=hello-coin]").getBoundingClientRect().left);
  const r0=await left();
  // 40px nudge
  await page.mouse.move(cb.x+28,cb.y+28); await page.mouse.down(); await page.mouse.move(cb.x+28+40,cb.y+28,{steps:8});
  out.nudgeHeld=+((await left())-r0).toFixed(1);
  const sp = page.evaluate(()=>new Promise(r=>{const o=[];const t0=performance.now();(function f(){const t=performance.now()-t0;o.push([Math.round(t),+document.querySelector("[data-testid=hello-coin]").getBoundingClientRect().left.toFixed(1)]);if(t<900)requestAnimationFrame(f);else r(o)})()}));
  await page.mouse.up(); const s=await sp;
  out.nudgeAfter=+(s[s.length-1][1]-r0).toFixed(1); out.nudgeReturnSamples=s.filter((_,i)=>i%8===0).slice(0,8).map(x=>x[1]-r0);
  out.stageAfterNudge=await page.evaluate(()=>document.querySelector("[data-testid=hello-wallet]").dataset.stage);
  // 230px drag (partial, <85%) then release
  await page.mouse.move(cb.x+28,cb.y+28); await page.mouse.down(); await page.mouse.move(cb.x+28+230,cb.y+28,{steps:12});
  out.drag230Held=+((await left())-r0).toFixed(1); await page.mouse.up(); await page.waitForTimeout(900);
  out.drag230After=+((await left())-r0).toFixed(1); out.stageAfter230=await page.evaluate(()=>document.querySelector("[data-testid=hello-wallet]").dataset.stage);
  // full drag to wallet
  await page.mouse.move(cb.x+28,cb.y+28); await page.mouse.down(); await page.mouse.move(wb.x+wb.width/2,cb.y+28,{steps:16});
  const sp2 = page.evaluate(()=>new Promise(r=>{const o=[];const t0=performance.now();(function f(){const t=performance.now()-t0;o.push([Math.round(t),+document.querySelector("[data-testid=hello-coin]").getBoundingClientRect().left.toFixed(1)]);if(t<1000)requestAnimationFrame(f);else r(o)})()}));
  await page.mouse.up(); const s2=await sp2;
  out.full={stage:await page.evaluate(()=>document.querySelector("[data-testid=hello-wallet]").dataset.stage), finalLeft:s2[s2.length-1][1], walletCenter:wb.x+wb.width/2, overshootPx:+(Math.max(...s2.map(x=>x[1]))-s2[s2.length-1][1]).toFixed(1), settleSamples:s2.filter((_,i)=>i%10===0).map(x=>x.join(":"))};
  await page.screenshot({path:OUT+"/coin-settled.jpg",type:"jpeg",quality:75});
  out.buttons=await page.evaluate(()=>({email:!!document.querySelector("[data-testid=hello-email]"),li:!!document.querySelector("[data-testid=hello-linkedin]")}));
  return out;
});

await step("tickerClick", async()=>{
  await go("/");
  const t = page.locator("[data-testid=proof-ticker]"); await t.scrollIntoViewIfNeeded(); await page.waitForTimeout(800);
  const box = await t.boundingBox();
  await page.mouse.move(box.x+700, box.y+box.height/2); await page.waitForTimeout(700);
  const item = await page.evaluate(([x,y])=>{const el=document.elementFromPoint(x,y)?.closest("[data-testid=ticker-item]"); return el?el.textContent.replace(/\s+/g," ").slice(0,50):null},[box.x+700,box.y+box.height/2]);
  const y0=await page.evaluate(()=>scrollY);
  await page.mouse.down(); await page.mouse.up(); await page.waitForTimeout(1600);
  const y1=await page.evaluate(()=>scrollY);
  const target = await page.evaluate(()=>{const cards=[...document.querySelectorAll("[data-testid=stack-card]")]; const c=cards.find(c=>{const b=c.getBoundingClientRect();return b.top<400&&b.bottom>200}); return c?.dataset.slug||null});
  return {item, scrolled:Math.round(y1-y0), landedOnCard:target};
});

await step("personaFrames", async()=>{
  await go("/");
  await page.evaluate(()=>{const e=document.querySelector("[data-testid=persona-control]"); window.scrollTo(0, window.scrollY+e.getBoundingClientRect().top-140)}); await page.waitForTimeout(900);
  const p = page.evaluate(()=>new Promise(r=>{r(null)}));
  await page.click("[data-testid=persona-recruiter]");
  const shots=[];
  for (const ms of [60,140,240,380,700]) { await page.waitForTimeout(ms - (shots.length? [60,140,240,380,700][shots.length-1]:0)); await page.screenshot({path:`${OUT}/persona-frame-${ms}.jpg`,type:"jpeg",quality:55}); }
  await page.click("[data-testid=persona-all]"); await page.waitForTimeout(800);
  return "ok";
});

await step("emojiPop", async()=>{
  await go("/");
  await page.evaluate(()=>{const e=document.querySelector("#work-title"); window.scrollTo(0, window.scrollY+e.getBoundingClientRect().top-100)}); await page.waitForTimeout(900);
  const tr = page.evaluate(()=>new Promise(r=>{const o=[];const t0=performance.now();(function f(){const t=performance.now()-t0; const a=document.querySelector("[data-testid=toc-item][aria-current=location]"); const e=a?.querySelectorAll("span")[a.querySelectorAll("span").length-2]; const emoji=[...(a?.querySelectorAll("span")||[])].find(s=>s.getAttribute("aria-hidden")==="true"&&s.className.includes("grid")); const m=emoji?getComputedStyle(emoji).transform:null; o.push([Math.round(t),a?.textContent,m]); if(t<900) requestAnimationFrame(f); else r(o)})()}));
  await page.evaluate(()=>{const c=document.querySelectorAll("[data-testid=stack-card]")[2]; window.scrollTo(0, window.scrollY + c.getBoundingClientRect().top - innerHeight*0.25)});
  const s = await tr; const sc=s.map(x=>x[2]&&x[2].startsWith("matrix(")?+x[2].slice(7).split(",")[0]:1);
  return {names:[...new Set(s.map(x=>x[1]))], maxScale:Math.max(...sc), samples:s.filter((_,i)=>i%6===0).map(x=>[x[0],x[1],x[2]])};
});

await step("reorcMap", async()=>{
  await go("/work/reorc-data-platform");
  const fig = page.locator("[data-testid=module-ring]").first();
  const n = await fig.count();
  if (!n) return {error:"no module-ring"};
  await fig.scrollIntoViewIfNeeded(); await page.waitForTimeout(2500);
  await page.screenshot({path:OUT+"/reorc-map.jpg",type:"jpeg",quality:70});
  return await page.evaluate(()=>{const f=document.querySelector("[data-testid=module-ring]"); const els=[...f.querySelectorAll("*")].filter(e=>e.getBoundingClientRect().width>2); const ops=els.map(e=>+getComputedStyle(e).opacity); return {n:els.length, minOpacity:Math.min(...ops), h:f.getBoundingClientRect().height}});
});

await step("embeds", async()=>{
  const out={};
  for (const u of ["/work/ledgr","/work/lumicap"]) {
    await go(u);
    const H = await page.evaluate(()=>document.documentElement.scrollHeight);
    const blank=[]; 
    for (let y=0;y<H;y+=700){ await page.evaluate(v=>window.scrollTo(0,v),y); await page.waitForTimeout(1800);
      const m = await page.evaluate(()=>{const iframes=[...document.querySelectorAll("iframe")].map(f=>{const b=f.getBoundingClientRect();return {src:(f.src||"").slice(0,60), top:Math.round(b.top), h:Math.round(b.height), w:Math.round(b.width)}}).filter(x=>x.top<innerHeight&&x.top+x.h>0); const spin=[...document.querySelectorAll("[class*=spin],[role=progressbar],svg.animate-spin")].filter(e=>{const b=e.getBoundingClientRect();return b.top<innerHeight&&b.bottom>0}).length; return {iframes,spin}});
      if (m.iframes.length||m.spin) blank.push({y,...m});
    }
    out[u]=blank;
  }
  return out;
});
fs.writeFileSync(OUT+"/home2.json",JSON.stringify(res,null,1));
console.log(JSON.stringify(res,null,1));
await browser.close();
