import { createRequire } from "module";
const require = createRequire("/Users/knamnguyen/Documents/0-Programming/duma/package.json");
const { chromium } = require("playwright"); import fs from "fs";
const OUT=process.cwd()+"/sole"; const b=await chromium.launch(); const meta=[];
const c=await b.newContext({viewport:{width:1440,height:900}}); const p=await c.newPage();
await p.goto("http://localhost:3003/",{waitUntil:"load",timeout:90000}); await p.waitForTimeout(3000);
await p.locator('[role=radio]').nth(1).click(); await p.waitForTimeout(1500);
const sh=await p.evaluate(()=>document.documentElement.scrollHeight);
for(let i=0;i<30;i++){
  const y=Math.round((sh-900)*i/29); await p.evaluate(y=>scrollTo(0,y),y); await p.waitForTimeout(1800);
  const gb=await p.evaluate(()=>{const g=document.querySelector('[data-testid=guide-character]'); if(!g)return null; const r=g.getBoundingClientRect(); return {x:r.x,y:r.y,w:r.width,h:r.height}});
  if(!gb) continue;
  const clip={x:Math.max(0,Math.round(gb.x-30)),y:Math.max(0,Math.round(gb.y-10)),width:Math.round(gb.w+60),height:Math.min(900-Math.max(0,Math.round(gb.y-10)),Math.round(gb.h+60))};
  await p.screenshot({path:`${OUT}/a${i}.png`,clip});
  await p.evaluate(()=>{document.querySelector('[data-testid=visitor-guide]').style.visibility='hidden'});
  await p.screenshot({path:`${OUT}/b${i}.png`,clip});
  await p.evaluate(()=>{document.querySelector('[data-testid=visitor-guide]').style.visibility=''});
  meta.push({i,clip,gb});
}
fs.writeFileSync(OUT+"/meta.json",JSON.stringify(meta)); await b.close();
