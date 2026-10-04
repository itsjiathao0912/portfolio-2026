import { createRequire } from "module";
const require = createRequire("/Users/knamnguyen/Documents/0-Programming/duma/package.json");
const { chromium } = require("playwright");
const browser = await chromium.launch();
const page = await (await browser.newContext({viewport:{width:1440,height:900}})).newPage();
await page.goto("http://localhost:3003/work/reorc-data-platform",{waitUntil:"load"}); await page.waitForTimeout(1500);
const st = ()=>page.evaluate(()=>{const f=[...document.querySelectorAll("figure")]; return f.map(fig=>{const els=[...fig.querySelectorAll("[style*=opacity]")]; return fig.getAttribute("data-viz-kind")||fig.dataset.kind||fig.firstElementChild?.textContent?.slice(0,24); }).join(" | ")});
const res = await page.evaluate(()=>[...document.querySelectorAll("figure")].map(fig=>({k:fig.dataset.vizKind||fig.className.slice(0,20), t:fig.innerText.slice(0,28).replace(/\n/g," "), minOp:Math.min(...[...fig.querySelectorAll("*")].map(e=>+getComputedStyle(e).opacity)), top:Math.round(fig.getBoundingClientRect().top+scrollY)})));
console.log(JSON.stringify(res));
// scroll to each and recheck
for (const r of res) { await page.evaluate(v=>scrollTo(0,v-300),r.top); await page.waitForTimeout(1800); const o = await page.evaluate((t)=>{const fig=[...document.querySelectorAll("figure")].find(f=>f.innerText.slice(0,28).replace(/\n/g," ")===t); return Math.min(...[...fig.querySelectorAll("*")].map(e=>+getComputedStyle(e).opacity))},r.t); console.log(r.t, "minOpacity after view:", o); }
await browser.close();
