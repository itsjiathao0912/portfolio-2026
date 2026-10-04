import { createRequire } from "module";
const require = createRequire("/Users/knamnguyen/Documents/0-Programming/duma/package.json");
const { chromium } = require("playwright");
const OUT = "/Users/knamnguyen/Documents/0-Programming/portfolio-2026/process/features/portfolio-site/active/autoresearch-ux-261004_04-10-26/research/R2-shots/motion";
const browser = await chromium.launch();
const page = await (await browser.newContext({viewport:{width:1440,height:900}})).newPage();
const errs=[]; page.on("pageerror",e=>errs.push(e.message.slice(0,90)));
async function find(url, text, name){
  await page.goto("http://localhost:3003"+url,{waitUntil:"load"}); await page.waitForTimeout(1200);
  const y = await page.evaluate((t)=>{const el=[...document.querySelectorAll("*")].find(e=>e.children.length===0&&e.textContent.trim().startsWith(t)); if(!el) return null; return el.getBoundingClientRect().top+scrollY},text);
  if(y==null){console.log(name,"text not found");return;}
  // scroll gradually to it
  for(let s=0;s<y-250;s+=500){await page.evaluate(v=>scrollTo(0,v),s);await page.waitForTimeout(120);} await page.evaluate(v=>scrollTo(0,v),y-250); await page.waitForTimeout(3500);
  await page.screenshot({path:`${OUT}/empty-${name}.jpg`,type:"jpeg",quality:70});
}
await find("/work/reorc-data-platform","The platform areas","reorc");
await find("/work/ledgr","The public site","ledgr");
console.log(errs.length, [...new Set(errs)]);
await browser.close();
