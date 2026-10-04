import { createRequire } from "module";
const require = createRequire("/Users/knamnguyen/Documents/0-Programming/duma/package.json");
const { chromium } = require("playwright");
import fs from "fs";
const b = await chromium.launch(); const res={};
for (const [w,h] of [[1440,900],[768,1024],[390,844]]) for (const [n,path,ys] of [["cortex","/work/cortex-sentinel",[0,1400,3200]],["gocrypto","/work/gocrypto",[0,2000]],["about","/about",[0,1600]],["home","/",[0,500]]]) {
  const c = await b.newContext({ viewport:{width:w,height:h}, hasTouch:w<500, isMobile:w<500 }); const p = await c.newPage();
  await p.goto("http://localhost:3003"+path,{waitUntil:"load",timeout:60000}); await p.waitForTimeout(2000);
  res[n+w]=await p.evaluate(()=>[document.documentElement.scrollHeight,document.documentElement.scrollWidth>innerWidth]);
  for (const y of ys){ await p.evaluate(y=>scrollTo(0,y),y); await p.waitForTimeout(900); await p.screenshot({path:`${n}-${w}-${y}.jpg`,type:"jpeg",quality:60}); }
  await c.close();
}
fs.writeFileSync("s5.json",JSON.stringify(res)); await b.close();
