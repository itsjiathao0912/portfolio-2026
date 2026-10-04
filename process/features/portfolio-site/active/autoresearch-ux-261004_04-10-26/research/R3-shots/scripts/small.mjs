import { createRequire } from "module";
const require = createRequire("/Users/knamnguyen/Documents/0-Programming/duma/package.json");
const { chromium } = require("playwright");
const browser = await chromium.launch();
const page = await (await browser.newContext({viewport:{width:1440,height:900}})).newPage();
await page.goto("http://localhost:3003/",{waitUntil:"load"}); await page.waitForTimeout(2500);
const H=await page.evaluate(()=>document.documentElement.scrollHeight); for(let y=0;y<H;y+=800){await page.evaluate(v=>scrollTo(0,v),y);await page.waitForTimeout(150)}
const r = await page.evaluate(()=>{const out={}; for(const el of document.querySelectorAll("p,a,span,li,time,figcaption,button,div")){ if(el.children.length>0) continue; const t=el.textContent.trim(); if(!t) continue; const fs=parseFloat(getComputedStyle(el).fontSize); if(fs<12){ const k=fs+"|"+(el.closest("[data-testid]")?.dataset.testid||el.className.toString().slice(0,30)); out[k]=out[k]||{n:0,ex:t.slice(0,40)}; out[k].n++; } } return out});
console.log(JSON.stringify(r,null,1)); await browser.close();
