import { createRequire } from "module";
const require = createRequire("/Users/knamnguyen/Documents/0-Programming/duma/package.json");
const { chromium } = require("playwright");
const b=await chromium.launch();
for(const W of [1440,390]){
 const c=await b.newContext({viewport:{width:W,height:W<500?844:900},hasTouch:W<500,isMobile:W<500}); const p=await c.newPage();
 await p.goto("http://localhost:3003/",{waitUntil:"load",timeout:90000}); await p.waitForTimeout(4000);
 await p.locator('[role=radio]').nth(2).click(); await p.waitForTimeout(1500);
 const poll=p.locator('[data-testid=visitor-poll]').first();
 console.log(W,'polls',await poll.count());
 await poll.evaluate(e=>e.scrollIntoView({block:'center'})); await p.waitForTimeout(1500); await p.screenshot({path:`poll-pre-${W}.png`});
 const opt=p.locator('[data-testid^=poll-option-]').nth(1); await opt.click(); await p.waitForTimeout(2500);
 await poll.evaluate(e=>e.scrollIntoView({block:'center'})); await p.waitForTimeout(800); await p.screenshot({path:`poll-voted-${W}.png`});
 console.log(JSON.stringify(await p.evaluate(()=>{const rows=[...document.querySelectorAll('[data-testid^=poll-option-]')].map(r=>{const id=r.getAttribute('data-testid').slice(12); const f=document.querySelector(`[data-testid="poll-faces-${id}"]`); const v=document.querySelector(`[data-testid="poll-value-${id}"]`); return {id,val:v&&v.textContent,faces:f?f.children.length:null,h:Math.round(r.getBoundingClientRect().height)}}); const t=document.querySelector('[data-testid=visitor-poll]').innerText; return {rows,tail:t.slice(-160)}})));
 // change role modal
 const ch=p.locator('[data-testid=change]').first(); console.log('change',await ch.count());
 if(await ch.count()){ await ch.scrollIntoViewIfNeeded(); await ch.click().catch(e=>console.log('clickerr')); await p.waitForTimeout(1200); await p.screenshot({path:`modal-${W}.png`});
  console.log(JSON.stringify(await p.evaluate(()=>{const m=document.querySelector('[data-testid=visitor-modal]'); if(!m)return null; const t=[...m.querySelectorAll('[role=radio]')].map(e=>{const r=e.getBoundingClientRect();return [Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)]}); return t})));}
 await c.close();
}
await b.close();
