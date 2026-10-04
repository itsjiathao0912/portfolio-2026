import { createRequire } from "module";
const require = createRequire("/Users/knamnguyen/Documents/0-Programming/duma/package.json");
const { chromium } = require("playwright");
const b=await chromium.launch(); const c=await b.newContext({viewport:{width:1440,height:900}}); const p=await c.newPage();
await p.goto("http://localhost:3003/",{waitUntil:"load",timeout:90000}); await p.waitForTimeout(3000);
const t=p.locator('[role=radio]').nth(1); await t.scrollIntoViewIfNeeded(); await t.click(); await p.waitForTimeout(2000);
const sh=await p.evaluate(()=>document.documentElement.scrollHeight);
for(const i of [4,5,8,9,10]){ const y=Math.round((sh-900)*i/29); await p.evaluate(y=>scrollTo(0,y),y); await p.waitForTimeout(2500); await p.screenshot({path:`bub-${i}.png`});
 console.log(i, await p.evaluate(()=>{const a=document.querySelector('[data-testid=guide-bubble-anchor]'); const g=document.querySelector('[data-testid=guide-character]').getBoundingClientRect(); const r=a&&a.firstElementChild&&a.firstElementChild.getBoundingClientRect(); return JSON.stringify({g:[g.x|0,g.y|0],bub:r&&[r.x|0,r.y|0,r.width|0,r.height|0],txt:a&&a.textContent.slice(0,50)})})); }
await b.close();
