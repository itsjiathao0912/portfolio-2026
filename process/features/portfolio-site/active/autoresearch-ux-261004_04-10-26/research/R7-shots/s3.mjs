import { createRequire } from "module";
const require = createRequire("/Users/knamnguyen/Documents/0-Programming/duma/package.json");
const { chromium } = require("playwright");
import fs from "fs";
const b = await chromium.launch(); const res={};
for (const [w,h] of [[1440,900],[768,1024],[390,844]]) for (const path of ["/","/about","/work/gocrypto","/work/cortex"]) {
  const c = await b.newContext({ viewport:{width:w,height:h}, hasTouch:w<500, isMobile:w<500 });
  const p = await c.newPage(); const errs=[]; p.on("pageerror",e=>errs.push(e.message.slice(0,90)));
  try{ await p.goto("http://localhost:3003"+path,{waitUntil:"load",timeout:60000}); await p.waitForTimeout(2200);
  const n=(path==="/"?"home":path.slice(1).replace("/","-"))+"-"+w;
  res[n]={sh:await p.evaluate(()=>document.documentElement.scrollHeight),hx:await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),errs};
  await p.screenshot({path:`${n}-top.jpg`,type:"jpeg",quality:60});
  const mid = path==="/"?1800:path==="/about"?900:1500;
  await p.evaluate(y=>scrollTo(0,y),mid); await p.waitForTimeout(900);
  await p.screenshot({path:`${n}-mid.jpg`,type:"jpeg",quality:60});
  }catch(e){res[path+w]=e.message.slice(0,80)}
  await c.close();
}
fs.writeFileSync("s3.json",JSON.stringify(res,null,1)); await b.close();
