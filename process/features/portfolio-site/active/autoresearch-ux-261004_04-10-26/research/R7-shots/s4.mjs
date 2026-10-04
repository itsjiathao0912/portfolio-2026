import { createRequire } from "module";
const require = createRequire("/Users/knamnguyen/Documents/0-Programming/duma/package.json");
const { chromium } = require("playwright");
import fs from "fs";
const b = await chromium.launch(); const r={};
// change-role modal
const c = await b.newContext({ viewport:{width:1440,height:900} }); const p = await c.newPage();
await p.goto("http://localhost:3003/",{waitUntil:"load"}); await p.waitForTimeout(2000);
await p.locator('[role=radio]').nth(0).click(); await p.waitForTimeout(1500);
// find chip
const chip = p.locator('[data-testid=visitor-chip], button:has-text("Change")').first();
r.chipCount = await p.locator('[data-testid=visitor-chip]').count();
await p.evaluate(()=>scrollTo(0,0)); await p.waitForTimeout(800);
await p.screenshot({path:"chip-top.png"});
if (r.chipCount) { await p.locator('[data-testid=visitor-chip]').first().click(); await p.waitForTimeout(1500); await p.screenshot({path:"modal.png"});
 r.modal = await p.evaluate(()=>{const d=document.querySelector('[role=dialog]'); if(!d)return null; return [...d.querySelectorAll('[role=radio]')].map(e=>{const b=e.getBoundingClientRect();return [Math.round(b.x),Math.round(b.y),Math.round(b.width),Math.round(b.height)]}); });}
fs.writeFileSync("s4.json",JSON.stringify(r)); await b.close();
