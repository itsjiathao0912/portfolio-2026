import { createRequire } from "module";
const require = createRequire("/Users/knamnguyen/Documents/0-Programming/duma/package.json");
const { chromium } = require("playwright");
const b=await chromium.launch();
for(const W of [1440,768,390]){
 const c=await b.newContext({viewport:{width:W,height:W<500?844:900},hasTouch:W<500,isMobile:W<500}); const p=await c.newPage();
 await p.goto("http://localhost:3003/",{waitUntil:"load",timeout:90000}); await p.waitForTimeout(4000);
 await p.locator('[role=radio]').nth(2).click(); await p.waitForTimeout(1500);
 await p.evaluate(()=>scrollTo(0,0)); await p.waitForTimeout(800);
 await p.screenshot({path:`home-picked-${W}.png`});
 const ch=p.getByRole('button',{name:/change/i}).first(); console.log(W,'change',await ch.count());
 await ch.click(); await p.waitForTimeout(1500); await p.screenshot({path:`modal-${W}.png`});
 console.log(JSON.stringify(await p.evaluate(()=>{const m=document.querySelector('[data-testid=visitor-modal]')||document.querySelector('[role=dialog]'); if(!m)return null; return [...m.querySelectorAll('[role=radio]')].map(e=>{const r=e.getBoundingClientRect();return [Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)]})})));
 await c.close();
}
await b.close();
