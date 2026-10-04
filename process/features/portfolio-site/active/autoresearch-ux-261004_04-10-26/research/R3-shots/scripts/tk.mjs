import { createRequire } from "module";
const require = createRequire("/Users/knamnguyen/Documents/0-Programming/duma/package.json");
const { chromium } = require("playwright");
const browser = await chromium.launch();
const page = await (await browser.newContext({viewport:{width:1440,height:900}})).newPage();
await page.goto("http://localhost:3003/",{waitUntil:"load"}); await page.waitForTimeout(2500);
console.log(JSON.stringify(await page.evaluate(()=>{const its=[...document.querySelectorAll("[data-testid=ticker-item]")]; return its.map(b=>({aria:b.closest("[aria-hidden=true]")?!0:!1, ti:b.getAttribute("tabindex"), inert:b.closest("[inert]")?!0:!1, txt:b.textContent.slice(0,10)}))})));
// tab count through ticker
await page.focus("[data-testid=ticker-item]"); 
// chip flip evidence: status text change per item
console.log(JSON.stringify(await page.evaluate(()=>[...document.querySelectorAll("[data-testid=ticker-item]")].slice(0,7).map(b=>[...b.querySelectorAll("span")].map(s=>s.textContent+"/"+getComputedStyle(s).transform.slice(0,20)).join(";")).slice(0,4))));
await browser.close();
