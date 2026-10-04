import { chromium, OUT, save } from "./lib.mjs";
const b = await chromium.launch();
const c = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await c.newPage();
for(let k=0;k<3;k++){try{await p.goto("http://localhost:3003/",{waitUntil:"load",timeout:90000});break}catch(e){await p.waitForTimeout(3000)}}
await p.waitForTimeout(2000);
await p.locator('[data-testid="visitor-strip"] button').nth(1).click(); await p.waitForTimeout(2500);
await p.evaluate(()=>{window.__s=[];const g=document.querySelector('[data-testid="visitor-guide"]');const t0=performance.now();const f=()=>{const r=g.getBoundingClientRect();window.__s.push([Math.round(performance.now()-t0),+r.left.toFixed(1),+r.top.toFixed(1),document.querySelector('[data-testid="guide-bubble"]')?1:0]);window.__raf=requestAnimationFrame(f)};f()});
const run=async(label,fn,ms)=>{await p.evaluate(()=>{window.__s.length=0}); await fn(); await p.waitForTimeout(ms); return {label, s: await p.evaluate(()=>window.__s.slice())}};
const out=[];
out.push(await run("scroll-3000",()=>p.evaluate(()=>window.scrollTo({top:3000,behavior:"instant"})),3000));
out.push(await run("scroll-6200-smooth",()=>p.evaluate(()=>window.scrollTo({top:6200,behavior:"smooth"})),4500));
await p.locator('[data-testid="guide-walk-toggle"]').click(); await p.waitForTimeout(400);
out.push(await run("walk-left",async()=>{await p.keyboard.down("ArrowLeft");await p.waitForTimeout(1200);await p.keyboard.up("ArrowLeft")},1500));
out.push(await run("jump",async()=>{await p.keyboard.press("ArrowUp")},1500));
out.push(await run("walk-right",async()=>{await p.keyboard.down("ArrowRight");await p.waitForTimeout(800);await p.keyboard.up("ArrowRight")},1200));
save("guide-motion",out);
for(const o of out){const s=o.s;let maxJump=0,maxStep=0,moving=0;for(let i=1;i<s.length;i++){const dx=Math.abs(s[i][1]-s[i-1][1]),dy=Math.abs(s[i][2]-s[i-1][2]);const st=Math.hypot(dx,dy);maxStep=Math.max(maxStep,st);if(st>0.3)moving++}
 const xs=s.map(r=>r[1]),ys=s.map(r=>r[2]);const dts=s.slice(1).map((r,i)=>r[0]-s[i][0]);
 console.log(o.label,"samples",s.length,"x",Math.min(...xs),Math.max(...xs),"y",Math.min(...ys),Math.max(...ys),"maxStep/frame",maxStep.toFixed(1),"movingFrames",moving,"maxDt",Math.max(...dts));}
await b.close();
