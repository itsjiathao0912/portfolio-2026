import { createRequire } from "module";
const require = createRequire("/Users/knamnguyen/Documents/0-Programming/duma/package.json");
const { chromium } = require("playwright");
import fs from "fs";
const OUT = process.cwd();
const b = await chromium.launch();
const out = {};
for (const [w,h] of [[1440,900],[768,1024],[390,844]]) {
  const c = await b.newContext({ viewport:{width:w,height:h}, hasTouch:w<500, isMobile:w<500 });
  const p = await c.newPage();
  await p.goto("http://localhost:3003/",{waitUntil:"load",timeout:90000}); await p.waitForTimeout(2500);
  const ctl = p.locator('[data-testid="visitor-control"]');
  await ctl.scrollIntoViewIfNeeded(); await p.waitForTimeout(800);
  await p.screenshot({path:`${OUT}/picker-before-${w}.png`});
  const title = await p.locator('[data-testid="visitor-title"]').innerText();
  const box = await ctl.boundingBox();
  const tiles = await p.locator('[role=radio]').count();
  const tb = await p.evaluate(()=>[...document.querySelectorAll('[role=radio]')].map(e=>{const r=e.getBoundingClientRect();return [Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)]}));
  out[w]={title,box,tiles,tb};
  await p.locator('[role=radio]').nth(2).click(); await p.waitForTimeout(2200);
  await ctl.scrollIntoViewIfNeeded().catch(()=>{});
  await p.screenshot({path:`${OUT}/picker-after-${w}.png`});
  const after = await p.evaluate(()=>{
    const q=s=>document.querySelector(s); const r=e=>{if(!e)return null;const b=e.getBoundingClientRect();return [Math.round(b.x),Math.round(b.y+scrollY),Math.round(b.width),Math.round(b.height)]};
    return {ctl:r(q('[data-testid=visitor-control]')),panel:r(q('[data-testid=visitor-panel]')),strip:r(q('[data-testid=visitor-strip]')),stats:r(q('[data-testid=visitor-stats-strip]')),loc:r(q('[data-testid=visitor-location]')),locText:q('[data-testid=visitor-location]')?.innerText, summary:q('[data-testid=visitor-summary]')?.innerText, tiles:[...document.querySelectorAll('[role=radio]')].map(e=>r(e))};
  });
  out[w].after=after;
  // guide overlap sweep
  const sh = await p.evaluate(()=>document.documentElement.scrollHeight); out[w].sh=sh;
  const hits=[]; let guideSeen=0;
  for (let i=0;i<30;i++){
    const y=Math.round((sh-h)*i/29);
    await p.evaluate(y=>window.scrollTo(0,y),y); await p.waitForTimeout(1300);
    const r = await p.evaluate(()=>{
      const g=document.querySelector('[data-testid=guide-character]'); if(!g) return null;
      const gb=g.getBoundingClientRect(); if(gb.width===0) return null;
      const sel='h1,h2,h3,p,figcaption,li,blockquote,[data-testid=visitor-stats-strip] *';
      const o=[];
      for(const e of document.querySelectorAll(sel)){
        if(e.closest('[data-testid=visitor-guide-layer]'))continue;
        if(!e.childNodes.length||!(e.textContent||'').trim())continue;
        // text rect via range
        const rg=document.createRange(); rg.selectNodeContents(e); 
        for(const b of rg.getClientRects()){
          const ix=Math.min(gb.right,b.right)-Math.max(gb.left,b.left), iy=Math.min(gb.bottom,b.bottom)-Math.max(gb.top,b.top);
          if(ix>6&&iy>6){o.push([e.tagName,(e.textContent||'').trim().slice(0,30),Math.round(ix),Math.round(iy)]);break;}
        }
      }
      return {g:[Math.round(gb.x),Math.round(gb.y),Math.round(gb.width),Math.round(gb.height)],o};
    });
    if(r){guideSeen++; if(r.o.length)hits.push({y,...r});}
    if(i==6||i==15) await p.screenshot({path:`${OUT}/guide-${w}-${i}.png`});
  }
  out[w].guideSeen=guideSeen; out[w].overlapCount=hits.length; out[w].hits=hits.slice(0,12);
  await c.close();
}
fs.writeFileSync(OUT+"/s2.json",JSON.stringify(out,null,1));
await b.close();
