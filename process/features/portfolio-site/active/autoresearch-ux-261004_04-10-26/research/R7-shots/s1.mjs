import { createRequire } from "module";
const require = createRequire("/Users/knamnguyen/Documents/0-Programming/duma/package.json");
const { chromium } = require("playwright");
import fs from "fs";
const OUT = process.cwd()+"/R7-shots";
const b = await chromium.launch();
const res = {};
for (const [w,h] of [[1440,900],[768,1024],[390,844]]) {
  for (const path of ["/","/about","/work/gocrypto","/work/cortex"]) {
    const c = await b.newContext({ viewport:{width:w,height:h}, hasTouch:w<500, isMobile:w<500 });
    const p = await c.newPage(); const errs=[];
    p.on("pageerror",e=>errs.push(e.message.slice(0,100)));
    await p.goto("http://localhost:3003"+path,{waitUntil:"load",timeout:90000}); await p.waitForTimeout(2500);
    const sh = await p.evaluate(()=>document.documentElement.scrollHeight);
    const name = (path==="/"?"home":path.slice(1).replace("/","-"))+"-"+w;
    res[name]={sh,errs};
    // scroll through to trigger lazy
    for (let y=0;y<sh;y+=700){await p.evaluate(y=>window.scrollTo(0,y),y);await p.waitForTimeout(120);}
    await p.evaluate(()=>window.scrollTo(0,0)); await p.waitForTimeout(600);
    await p.screenshot({path:`${OUT}/${name}-full.jpg`,fullPage:true,quality:55,type:"jpeg"}).catch(e=>res[name].err=e.message.slice(0,80));
    await c.close();
  }
}
fs.writeFileSync(OUT+"/s1.json",JSON.stringify(res,null,1));
await b.close();
