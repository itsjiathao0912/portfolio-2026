import { createRequire } from "module";
const require = createRequire("/Users/knamnguyen/Documents/0-Programming/duma/package.json");
const { chromium } = require("playwright");
const b=await chromium.launch();
for(const W of [1440,390]){
 const c=await b.newContext({viewport:{width:W,height:900}}); const p=await c.newPage();
 await p.goto("http://localhost:3003/",{waitUntil:"load",timeout:90000}); await p.waitForTimeout(3000);
 await p.getByTestId('tile-engineer').click(); await p.waitForTimeout(1000);
 await p.getByTestId('visitor-poll').scrollIntoViewIfNeeded(); await p.waitForTimeout(2000);
 await p.locator('[data-testid^=poll-option-]').first().click(); await p.waitForTimeout(2000); await p.mouse.move(2,2); await p.waitForTimeout(500);
 console.log(W, await p.getByTestId('poll-note').textContent(), JSON.stringify(await p.evaluate(()=>[...document.querySelectorAll('[data-testid^=poll-bar-]')].map(e=>[e.dataset.mode,e.getBoundingClientRect().width|0,getComputedStyle(e).opacity]))));
 await p.getByTestId('visitor-poll').screenshot({path:`poll-voted-${W}.png`});
 await c.close();
}
await b.close();
