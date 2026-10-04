import { createRequire } from "module";
const require = createRequire("/Users/knamnguyen/Documents/0-Programming/duma/package.json");
const { chromium } = require("playwright");
const OUT=process.cwd(); const b=await chromium.launch();
for (const [w,h] of [[1440,900],[390,844]]) {
 const c=await b.newContext({viewport:{width:w,height:h},hasTouch:w<500,isMobile:w<500}); const p=await c.newPage();
 await p.goto("http://localhost:3003/",{waitUntil:"load",timeout:90000}); await p.waitForTimeout(3000);
 await p.locator('[role=radio]').nth(1).click(); await p.waitForTimeout(1500);
 const poll=p.locator('[data-testid*=poll]').first(); await poll.scrollIntoViewIfNeeded();
 const opt=poll.locator('[role=radio],button,label').nth(1); await opt.click().catch(e=>console.log('vote fail',String(e).slice(0,80)));
 await p.waitForTimeout(2500); await poll.scrollIntoViewIfNeeded(); await p.waitForTimeout(800);
 await p.screenshot({path:`${OUT}/poll-voted-${w}.png`});
 await p.evaluate(()=>scrollTo(0,0)); await p.waitForTimeout(600);
 const chip=p.getByText(/change/i).first(); console.log(w,'chip',await chip.count());
 await chip.click({timeout:5000}).catch(e=>console.log('chip fail')); await p.waitForTimeout(1500);
 await p.screenshot({path:`${OUT}/modal2-${w}.png`});
 await c.close();
}
await b.close();
