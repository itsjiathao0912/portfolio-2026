import { chromium, OUT, save } from "./lib.mjs";
const b = await chromium.launch();
const c = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const p = await c.newPage();
const errs=[]; p.on("pageerror",e=>errs.push(e.message.slice(0,150))); p.on("console",m=>{if(m.type()==="error")errs.push(m.text().slice(0,150))});
const go=async u=>{for(let k=0;k<3;k++){try{await p.goto("http://localhost:3003"+u,{waitUntil:"load",timeout:90000});return}catch(e){await p.waitForTimeout(3000)}}};
const shot=async n=>p.screenshot({path:`${OUT}/guide/${n}.jpg`,type:"jpeg",quality:70});
import fs from "fs"; fs.mkdirSync(OUT+"/guide",{recursive:true});
await go("/"); await p.waitForTimeout(2500);
// before role: guide present?
const pre = await p.evaluate(()=>!!document.querySelector('[data-testid="visitor-guide"]'));
// scroll to tiles and pick founder
await p.evaluate(()=>document.querySelector('[data-testid="visitor-strip"]').scrollIntoView({block:"center"}));
await p.waitForTimeout(800); await shot("00-tiles-before");
const tile = p.locator('[data-testid="visitor-strip"] button').nth(1); await tile.click();
await p.waitForTimeout(250); await shot("01-after-pick-250");
await p.waitForTimeout(900); await shot("02-after-pick-1150");
await p.waitForTimeout(1500); await shot("03-after-pick-2650");
const info = async()=>p.evaluate(()=>{const g=document.querySelector('[data-testid="visitor-guide"]'); if(!g) return null; const r=g.getBoundingClientRect(); const bub=document.querySelector('[data-testid="guide-bubble"]'); const out={x:Math.round(r.left),y:Math.round(r.top),w:Math.round(r.width),h:Math.round(r.height),frames:g.dataset.guideFrames||null,bubble:bub?bub.textContent.trim().slice(0,100):null};
 const lay=document.querySelector('[data-testid="visitor-guide-layer"]'); const kids=[...lay.querySelectorAll('button,[data-testid=guide-bubble]')].map(e=>{const q=e.getBoundingClientRect();return [e.textContent.trim().slice(0,18)||e.getAttribute("aria-label"),Math.round(q.left),Math.round(q.top),Math.round(q.width),Math.round(q.height)]}); 
 // overlap with text elements of page under guide group box
 let L=1e9,T=1e9,R=-1,B=-1; kids.forEach(k=>{L=Math.min(L,k[1]);T=Math.min(T,k[2]);R=Math.max(R,k[1]+k[3]);B=Math.max(B,k[2]+k[4])});
 const hits=[]; document.querySelectorAll("h1,h2,h3,p,a,button,img,li").forEach(e=>{ if(lay.contains(e)) return; const q=e.getBoundingClientRect(); if(q.width<4||q.height<4) return; const ix=Math.min(R,q.right)-Math.max(L,q.left), iy=Math.min(B,q.bottom)-Math.max(T,q.top); if(ix>6&&iy>6) hits.push(e.tagName+":"+(e.textContent||e.alt||"").trim().slice(0,28)+":"+Math.round(ix)+"x"+Math.round(iy))});
 return {...out,group:[L,T,R,B].map(Math.round),kids,hits:hits.slice(0,10)}});
const log=[]; log.push({t:"after-pick",...await info()});
// scroll through, capture drop-in/walk frames
let n=4;
for (const y of [1500,2600,3600,4700,6000,7500,9500,11500,13000,14500]) {
  await p.evaluate(v=>window.scrollTo({top:v,behavior:"instant"}),y);
  for (const dt of [150,350,500,900,1800]) { await p.waitForTimeout(dt===150?150:dt-[150,350,500,900,1800][[150,350,500,900,1800].indexOf(dt)-1]); await shot(`s${y}-t${dt}`); log.push({y,dt,...await info()}); }
}
save("guide-passive",log);
// engaged mode
await p.evaluate(()=>window.scrollTo({top:2600,behavior:"instant"})); await p.waitForTimeout(2500);
await p.locator('[data-testid="guide-walk-toggle"]').click(); await p.waitForTimeout(500); await shot("e0-engaged");
const el=[]; 
await p.keyboard.down("ArrowRight"); for(let i=0;i<4;i++){await p.waitForTimeout(220); await shot(`e1-walk-${i}`); el.push({k:"walk",...await info()})} await p.keyboard.up("ArrowRight");
await p.keyboard.press("ArrowUp"); for(let i=0;i<5;i++){await p.waitForTimeout(160); await shot(`e2-jump-${i}`); el.push({k:"jump",...await info()})}
await p.keyboard.down("ArrowLeft"); for(let i=0;i<3;i++){await p.waitForTimeout(250); await shot(`e3-left-${i}`)} await p.keyboard.up("ArrowLeft");
await p.keyboard.press("Enter"); await p.waitForTimeout(500); await shot("e4-next-line"); el.push({k:"enter",...await info()});
await p.keyboard.press("Escape"); await p.waitForTimeout(500); await shot("e5-released");
save("guide-engaged",el);
save("guide-meta",{pre,errs});
console.log(JSON.stringify({pre,errs,first:log[0]},null,1));
await b.close();
