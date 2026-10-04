import { chromium, OUT } from "./lib.mjs";
const b = await chromium.launch(); const c = await b.newContext({ viewport:{width:1440,height:900}}); const p=await c.newPage();
await p.goto("http://localhost:3003/",{waitUntil:"load",timeout:120000}); await p.waitForTimeout(1500);
for (const [i,sel] of [[0,"#work-title"],[1,"[data-testid=section-linkedin] h2"]]) { await p.evaluate(s=>{const e=document.querySelector(s); const y=e.getBoundingClientRect().top+scrollY-35; scrollTo(0,y)},sel); await p.waitForTimeout(900); await p.screenshot({path:`${OUT}/motion/nav-under-${i}.png`,clip:{x:260,y:0,width:920,height:140}}); }
await p.goto("http://localhost:3003/work",{waitUntil:"load",timeout:120000}); await p.waitForTimeout(1500);
await p.evaluate(()=>scrollTo(0,420)); await p.waitForTimeout(900); await p.screenshot({path:`${OUT}/motion/nav-under-2.png`,clip:{x:260,y:0,width:920,height:140}});
// stamp zoom
await p.goto("http://localhost:3003/",{waitUntil:"load",timeout:120000}); await p.waitForTimeout(1500);
await p.evaluate(()=>{const e=document.querySelector("[data-testid=card-stamp]"); scrollTo(0,e.getBoundingClientRect().top+scrollY-300)}); await p.waitForTimeout(1500);
const s=await p.locator("[data-testid=card-stamp]").first().boundingBox(); await p.screenshot({path:`${OUT}/motion/stamp.png`,clip:{x:s.x-20,y:s.y-10,width:s.width+40,height:s.height+20}});
const g=p.locator("[data-testid=globe-card]"); 
await b.close();
