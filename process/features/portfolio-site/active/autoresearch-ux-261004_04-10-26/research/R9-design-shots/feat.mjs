import { createRequire } from "module";
const require = createRequire("/Users/knamnguyen/Documents/0-Programming/duma/package.json");
const { chromium } = require("playwright"); import fs from "fs";
const b=await chromium.launch(); const R={};
for(const W of [1440,768,390]){
  const H=W<500?844:900;
  const c=await b.newContext({viewport:{width:W,height:H},hasTouch:W<500,isMobile:W<500}); const p=await c.newPage(); const errs=[]; p.on("pageerror",e=>errs.push(String(e))); p.on("console",m=>{if(m.type()==="error")errs.push(m.text().slice(0,120))});
  await p.goto("http://localhost:3003/?demo-countries",{waitUntil:"load",timeout:90000}); await p.waitForTimeout(6000);
  const _ev=p.evaluate.bind(p); p.evaluate=async(...a)=>{for(let k=0;k<4;k++){try{return await _ev(...a)}catch(e){await p.waitForTimeout(1500)}}return null};
  await p.screenshot({path:`home-${W}-top.png`});
  const o={}; 
  o.sw=await p.evaluate(()=>[document.documentElement.scrollWidth,innerWidth,document.documentElement.scrollHeight]);
  // picker tiles geometry
  const sec=p.locator('[data-testid=visitor-strip]').first(); if(await sec.count()){ await sec.scrollIntoViewIfNeeded(); await p.waitForTimeout(800); await p.screenshot({path:`picker-${W}.png`});}
  o.tiles=await p.evaluate(()=>[...document.querySelectorAll('[role=radio]')].map(e=>{const r=e.getBoundingClientRect(); const lab=e.querySelector('[data-testid=visitor-title]'); const svg=e.querySelector('svg'); const s=svg&&svg.getBoundingClientRect(); const l=lab&&lab.getBoundingClientRect(); return {w:Math.round(r.width),h:Math.round(r.height),x:Math.round(r.x),y:Math.round(r.y),svgBottom:s&&Math.round(s.bottom-r.y),labTop:l&&Math.round(l.top-r.y),labH:l&&Math.round(l.height),svgTop:s&&Math.round(s.top-r.y),svgH:s&&Math.round(s.height)}}));
  // flags
  const fl=p.locator('[data-testid=visitor-countries]').first(); if(await fl.count()){ await fl.scrollIntoViewIfNeeded(); await p.waitForTimeout(600); await p.screenshot({path:`flags-${W}.png`}); o.flags=await p.evaluate(()=>{const f=document.querySelector('[data-testid=visitor-countries]'); const li=[...f.querySelectorAll('[data-testid^=country-]')].filter(e=>/^country-[A-Z]/.test(e.getAttribute('data-testid'))); const r=f.getBoundingClientRect(); return {n:li.length,w:Math.round(r.width),h:Math.round(r.height),tips:document.querySelectorAll('[data-testid^=country-tip-]').length,text:f.parentElement.innerText.slice(0,80)}}); 
    const first=p.locator('[data-testid^=country-]:not([data-testid^=country-tip])').nth(1); if(await first.count()){ await first.hover(); await p.waitForTimeout(500); await p.screenshot({path:`flag-tip-${W}.png`}); o.tipVisible=await p.evaluate(()=>[...document.querySelectorAll('[data-testid^=country-tip-]')].map(e=>{const cs=getComputedStyle(e);const r=e.getBoundingClientRect();return {t:e.textContent.slice(0,20),op:cs.opacity,vis:cs.visibility,w:Math.round(r.width),x:Math.round(r.x)}}).filter(x=>x.op>0.5&&x.vis!=='hidden').slice(0,3)); } }
  // poll
  const poll=p.locator('[data-testid=visitor-poll]').first(); if(await poll.count()){ await poll.scrollIntoViewIfNeeded(); await p.waitForTimeout(600); const opt=p.locator('[data-testid^=poll-option-]').first(); if(await opt.count()){ await opt.click().catch(()=>{}); await p.waitForTimeout(1500);} await poll.scrollIntoViewIfNeeded(); await p.screenshot({path:`poll-${W}.png`});
    o.poll=await p.evaluate(()=>{const rows=[...document.querySelectorAll('[data-testid^=poll-option-]')].map(r=>{const id=r.getAttribute('data-testid').replace('poll-option-',''); const v=document.querySelector(`[data-testid=poll-value-${id}]`); const f=document.querySelector(`[data-testid=poll-faces-${id}]`); return {id,val:v&&v.textContent,faces:f?f.querySelectorAll('svg,img').length:0,bar:!!document.querySelector(`[data-testid=poll-bar-${id}]`)&&getComputedStyle(document.querySelector(`[data-testid=poll-bar-${id}]`)).backgroundColor}}); const sum=document.querySelector('[data-testid=visitor-poll]').innerText.slice(0,260); return {rows,sum}}); }
  // selected work pill vs title
  o.work=await p.evaluate(()=>{const s=document.querySelector('[data-testid=section-work]'); if(!s)return null; const h=s.querySelector('h2'); const pill=s.querySelector('[data-testid=visitor-chip]')||document.querySelector('[data-testid=visitor-chip]'); const hr=h&&h.getBoundingClientRect(); const pr=pill&&pill.getBoundingClientRect(); return {h:hr&&[Math.round(hr.top+scrollY),Math.round(hr.height),h.innerText.slice(0,30)],pill:pr&&[Math.round(pr.top+scrollY),Math.round(pr.height)]}});
  // stamp
  o.stamps=await p.evaluate(()=>[...document.querySelectorAll('[data-testid=card-stamp]')].slice(0,2).map(e=>{const r=e.getBoundingClientRect(); return [Math.round(r.width),Math.round(r.height)]}));
  // emoji
  o.emoji=await p.evaluate(()=>{const e=[...document.querySelectorAll('[data-testid=project-emoji]')]; return {n:e.length,tags:[...new Set(e.map(x=>x.tagName+(x.querySelector('img')?'>img':'')))] ,src:[...new Set(e.map(x=>(x.querySelector('img')||x).getAttribute('src')||''))].slice(0,12), card:document.querySelectorAll('[data-testid=project-card] [data-testid=project-emoji], [data-testid=project-card] img[src*=emoji]').length}});
  o.errs=errs; R[W]=o; await c.close();
}
fs.writeFileSync('feat.json',JSON.stringify(R,null,1)); await b.close(); console.log(JSON.stringify(R).slice(0,3000));
